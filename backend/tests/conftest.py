import pytest
import os
import shutil
from pathlib import Path
from backend.app.config import settings

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    test_db = Path(__file__).resolve().parent / "test_phantom.db"
    settings.DATABASE_PATH = str(test_db)
    yield
    if test_db.exists():
        try:
            os.remove(test_db)
        except Exception:
            pass

@pytest.fixture
def sample_test_workspace(tmp_path):
    """Creates a temporary workspace with intentional safe test issues."""
    ws = tmp_path / "test_repo"
    ws.mkdir()
    
    # 1. Fake test AWS key in a source file
    py_file = ws / "app.py"
    py_file.write_text(
        'AWS_KEY = "AKIA1234567890ABCDEF"\n'
        'DEBUG = True\n'
        'def run_eval(user_code):\n'
        '    return eval(user_code)\n',
        encoding="utf-8"
    )

    # 2. .env file with fake dummy token
    env_file = ws / ".env"
    env_file.write_text("STRIPE_KEY=STRIPE_TEST_TOKEN_REDACTED\n", encoding="utf-8")

    # 3. Ignored directory
    nm = ws / "node_modules" / "dummy_pkg"
    nm.mkdir(parents=True)
    (nm / "index.js").write_text("console.log('ignored');", encoding="utf-8")

    return ws
