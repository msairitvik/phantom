import aiosqlite
import json
import logging
from pathlib import Path
from backend.app.config import settings
from typing import Optional, List, Dict, Any

logger = logging.getLogger("phantom.database")

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS investigations (
    id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    workspace_path TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    total_files INTEGER DEFAULT 0,
    scanned_size_bytes INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    info_count INTEGER DEFAULT 0,
    summary TEXT,
    model_used TEXT,
    languages TEXT,
    file_extensions TEXT,
    git_branch TEXT
);

CREATE TABLE IF NOT EXISTS findings (
    id TEXT PRIMARY KEY,
    investigation_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    category TEXT NOT NULL,
    file_path TEXT NOT NULL,
    line_number INTEGER,
    title TEXT NOT NULL,
    explanation TEXT NOT NULL,
    evidence TEXT NOT NULL,
    remediation TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL,
    FOREIGN KEY(investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investigation_id TEXT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_findings_investigation ON findings(investigation_id);
CREATE INDEX IF NOT EXISTS idx_chat_investigation ON chat_history(investigation_id);
"""

async def get_db():
    db = await aiosqlite.connect(settings.DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA foreign_keys = ON;")
    return db

async def init_db():
    Path(settings.DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        await db.executescript(CREATE_TABLES_SQL)
        await db.commit()
    logger.info(f"Database initialized at {settings.DATABASE_PATH}")
