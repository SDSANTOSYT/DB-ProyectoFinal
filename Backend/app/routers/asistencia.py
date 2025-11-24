# app/routers/asistencia.py
from fastapi import APIRouter, HTTPException
from app.db import get_conn
from app.schemas import (
    AsistenciaTutorCreate, AsistenciaTutorResponse,
    AsistenciaEstudianteCreate, AsistenciaEstudianteResponse
)
from typing import List

router = APIRouter(prefix="/asistencias", tags=["Asistencias"])

# ------------------- TUTOR -----------------------

@router.get("/tutores", response_model=List[AsistenciaTutorResponse])
def listar_asistencia_tutor():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(""" SELECT ID_ASISTENCIA, ID_TUTOR, ID_AULA, FECHA, HORA_ENTRADA, HORA_SALIDA
                    FROM ASISTENCIA_AULA_TUTOR """)
    res = [dict(zip([x[0].lower() for x in cur.description], r)) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return res

@router.post("/tutores", response_model=AsistenciaTutorResponse)
def registrar_asistencia_tutor(a: AsistenciaTutorCreate):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(""" INSERT INTO ASISTENCIA_AULA_TUTOR
                    (ID_TUTOR, ID_AULA, FECHA, HORA_ENTRADA, HORA_SALIDA)
                    VALUES (:1, :2, :3, :4, :5)
                    RETURNING ID_ASISTENCIA INTO :6 """,
                [a.id_tutor, a.id_aula, a.fecha, a.hora_entrada, a.hora_salida,
                 conn.cursor().var(int)])
    new = cur.getimplicitresults()[0][0]

    conn.commit()
    cur.close()
    conn.close()
    return {"id_asistencia": new, **a.dict()}

# ------------------- ESTUDIANTE -----------------------

@router.get("/estudiantes", response_model=List[AsistenciaEstudianteResponse])
def listar_asistencia_estudiante():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(""" SELECT ID_ASISTENCIA, ID_ESTUDIANTE, ID_AULA, FECHA, HORA_ENTRADA, HORA_SALIDA
                    FROM ASISTENCIA_AULA_ESTUDIANTE """)
    res = [dict(zip([x[0].lower() for x in cur.description], r)) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return res

@router.post("/estudiantes", response_model=AsistenciaEstudianteResponse)
def registrar_asistencia_estudiante(a: AsistenciaEstudianteCreate):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(""" INSERT INTO ASISTENCIA_AULA_ESTUDIANTE
                    (ID_ESTUDIANTE, ID_AULA, FECHA, HORA_ENTRADA, HORA_SALIDA)
                    VALUES (:1, :2, :3, :4, :5)
                    RETURNING ID_ASISTENCIA INTO :6 """,
                [a.id_estudiante, a.id_aula, a.fecha, a.hora_entrada, a.hora_salida,
                 conn.cursor().var(int)])
    new = cur.getimplicitresults()[0][0]

    conn.commit()
    cur.close()
    conn.close()
    return {"id_asistencia": new, **a.dict()}
