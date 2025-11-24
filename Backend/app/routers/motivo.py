# app/routers/motivo.py
from fastapi import APIRouter
from ..db import get_conn
from ..schemas import MotivoCreate

router = APIRouter(prefix="/motivos", tags=["motivos"])

@router.post("/", status_code=201)
def create_motivo(payload: MotivoCreate):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO MOTIVO (DESCRIPCION) VALUES (:1)", (payload.descripcion,))
        conn.commit()
        return {"status":"ok"}
    finally:
        cur.close(); conn.close()
