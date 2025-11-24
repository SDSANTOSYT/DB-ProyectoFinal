# app/routers/estudiante.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from ..db import get_conn
from ..schemas import EstudianteCreate, EstudianteRead
from ..utils import get_current_user

router = APIRouter(prefix="/estudiantes", tags=["estudiantes"])

@router.post("/", response_model=EstudianteRead)
def create_estudiante(payload: EstudianteCreate, user=Depends(get_current_user)):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO estudiante (id_persona, id_aula, grado, score_inicial)
            VALUES (:1, :2, :3, :4)
        """, (payload.id_persona, payload.id_aula, payload.grado, payload.score_inicial))
        conn.commit()
        cur2 = conn.cursor()
        cur2.execute("SELECT id_estudiante FROM estudiante WHERE rownum=1 AND id_persona = :1 ORDER BY id_estudiante DESC", (payload.id_persona,))
        r = cur2.fetchone()
        return {"id_estudiante": r[0], "id_persona": payload.id_persona, "id_aula": payload.id_aula, "grado": payload.grado, "score_inicial": payload.score_inicial}
    finally:
        cur.close(); conn.close()

@router.get("/{id_estudiante}", response_model=EstudianteRead)
def get_estudiante(id_estudiante: int, user=Depends(get_current_user)):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("SELECT id_estudiante, id_persona, id_aula, grado, score_inicial, score_final FROM estudiante WHERE id_estudiante = :1", (id_estudiante,))
        r = cur.fetchone()
        if not r:
            raise HTTPException(404, "Estudiante no encontrado")
        return {"id_estudiante": r[0], "id_persona": r[1], "id_aula": r[2], "grado": r[3], "score_inicial": r[4], "score_final": r[5]}
    finally:
        cur.close(); conn.close()

@router.get("/", response_model=List[EstudianteRead])
def list_estudiantes(limit: int = 100, user=Depends(get_current_user)):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("SELECT id_estudiante, id_persona, id_aula, grado, score_inicial, score_final FROM estudiante WHERE ROWNUM <= :1", (limit,))
        rows = cur.fetchall()
        return [{"id_estudiante": r[0], "id_persona": r[1], "id_aula": r[2], "grado": r[3], "score_inicial": r[4], "score_final": r[5]} for r in rows]
    finally:
        cur.close(); conn.close()
