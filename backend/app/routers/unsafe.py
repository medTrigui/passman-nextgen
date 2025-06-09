# backend/app/routers/unsafe.py
from fastapi import APIRouter, Query

router = APIRouter(tags=["unsafe_demo"])

@router.get("/unsafe")
def run_unsafe(cmd: str = Query("", description="DO NOT USE IN PROD")):
    """
    INTENTIONALLY VULNERABLE:
    Executes arbitrary Python code from the `cmd` query parameter.
    Example:  GET /unsafe?cmd=print('pwned')
    """
    # --- BAD PRACTICE: dynamic code execution -----------------------------
    exec(cmd)                           # <-- Sonar will flag this line
    return {"status": "executed"}

