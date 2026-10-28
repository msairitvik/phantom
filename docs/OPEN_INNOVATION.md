# Why Open AI Matters 🌐 — "Ghost in the Machine" Challenge

This document details the open innovation philosophy and architectural rationale behind **PHANTOM**.

## 1. The Challenge Rationale

Modern proprietary AI services (e.g., hosted cloud APIs) impose significant risks when applied to cybersecurity and code surveillance:
- **Data Leakage**: Sending confidential source code, internal hostnames, and environment configurations across the internet exposes intellectual property.
- **Per-Token API Metering**: Continuous code inspection quickly incurs ongoing API fees.
- **Cloud Outages & Air-Gap Incompatibility**: Defense environments, air-gapped enclaves, or offline field operations cannot rely on external servers.

## 2. The Local-First Solution

PHANTOM runs inference locally via **Ollama** paired with open-weight models such as **Qwen 3** or **Qwen 2.5**:
- **Zero Network Egress**: Project code never leaves the developer's localhost.
- **Model Freedom**: Developers are not locked into any single provider. You can switch models between `qwen3:4b`, `gemma2:2b`, or custom fine-tuned GGUF checkpoints in settings.
- **Sustainable Economics**: Local inference leverages existing developer hardware without recurring token charges.

## 3. Technology Licenses & Attribution

- **PHANTOM Code**: MIT License
- **Ollama**: MIT License
- **Qwen Models**: Apache 2.0 / Qwen Research License
- **FastAPI**: MIT License
- **React & Vite**: MIT License
- **SQLite**: Public Domain
