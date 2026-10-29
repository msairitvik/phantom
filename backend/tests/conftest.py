
import os
from pathlib import Path

import pytest
from backend.app.config import settings


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    test_db = Path(__file__).resolve().parent / "test_phantom.db"
    original_db_path = settings.DATABASE_PATH

    settings.DATABASE_PATH = str(test_db)

    try:
        yield
    finally:
        settings.DATABASE_PATH = original_db_path

        if test_db.exists():
            try:
                os.remove(test_db)
            except OSError:
                pass


@pytest.fixture
def sample_test_workspace(tmp_path):
    """Create a temporary workspace with intentional safe test issues."""
    ws = tmp_path / "test_repo"
    ws.mkdir()

    # 1. Synthetic AWS-like key and unsafe eval usage for scanner testing.
    py_file = ws / "app.py"
    py_file.write_text(
        'AWS_KEY = "AKIA1234567890ABCDEF"\n'
        "DEBUG = True\n"
        "def run_eval(user_code):\n"
        "    return eval(user_code)\n",
        encoding="utf-8",
    )

    # 2. A clearly fake Stripe placeholder without a real-key prefix.
    env_file = ws / ".env"
    env_file.write_text(
        "STRIPE_KEY=FAKE_STRIPE_TOKEN_FOR_UNIT_TESTS\n",
        encoding="utf-8",
    )

    # 3. Directory that should be ignored by the scanner.
    node_modules = ws / "node_modules" / "dummy_pkg"
    node_modules.mkdir(parents=True)
    (node_modules / "index.js").write_text(
        "console.log('ignored');\n",
        encoding="utf-8",
    )

    return ws
