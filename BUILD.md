# Build / Run

## Start

```powershell
1. cd backend
2. .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
Start FastAPI backend (port 8000)

```powershell
1. cd frontend
2. npm.cmd run dev
```
Start React frontend (port 5173)

## Stop

```
Ctrl + C
```
Stop server in terminal

```powershell
Get-NetTCPConnection -LocalPort 8000 | Stop-Process -Id { $_.OwningProcess } -Force
```
Force-kill backend on port
