# Contributing to PHANTOM 👻

Thank you for your interest in contributing to **PHANTOM — The AI That Haunts Your Terminal**!

This project is built for the open-source community and the "Ghost in the Machine" open innovation challenge. We welcome contributions that maintain code safety, privacy, and the supernatural aesthetic.

## Development Principles

1. **Local-First & Privacy Absolute**: Never introduce dependencies or integrations that upload user source code to remote cloud AI APIs. All AI inference must run through local open-weight models (such as Ollama).
2. **Deterministic Security Rules**: Pattern matching for exposed secrets, unpinned configs, and dangerous execution patterns must remain conservative to prevent false alarms.
3. **Redaction by Default**: Never store, log, or display unmasked secret values.
4. **Cinematic Aesthetic**: Follow the cohesive color palette (deep midnight `#070511`, violet `#170B2B`, electric purple `#A855F7`, neon green `#39FF88`, cyan `#00E5FF`, hot pink `#FF3CAC`, crimson `#FF365E`). Always respect reduced-motion user preferences.

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/phantom.git
cd phantom
```

### 2. Backend Setup
```powershell
python -m venv backend/.venv
.\backend\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
pytest backend/tests
```

### 3. Frontend Setup
```powershell
cd frontend
npm.cmd install
npm.cmd test
npm.cmd run build
```

## Running Tests

- Backend tests:
  ```powershell
  $env:PYTHONPATH="."; .\backend\.venv\Scripts\pytest.exe backend/tests
  ```
- Frontend tests:
  ```powershell
  cd frontend
  npm.cmd test
  ```

## Submitting Pull Requests

1. Fork the repository and create your branch from `main`.
2. Ensure all 15 backend unit tests and frontend Vitest suites pass cleanly.
3. Verify that path traversal defenses and secret redactions remain intact.
4. Open a PR with a clear summary of your changes.
