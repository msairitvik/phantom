# PHANTOM Architecture & System Design 👻

PHANTOM is designed with a strict **local-first, read-only security boundary**. It separates deterministic code inspection from probabilistic open-weight LLM interpretation.

## High-Level Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Browser (React + Vite + Tailwind + Framer Motion)"]
        UI["Mission Dashboard & Haunted Terminal"]
        Tree["Project Filesystem Explorer"]
        FindingsView["Findings Registry & Redacted Inspector"]
        ReportsView["Markdown & JSON Exporter"]
    end

    subgraph Backend ["FastAPI Application (Port 8000)"]
        Router["REST API Router (/api)"]
        Scanner["Deterministic Safe Scanner Engine"]
        Rules["Security Rules & Secret Redaction (Regex/AST)"]
        OllamaBridge["Ollama Client (Bounded Prompt Context)"]
        DBHandler["SQLite Persistence (aiosqlite)"]
    end

    subgraph Storage ["Local Disk Boundary"]
        Disk["User Codebase (Read-Only)"]
        DB[(phantom.db SQLite)]
        Sample["sample_project (Safe Playground)"]
    end

    subgraph LocalAI ["Local Inference Daemon (Port 11434)"]
        Ollama["Ollama Service"]
        Qwen["qwen3:4b (Local Open-Weight Model)"]
    end

    UI -->|HTTP / JSON| Router
    Router --> Scanner
    Scanner -->|Read-Only Safe Traversal| Disk
    Scanner --> Rules
    Rules -->|Mask Secrets| Scanner
    Scanner --> DBHandler
    DBHandler --> DB
    Router --> OllamaBridge
    OllamaBridge -->|Bounded Untrusted Context| Ollama
    Ollama --> Qwen
    OllamaBridge --> Router
    Router --> UI
```

## Security & Isolation Pillars

1. **Path Traversal Protection**: All paths are resolved with `Path.resolve()` and validated against system-critical roots (`C:\Windows`, `C:\`, `/etc`, `/usr`).
2. **Read-Only Scanner**: Scans inspect file text into memory without writing, deleting, or modifying user files.
3. **Secret Redaction**: Discovered keys (AWS, GitHub, Stripe, Slack, Private Keys) are replaced with `***REDACTED***` in memory before reaching the database, logs, or UI.
4. **Prompt Injection Defense**: Scanned code is treated as untrusted user input wrapped inside `<untrusted_investigation_evidence>` XML boundaries with strict system directives instructing the local LLM never to follow instructions found within scanned files.
5. **Zero Cloud Telemetry**: All analysis runs completely on `127.0.0.1`.
