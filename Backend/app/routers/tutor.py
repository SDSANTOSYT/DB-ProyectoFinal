# app/routers/tutor.py
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from ..db import get_conn
from ..schemas import TutorCreate, TutorRead, AsignacionTutorCreate
from ..utils import get_current_user

router = APIRouter(prefix="/tutores", tags=["tutores"])

@router.post("/", response_model=TutorRead)
def create_tutor(payload: TutorCreate, user=Depends(get_current_user)):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO tutor (id_persona, fecha_contrato) VALUES (:1, TO_DATE(:2,'YYYY-MM-DD'))", (payload.id_persona, payload.fecha_contrato or None))
        conn.commit()
        cur2 = conn.cursor()
        cur2.execute("SELECT id_tutor FROM tutor WHERE rownum=1 AND id_persona = :1 ORDER BY id_tutor DESC", (payload.id_persona,))
        r = cur2.fetchone()
        return {"id_tutor": r[0], "id_persona": payload.id_persona, "fecha_contrato": payload.fecha_contrato}
    finally:
        cur.close(); conn.close()

@router.post("/asignar")
def asignar_tutor(payload: AsignacionTutorCreate, user=Depends(get_current_user)):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO asignacion_tutor_aula (id_tutor, id_aula, fecha_inicio, fecha_fin)
            VALUES (:1, :2, TO_DATE(:3,'YYYY-MM-DD'), :4)
        """, (payload.id_tutor, payload.id_aula, payload.fecha_inicio or None, payload.fecha_fin or None))
        conn.commit()
        return {"status": "ok"}
    finally:
        cur.close(); conn.close()

@router.get("/{id_tutor}", response_model=TutorRead)
def get_tutor(id_tutor: int, user=Depends(get_current_user)):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("SELECT id_tutor, id_persona, TO_CHAR(fecha_contrato,'YYYY-MM-DD') FROM tutor WHERE id_tutor = :1", (id_tutor,))
        r = cur.fetchone()
        if not r:
            raise HTTPException(404, "Tutor no encontrado")
        return {"id_tutor": r[0], "id_persona": r[1], "fecha_contrato": r[2]}
    finally:
        cur.close(); conn.close()
