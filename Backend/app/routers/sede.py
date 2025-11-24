# app/routers/sede.py
from fastapi import APIRouter, HTTPException
from ..db import get_conn
from ..schemas import SedeCreate

router = APIRouter(prefix="/sedes", tags=["sedes"])

@router.post("/", status_code=201)
def create_sede(payload: SedeCreate):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO SEDE (NOMBRE_SEDE, DIRECCION, ID_INSTITUCION) VALUES (:1,:2,:3)", (payload.nombre_sede, payload.direccion, payload.id_institucion))
        conn.commit()
        return {"status": "ok"}
    finally:
        cur.close(); conn.close()
