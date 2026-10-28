import pytest
from backend.app.services.scanner import is_path_safe

def test_safe_local_directory(tmp_path):
    safe, msg = is_path_safe(str(tmp_path))
    assert safe is True

def test_block_nonexistent_directory():
    safe, msg = is_path_safe("C:/definitely_not_a_real_phantom_dir_xyz_12345")
    assert safe is False
    assert "does not exist" in msg.lower()

def test_block_system_windows_directory():
    safe, msg = is_path_safe("C:\\Windows")
    assert safe is False
    assert "forbidden" in msg.lower() or "cannot scan" in msg.lower()

def test_block_drive_root():
    safe, msg = is_path_safe("C:\\")
    assert safe is False
    assert "root" in msg.lower() or "forbidden" in msg.lower()
