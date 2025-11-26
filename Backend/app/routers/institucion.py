# backend/app/routers/institucion.py
from fastapi import APIRouter, HTTPException
from typing import List
from ..db import get_conn
from ..schemas import InstitucionCreate, InstitucionRead

router = APIRouter(prefix="/instituciones", tags=["instituciones"])

@router.post("/", response_model=InstitucionRead, status_code=201)
def crear_institucion(payload: InstitucionCreate):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO INSTITUCION (NOMBRE, DURACIONHORA, JORNADA) VALUES (:1, :2, :3)", (payload.nombre, payload.duracion_hora, payload.jornada))
        conn.commit()
        # obtener id creado (asumiendo ID_AUTOINCREMENTAL o SEQUENCE)
        cur2 = conn.cursor()
        cur2.execute("""
            SELECT ID_INSTITUCION, NOMBRE, DURACIONHORA, JORNADA
            FROM INSTITUCION
            WHERE ID_INSTITUCION = (
                SELECT MAX(ID_INSTITUCION) FROM INSTITUCION WHERE NOMBRE = :1
            )
        """, (payload.nombre,))
        row = cur2.fetchone()
        if not row:
            raise HTTPException(status_code=500, detail="No se pudo recuperar la institución creada")
        return {"id_institucion": row[0], "nombre": row[1], "duracion_hora":row[2], "jornada":row[3]}
    finally:
        cur.close()
        conn.close()

@router.get("/", response_model=List[InstitucionRead])
def listar_instituciones(limit: int = 100):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("SELECT ID_INSTITUCION, NOMBRE, DURACIONHORA, JORNADA FROM INSTITUCION WHERE ROWNUM <= :1 ORDER BY ID_INSTITUCION DESC", (limit,))
        rows = cur.fetchall()
        return [{"id_institucion": r[0], "nombre": r[1], "duracion_hora": r[2], "jornada": r[3]} for r in rows]
    finally:
        cur.close()
        conn.close()
