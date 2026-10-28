import re
from typing import List, Dict, Any, Optional
from backend.app.models.schemas import SeverityEnum, FindingSchema

def redact_sensitive_value(val: str) -> str:
    """Safely redact sensitive values without leaking them to UI, logs, or AI."""
    cleaned = val.strip()
    if len(cleaned) <= 6:
        return "[REDACTED_SECRET]"
    prefix = cleaned[:3]
    suffix = cleaned[-2:]
    return f"{prefix}***REDACTED***{suffix}"

# Secret detection patterns with high precision to avoid false positives
SECRET_PATTERNS = [
    {
        "id": "SEC-AWS-KEY",
        "category": "Exposed Credentials",
        "severity": SeverityEnum.CRITICAL,
        "title": "Suspected AWS Access Key ID Detected",
        "pattern": re.compile(r'\b(AKIA[0-9A-Z]{16})\b'),
        "explanation": "An AWS Access Key ID appears to be hardcoded in the codebase. If leaked, an attacker could access your AWS infrastructure.",
        "remediation": "Revoke this key immediately via AWS IAM, store credentials in environment variables or an AWS credentials profile, and add sensitive files to .gitignore."
    },
    {
        "id": "SEC-GH-TOKEN",
        "category": "Exposed Credentials",
        "severity": SeverityEnum.CRITICAL,
        "title": "Suspected GitHub Personal Access Token Detected",
        "pattern": re.compile(r'\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{40,})\b'),
        "explanation": "A GitHub Personal Access Token was found in source files. This could grant write or admin access to your repositories.",
        "remediation": "Revoke the token immediately in GitHub Settings -> Developer settings -> Personal access tokens. Use environment secrets instead."
    },
    {
        "id": "SEC-PRIVATE-KEY",
        "category": "Cryptographic Secrets",
        "severity": SeverityEnum.CRITICAL,
        "title": "Private Cryptographic Key Block Discovered",
        "pattern": re.compile(r'-----BEGIN (?:RSA|OPENSSH|EC|DSA|PGP)? PRIVATE KEY-----'),
        "explanation": "A private cryptographic key block is stored directly in the repository. Private keys should never be committed.",
        "remediation": "Remove the private key from version control, regenerate the keypair, and store the private key in a secure keystore or encrypted vault."
    },
    {
        "id": "SEC-SLACK-TOKEN",
        "category": "Exposed Credentials",
        "severity": SeverityEnum.HIGH,
        "title": "Suspected Slack API Token",
        "pattern": re.compile(r'\b(xox[baprs]-[0-9a-zA-Z]{10,48})\b'),
        "explanation": "A Slack API token was found hardcoded. It can allow unauthorized workspace message reading and posting.",
        "remediation": "Revoke this token from your Slack App management portal and inject it via runtime environment variables."
    },
    {
        "id": "SEC-STRIPE-KEY",
        "category": "Exposed Credentials",
        "severity": SeverityEnum.CRITICAL,
        "title": "Live Stripe Secret Key Detected",
        "pattern": re.compile(r'\b(sk_live_[0-9a-zA-Z]{24})\b'),
        "explanation": "A live Stripe API secret key was detected. This allows direct access to process transactions or view customer financial data.",
        "remediation": "Roll the secret key immediately in the Stripe Dashboard and ensure live keys are never stored in version-controlled files."
    },
    {
        "id": "SEC-HARDCODED-PASSWORD",
        "category": "Hardcoded Secrets",
        "severity": SeverityEnum.HIGH,
        "title": "Potential Hardcoded Password or Secret Assignment",
        "pattern": re.compile(r'(?i)\b(?:password|passwd|secret_key|api_secret)\s*[:=]\s*["\']([^"\'\r\n]{8,})["\']'),
        "explanation": "A password or secret key string assignment was found in the source code.",
        "remediation": "Store secrets in environment variables or a .env file that is excluded from Git tracking.",
        "filter_placeholders": True
    }
]

# Code quality and security vulnerability patterns
CODE_VULN_PATTERNS = [
    {
        "id": "VULN-EVAL",
        "category": "Dangerous Execution",
        "severity": SeverityEnum.HIGH,
        "title": "Dangerous eval() or exec() Usage",
        "pattern": re.compile(r'\b(?:eval|exec)\s*\('),
        "explanation": "Dynamic code execution functions evaluate arbitrary code strings and can lead to Remote Code Execution (RCE) if user input reaches them.",
        "remediation": "Refactor logic to use safe parsers (like ast.literal_eval for Python data or JSON.parse for JavaScript) rather than arbitrary evaluation."
    },
    {
        "id": "VULN-INSECURE-DESERIALIZATION",
        "category": "Insecure Deserialization",
        "severity": SeverityEnum.HIGH,
        "title": "Potentially Insecure Object Deserialization",
        "pattern": re.compile(r'\b(?:pickle\.loads|yaml\.load\([^,)]+\))'),
        "explanation": "Deserializing untrusted data with pickle or unloader YAML can trigger arbitrary code execution during object construction.",
        "remediation": "Use safe serializers like json, or with PyYAML always pass Loader=yaml.SafeLoader or use yaml.safe_load()."
    },
    {
        "id": "VULN-DEBUG-ENABLED",
        "category": "Configuration Weakness",
        "severity": SeverityEnum.MEDIUM,
        "title": "Debug Mode Enabled in Application Code",
        "pattern": re.compile(r'(?i)\b(?:DEBUG\s*=\s*True|app\.run\([^)]*debug\s*=\s*True)'),
        "explanation": "Running web applications with debug mode enabled can leak stack traces, environment variables, and interactive debug consoles to attackers.",
        "remediation": "Read debug flags from environment variables and ensure DEBUG defaults to False in production deployments."
    },
    {
        "id": "VULN-SUBPROCESS-SHELL",
        "category": "Dangerous Execution",
        "severity": SeverityEnum.MEDIUM,
        "title": "Subprocess Invocation with shell=True",
        "pattern": re.compile(r'\bsubprocess\.(?:Popen|run|call|check_output)\([^)]*shell\s*=\s*True'),
        "explanation": "Spawning subprocesses with shell=True invokes a system shell, exposing the process to command injection if command strings contain unescaped input.",
        "remediation": "Pass arguments as a list (e.g. ['git', 'status']) and set shell=False."
    }
]

# Known non-secret placeholders to avoid false positives
PLACEHOLDERS = {
    "your_password_here", "password123", "changeme", "example", "secret", "dummy_token",
    "placeholder", "xxxxxxxx", "your_secret", "replace_me", "test_secret", "admin123"
}

def is_placeholder(val: str) -> bool:
    normalized = val.strip().lower()
    if normalized in PLACEHOLDERS:
        return True
    if "your_" in normalized or "example_" in normalized or "<" in normalized or ">" in normalized:
        return True
    return False

def check_file_content(relative_path: str, content: str) -> List[Dict[str, Any]]:
    """Scan file lines deterministically for secrets and dangerous patterns."""
    findings = []
    lines = content.splitlines()

    for line_idx, line in enumerate(lines, start=1):
        # 1. Secret patterns
        for rule in SECRET_PATTERNS:
            match = rule["pattern"].search(line)
            if match:
                raw_match = match.group(1) if match.groups() else match.group(0)
                if rule.get("filter_placeholders") and is_placeholder(raw_match):
                    continue
                
                # Redact evidence snippet safely
                redacted_snippet = line.replace(raw_match, redact_sensitive_value(raw_match)).strip()
                if len(redacted_snippet) > 120:
                    redacted_snippet = redacted_snippet[:117] + "..."

                findings.append({
                    "id": f"{rule['id']}-{line_idx}",
                    "severity": rule["severity"],
                    "category": rule["category"],
                    "file_path": relative_path,
                    "line_number": line_idx,
                    "title": rule["title"],
                    "explanation": rule["explanation"],
                    "evidence": redacted_snippet,
                    "remediation": rule["remediation"],
                    "source": "deterministic"
                })

        # 2. Code vulnerability patterns
        for rule in CODE_VULN_PATTERNS:
            match = rule["pattern"].search(line)
            if match:
                snippet = line.strip()
                if len(snippet) > 120:
                    snippet = snippet[:117] + "..."

                findings.append({
                    "id": f"{rule['id']}-{line_idx}",
                    "severity": rule["severity"],
                    "category": rule["category"],
                    "file_path": relative_path,
                    "line_number": line_idx,
                    "title": rule["title"],
                    "explanation": rule["explanation"],
                    "evidence": snippet,
                    "remediation": rule["remediation"],
                    "source": "deterministic"
                })

    return findings

def check_file_presence_issues(relative_paths: List[str], is_git_repo: bool) -> List[Dict[str, Any]]:
    """Check for suspicious tracked files, missing .gitignore, or sensitive environment files."""
    issues = []
    path_set = set(p.lower().replace("\\", "/") for p in relative_paths)

    # Check for live .env or secret files present
    sensitive_file_patterns = [
        (".env", "Exposed Environment File", SeverityEnum.HIGH,
         ".env file found directly in workspace. Sensitive credentials inside this file can easily be leaked if tracked.",
         "Ensure .env is added to your .gitignore and distribute .env.example instead."),
        (".env.local", "Local Environment Override", SeverityEnum.MEDIUM,
         ".env.local detected. Verify that it is listed in .gitignore.",
         "Verify .gitignore includes .env.local."),
        ("id_rsa", "SSH Private Key File", SeverityEnum.CRITICAL,
         "SSH private key file detected in workspace root. This should never reside in a project folder.",
         "Remove the private key immediately and store it only in your user ~/.ssh directory."),
        ("credentials.json", "Potential Google Cloud or API Credentials File", SeverityEnum.HIGH,
         "Service account or API credential JSON file found.",
         "Exclude credentials.json from git and use environment variables where possible.")
    ]

    for filename, title, severity, explanation, remediation in sensitive_file_patterns:
        for p in path_set:
            if p == filename or p.endswith("/" + filename):
                issues.append({
                    "id": f"FILE-{filename.replace('.', '_')}",
                    "severity": severity,
                    "category": "Sensitive File Detection",
                    "file_path": p,
                    "line_number": None,
                    "title": title,
                    "explanation": explanation,
                    "evidence": f"File present in project: {p}",
                    "remediation": remediation,
                    "source": "deterministic"
                })

    # Git-specific hygiene checks
    if is_git_repo:
        has_gitignore = any(p == ".gitignore" or p.endswith("/.gitignore") for p in path_set)
        if not has_gitignore:
            issues.append({
                "id": "GIT-NO-GITIGNORE",
                "severity": SeverityEnum.MEDIUM,
                "category": "Git Hygiene",
                "file_path": ".gitignore",
                "line_number": None,
                "title": "Missing .gitignore in Git Repository",
                "explanation": "This project is initialized as a Git repository but lacks a .gitignore file. Builds, caches, and secrets risk being committed accidentally.",
                "remediation": "Create a .gitignore file at the repository root containing entries like .env, node_modules/, __pycache__/, and *.log.",
                "source": "deterministic"
            })

    return issues
