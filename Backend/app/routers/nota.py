# app/routers/nota.py
from fastapi import APIRouter, HTTPException
from app.db import get_conn
from app.schemas import NotaCreate, NotaResponse, NotaUpdate
from typing import List

router = APIRouter(prefix="/notas", tags=["Notas"])

@router.get("/", response_model=List[NotaResponse])
def listar_notas():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(""" SELECT ID_NOTA, ID_ESTUDIANTE, ID_COMPONENTE, CALIFICACION
                    FROM NOTA ORDER BY ID_NOTA """)
    res = [dict(zip([x[0].lower() for x in cur.description], r)) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return res

@router.post("/", response_model=NotaResponse)
def crear_nota(nota: NotaCreate):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(""" INSERT INTO NOTA (ID_ESTUDIANTE, ID_COMPONENTE, CALIFICACION)
                    VALUES (:1, :2, :3) RETURNING ID_NOTA INTO :4 """,
                [nota.id_estudiante, nota.id_componente, nota.calificacion,
                 conn.cursor().var(int)])
    new_id = cur.getimplicitresults()[0][0]

    conn.commit()
    cur.close()
    conn.close()
    return {"id_nota": new_id, **nota.dict()}

@router.put("/{id_nota}", response_model=NotaResponse)
def actualizar_nota(id_nota: int, nota: NotaUpdate):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(""" UPDATE NOTA SET ID_ESTUDIANTE=:1, ID_COMPONENTE=:2,
                    CALIFICACION=:3 WHERE ID_NOTA=:4 """,
                [nota.id_estudiante, nota.id_componente, nota.calificacion, id_nota])

    if cur.rowcount == 0:
        raise HTTPException(404, "Nota no encontrada")

    conn.commit()
    cur.close()
    conn.close()
    return {"id_nota": id_nota, **nota.dict()}
