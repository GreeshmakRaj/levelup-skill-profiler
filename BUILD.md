# Build / Run

## Start

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

```powershell
cd frontend
npm run dev
```

## Stop

`Ctrl+C` in each terminal, or force-kill:

```powershell
Get-NetTCPConnection -LocalPort 8000 | Stop-Process -Id { $_.OwningProcess } -Force
```


```
# 1. Clone the repo
git clone <repo-url>
cd levelup-skill-profiler

# 2. Create Python virtual environment (requires Python 3.11+)
cd backend
python -m venv .venv

# 3. Activate the venv
.\.venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -e .

# 5. Set up env vars
cp .env.example .env   # then fill in keys

# 6. Run
python -m uvicorn app.main:app --reload --port 8000

### ---- backend ---
cd backend
uv sync        # creates .venv + installs everything
uv run uvicorn app.main:app --reload --port 8000