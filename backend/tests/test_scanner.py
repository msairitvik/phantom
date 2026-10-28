import pytest
from backend.app.services.scanner import scan_project_workspace

@pytest.mark.asyncio
async def test_scan_discovers_files_and_findings(sample_test_workspace):
    result = await scan_project_workspace(str(sample_test_workspace), "test-inv-001")
    assert result["status"] == "completed"
    assert result["total_files"] >= 2  # app.py and .env (node_modules should be excluded)
    
    # Check that node_modules was ignored
    findings_files = [f.file_path for f in result["findings"]]
    for f in findings_files:
        assert "node_modules" not in f

    # Check that AWS key, eval, debug, and .env were detected
    severities = [f.severity.value for f in result["findings"]]
    assert "Critical" in severities  # AWS Key
    assert "High" in severities      # eval or .env
    assert "Medium" in severities    # DEBUG = True
