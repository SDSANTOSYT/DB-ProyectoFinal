# backend/app/routers/sede.py
from fastapi import APIRouter, HTTPException
from typing import List
from ..db import get_conn
from ..schemas import SedeCreate, SedeRead

router = APIRouter(prefix="/sedes", tags=["sedes"])

@router.post("/", response_model=SedeRead, status_code=201)
def crear_sede(payload: SedeCreate):
    conn = get_conn()
    cur = conn.cursor()
    try:
        # Insertar; si ID_SEDE es IDENTITY, no incluir ID_SEDE en VALUES
        cur.execute(
            "INSERT INTO SEDE (NOMBRE_SEDE, DIRECCION, ID_INSTITUCION, TELEFONO) VALUES (:1, :2, :3, :4)",
            (payload.nombre_sede, payload.direccion, payload.id_institucion, payload.telefono)
        )
        conn.commit()
        # recuperar la sede creada (por el mayor ID_SEDE)
        cur2 = conn.cursor()
        cur2.execute("""
            SELECT ID_SEDE, NOMBRE_SEDE, DIRECCION, ID_INSTITUCION, TELEFONO
            FROM SEDE
            WHERE ID_SEDE = (SELECT MAX(ID_SEDE) FROM SEDE)
        """)
        row = cur2.fetchone()
        if not row:
            raise HTTPException(status_code=500, detail="No se pudo recuperar la sede creada")
        return {
            "id_sede": row[0],
            "nombre_sede": row[1],
            "direccion": row[2],
            "id_institucion": row[3],
            "telefono": row[4]
        }
    finally:
        cur.close()
        conn.close()

@router.get("/", response_model=List[SedeRead])
def listar_sedes(limit: int = 200):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("SELECT ID_SEDE, NOMBRE_SEDE, DIRECCION, ID_INSTITUCION, TELEFONO FROM SEDE WHERE ROWNUM <= :1 ORDER BY ID_SEDE DESC", (limit,))
        rows = cur.fetchall()
        return [
            {"id_sede": r[0], "nombre_sede": r[1], "direccion": r[2], "id_institucion": r[3], "telefono": r[4]}
            for r in rows
        ]
    finally:
        cur.close()
        conn.close()

@router.get("/by-institucion/{id_institucion}", response_model=List[SedeRead])
def listar_sedes_por_institucion(id_institucion: int):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT ID_SEDE, NOMBRE_SEDE, DIRECCION, ID_INSTITUCION, TELEFONO
            FROM SEDE
            WHERE ID_INSTITUCION = :1
            ORDER BY ID_SEDE
        """, (id_institucion,))
        rows = cur.fetchall()
        return [
            {"id_sede": r[0], "nombre_sede": r[1], "direccion": r[2], "id_institucion": r[3], "telefono": r[4]}
            for r in rows
        ]
    finally:
        cur.close()
        conn.close()
