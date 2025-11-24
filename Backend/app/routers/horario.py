# app/routers/horario.py
from fastapi import APIRouter
from ..db import get_conn
from ..schemas import HorarioCreate

router = APIRouter(prefix="/horarios", tags=["horarios"])

@router.post("/", status_code=201)
def create_horario(payload: HorarioCreate):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO HORARIO (DIA, HORA_INICIO, HORA_FIN, ID_AULA) VALUES (:1,:2,:3,:4)", (payload.dia, payload.hora_inicio, payload.hora_fin, payload.id_aula))
        conn.commit()
        return {"status":"ok"}
    finally:
        cur.close(); conn.close()
