# app/routers/periodo.py
from fastapi import APIRouter
from ..db import get_conn
from ..schemas import PeriodoCreate

router = APIRouter(prefix="/periodos", tags=["periodos"])

@router.post("/", status_code=201)
def create_periodo(payload: PeriodoCreate):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO PERIODO (FECHA_INICIO, FECHA_FIN, ID_PROGRAMA) VALUES (TO_DATE(:1,'YYYY-MM-DD'), TO_DATE(:2,'YYYY-MM-DD'), :3)", (payload.fecha_inicio, payload.fecha_fin, payload.id_programa))
        conn.commit()
        return {"status":"ok"}
    finally:
        cur.close(); conn.close()
