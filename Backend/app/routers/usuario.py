# app/routers/usuario.py
from fastapi import APIRouter, HTTPException
from ..db import get_conn
from ..schemas import UsuarioCreate

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.post("/", status_code=201)
def create_usuario(payload: UsuarioCreate):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO USUARIO (CONTRASENA, ID_PERSONA) VALUES (:1, :2)", (payload.contrasena, payload.id_persona))
        conn.commit()
        return {"status": "ok"}
    finally:
        cur.close(); conn.close()
