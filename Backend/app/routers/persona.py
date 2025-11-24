# app/routers/persona.py
from fastapi import APIRouter, HTTPException
from ..db import get_conn
from ..schemas import PersonaCreate, PersonaRead

router = APIRouter(prefix="/personas", tags=["personas"])

@router.post("/", response_model=PersonaRead)
def create_persona(payload: PersonaCreate):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO PERSONA (NOMBRE, ROL) VALUES (:1, :2)", (payload.nombre, payload.rol))
        conn.commit()
        cur2 = conn.cursor()
        cur2.execute("SELECT ID_PERSONA, NOMBRE, ROL FROM PERSONA WHERE ROWNUM = 1 AND NOMBRE = :1 ORDER BY ID_PERSONA DESC", (payload.nombre,))
        r = cur2.fetchone()
        return {"id_persona": r[0], "nombre": r[1], "rol": r[2]}
    finally:
        cur.close(); conn.close()

@router.get("/", response_model=list[PersonaRead])
def list_personas(limit: int = 100):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("SELECT ID_PERSONA, NOMBRE, ROL FROM PERSONA WHERE ROWNUM <= :1", (limit,))
        rows = cur.fetchall()
        return [{"id_persona": r[0], "nombre": r[1], "rol": r[2]} for r in rows]
    finally:
        cur.close(); conn.close()
