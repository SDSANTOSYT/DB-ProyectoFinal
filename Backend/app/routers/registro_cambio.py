# app/routers/registro_cambio.py
from fastapi import APIRouter
from ..db import get_conn
from ..schemas import RegistroCambioCreate

router = APIRouter(prefix="/registros", tags=["registros"])

@router.post("/", status_code=201)
def create_registro(payload: RegistroCambioCreate):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO REGISTRO_DE_CAMBIO (FECHA, HORA, MOTIVO, ID_PERSONA, ID_TUTOR) VALUES (TO_DATE(:1,'YYYY-MM-DD'), :2, :3, :4, :5)", (payload.fecha, payload.hora, payload.motivo, payload.id_persona, payload.id_tutor))
        conn.commit()
        return {"status":"ok"}
    finally:
        cur.close(); conn.close()
