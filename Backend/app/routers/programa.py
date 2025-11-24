# app/routers/programa.py
from fastapi import APIRouter
from ..db import get_conn
from ..schemas import ProgramaCreate

router = APIRouter(prefix="/programas", tags=["programas"])

@router.post("/", status_code=201)
def create_programa(payload: ProgramaCreate):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO PROGRAMA (TIPO) VALUES (:1)", (payload.tipo,))
        conn.commit()
        return {"status":"ok"}
    finally:
        cur.close(); conn.close()
