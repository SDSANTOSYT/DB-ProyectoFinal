# app/routers/persona.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import PersonaCreate, PersonaRead

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/personas", tags=["personas"])

@router.post("/", response_model=PersonaRead)
def create_persona(payload: PersonaCreate):
    conn = get_conn()
    cur = conn.cursor()
    try:
        # Insertamos; PERSONA.ID_PERSONA es identity en el DDL
        cur.execute("INSERT INTO PERSONA (NOMBRE, ROL, CORREO) VALUES (:1, :2, :3)",
                    (payload.nombre, payload.rol, payload.correo))
        conn.commit()
        # recuperar el registro creado (último por id)
        cur2 = conn.cursor()
        cur2.execute("SELECT ID_PERSONA, NOMBRE, ROL, CORREO FROM PERSONA WHERE ID_PERSONA = (SELECT MAX(ID_PERSONA) FROM PERSONA)")
        r = cur2.fetchone()
        return {"id_persona": r[0], "nombre": r[1], "rol": r[2], "correo": r[3]}
    finally:
        cur.close()
        conn.close()

@router.get("/", response_model=list[PersonaRead])
def list_personas(limit: int = 100):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("SELECT ID_PERSONA, NOMBRE, ROL, CORREO FROM PERSONA WHERE ROWNUM <= :1 ORDER BY ID_PERSONA DESC", (limit,))
        rows = cur.fetchall()
        return [{"id_persona": r[0], "nombre": r[1], "rol": r[2], "correo": r[3]} for r in rows]
    finally:
        cur.close()
        conn.close()
