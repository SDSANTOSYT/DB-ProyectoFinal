# app/routers/aula.py
from fastapi import APIRouter, HTTPException, Depends
from app.db import get_conn
from app.schemas import AulaCreate, AulaResponse, AulaUpdate
from typing import List

router = APIRouter(prefix="/aulas", tags=["Aulas"])

@router.get("/", response_model=List[AulaResponse])
def listar_aulas():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(""" SELECT ID_AULA, CODIGO_AULA, CAPACIDAD, UBICACION, ID_SEDE
                    FROM AULA ORDER BY ID_AULA """)
    res = [dict(zip([col[0].lower() for col in cur.description], row)) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return res

@router.post("/", response_model=AulaResponse)
def crear_aula(aula: AulaCreate):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(""" INSERT INTO AULA (CODIGO_AULA, CAPACIDAD, UBICACION, ID_SEDE)
                    VALUES (:1, :2, :3, :4)
                    RETURNING ID_AULA INTO :5 """,
                [aula.codigo_aula, aula.capacidad, aula.ubicacion, aula.id_sede, conn.cursor().var(int)])
    new_id = cur.getimplicitresults()[0][0]

    conn.commit()
    cur.close()
    conn.close()
    return {**aula.dict(), "id_aula": new_id}

@router.put("/{id_aula}", response_model=AulaResponse)
def actualizar_aula(id_aula: int, aula: AulaUpdate):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(""" UPDATE AULA SET CODIGO_AULA=:1, CAPACIDAD=:2,
                    UBICACION=:3, ID_SEDE=:4 WHERE ID_AULA=:5 """,
                [aula.codigo_aula, aula.capacidad, aula.ubicacion,
                 aula.id_sede, id_aula])

    if cur.rowcount == 0:
        raise HTTPException(404, "Aula no encontrada")

    conn.commit()
    cur.close()
    conn.close()
    return {"id_aula": id_aula, **aula.dict()}

@router.delete("/{id_aula}")
def borrar_aula(id_aula: int):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("DELETE FROM AULA WHERE ID_AULA=:1", [id_aula])

    if cur.rowcount == 0:
        raise HTTPException(404, "Aula no encontrada")

    conn.commit()
    cur.close()
    conn.close()
    return {"msg": "Aula eliminada correctamente"}
