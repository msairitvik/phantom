# Security Policy & Safeguards 🛡️

PHANTOM is built from the ground up for safe, non-destructive codebase surveillance.

## Supported Threat Detections

PHANTOM detects high-confidence anomalies using conservative pattern matching and heuristic rules:

| Category | Finding Types Detected | Remediation Strategy |
| :--- | :--- | :--- |
| **Exposed Credentials** | AWS Keys (`AKIA...`), GitHub PATs (`ghp_...`), Stripe Live Keys (`sk_live_...`), Slack Tokens (`xoxb-...`) | Masked in memory, revocation instructions provided |
| **Cryptographic Secrets** | Private key blocks (`-----BEGIN RSA/OPENSSH PRIVATE KEY-----`), `id_rsa` on disk | Instruct immediate exclusion & vault storage |
| **Sensitive File Tracking** | Live `.env`, `.env.local`, `credentials.json`, `service-account.json` | Warn about Git leakage; verify `.gitignore` presence |
| **Dangerous Execution** | Python `eval(...)`, `exec(...)`, `subprocess(..., shell=True)` | Advise `ast.literal_eval` or parameter lists |
| **Insecure Deserialization** | `pickle.loads(...)`, unloader `yaml.load(...)` | Recommend `json` or `yaml.safe_load` |
| **Configuration Weakness** | `DEBUG = True` hardcoded, exposed debug flags | Recommend environment flag toggles |

## Defensive Boundaries

1. **Secret Masking Guarantee**: Raw keys are never stored in SQLite, never logged, and never rendered in the UI.
2. **Untrusted Data Boundary**: LLM prompts strictly isolate file contents inside `<untrusted_investigation_evidence>` tags to prevent Prompt Injection attacks.
3. **Filesystem Restrictions**: Traversal outside the project workspace and access to system-critical root directories is blocked.
4. **Offline Resilience**: If Ollama is offline or times out, PHANTOM continues operating deterministically without fabricating AI findings.
