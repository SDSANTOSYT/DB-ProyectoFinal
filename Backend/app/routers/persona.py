# app/routers/persona.py
from fastapi import APIRouter, HTTPException
from ..db import get_conn
from ..schemas import PersonaCreate

router = APIRouter(prefix="/personas", tags=["persona"])

@router.post("/", status_code=201)
def create_persona(payload: PersonaCreate):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO persona (nombre, tipo_documento, numero_documento, correo)
            VALUES (:1, :2, :3, :4)
        """, (payload.nombre, payload.tipo_documento, payload.numero_documento, payload.correo))
        conn.commit()
        # Obtener id_persona recien creado
        cur2 = conn.cursor()
        cur2.execute("SELECT id_persona FROM persona WHERE rownum=1 AND nombre = :1 ORDER BY id_persona DESC", (payload.nombre,))
        r = cur2.fetchone()
        return {"id_persona": r[0], "nombre": payload.nombre}
    finally:
        cur.close()
        conn.close()
