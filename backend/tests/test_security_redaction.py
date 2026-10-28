import pytest
from backend.app.services.rules import redact_sensitive_value, check_file_content

def test_redact_sensitive_value_hides_raw_content():
    raw_key = "AKIA1234567890ABCDEF"
    redacted = redact_sensitive_value(raw_key)
    assert raw_key not in redacted
    assert "***REDACTED***" in redacted
    assert redacted.startswith("AKI")
    assert redacted.endswith("EF")

def test_redact_short_value():
    assert redact_sensitive_value("12345") == "[REDACTED_SECRET]"

def test_secret_detection_redaction_in_evidence():
    code = 'AWS_KEY = "AKIAEXAMPLE123456789"\n'
    findings = check_file_content("config.py", code)
    assert len(findings) >= 1
    
    aws_finding = next(f for f in findings if f["category"] == "Exposed Credentials")
    assert "AKIAEXAMPLE123456789" not in aws_finding["evidence"]
    assert "***REDACTED***" in aws_finding["evidence"]

def test_placeholder_filtering():
    # Common placeholders should NOT trigger false positive alert
    code = 'password = "your_password_here"\n'
    findings = check_file_content("test.py", code)
    # Shouldn't flag this placeholder
    assert not any(f["id"].startswith("SEC-HARDCODED-PASSWORD") for f in findings)
