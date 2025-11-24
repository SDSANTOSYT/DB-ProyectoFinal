# app/routers/componente.py
from fastapi import APIRouter
from ..db import get_conn
from ..schemas import ComponenteCreate

router = APIRouter(prefix="/componentes", tags=["componentes"])

@router.post("/", status_code=201)
def create_componente(payload: ComponenteCreate):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO COMPONENTE (NOMBRE, PORCENTAJE, ID_PROGRAMA) VALUES (:1,:2,:3)", (payload.nombre, payload.porcentaje, payload.id_programa))
        conn.commit()
        return {"status":"ok"}
    finally:
        cur.close(); conn.close()
