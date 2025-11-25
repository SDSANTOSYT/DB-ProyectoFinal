# backend/app/routers/tutor.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..db import get_conn
from ..schemas import (
    TutorIdResponse, AulaSimple, AulasCountResponse,
    AulaStudentCount, StudentSimple, HorarioSimple
)

router = APIRouter(prefix="/tutores", tags=["tutores"])

# 1) Con id_persona -> obtener id_tutor (si existe)
@router.get("/by-persona/{id_persona}", response_model=TutorIdResponse)
def get_tutor_by_persona(id_persona: int):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("SELECT ID_TUTOR FROM TUTOR WHERE ID_PERSONA = :1", (id_persona,))
        row = cur.fetchone()
        if not row:
            return {"id_tutor": None}
        return {"id_tutor": row[0]}
    finally:
        cur.close(); conn.close()

# 2) Con id_tutor -> obtener aulas (lista de aulas)
@router.get("/{id_tutor}/aulas", response_model=List[AulaSimple])
def get_aulas_by_tutor(id_tutor: int):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("""
            SELECT ID_AULA, GRADO, ID_SEDE, ID_PROGRAMA, ID_TUTOR
            FROM AULA
            WHERE ID_TUTOR = :1
            ORDER BY ID_AULA
        """, (id_tutor,))
        rows = cur.fetchall()
        cols = [c[0].lower() for c in cur.description]
        result = []
        for r in rows:
            d = dict(zip(cols, r))
            # pydantic espera camel/underscore names: map to AulaSimple fields
            result.append({
                "id_aula": d.get("id_aula"),
                "grado": d.get("grado"),
                "id_sede": d.get("id_sede"),
                "id_programa": d.get("id_programa"),
                "id_tutor": d.get("id_tutor"),
            })
        return result
    finally:
        cur.close(); conn.close()

# 3) Con id_tutor -> número de aulas que tiene
@router.get("/{id_tutor}/aulas/count", response_model=AulasCountResponse)
def count_aulas_by_tutor(id_tutor: int):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM AULA WHERE ID_TUTOR = :1", (id_tutor,))
        cnt = cur.fetchone()[0] or 0
        return {"id_tutor": id_tutor, "numero_aulas": int(cnt)}
    finally:
        cur.close(); conn.close()

# 4) (similar a 2) Método que devuelve la lista de aulas -> ruta alternativa
@router.get("/{id_tutor}/aulas/list", response_model=List[AulaSimple])
def list_aulas_by_tutor(id_tutor: int):
    return get_aulas_by_tutor(id_tutor)

# 5) Con id_tutor -> número de estudiantes de cada aula que tiene ese tutor
@router.get("/{id_tutor}/aulas/students-count", response_model=List[AulaStudentCount])
def students_count_per_aula_by_tutor(id_tutor: int):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("""
            SELECT a.ID_AULA, NVL(COUNT(e.ID_ESTUDIANTE),0) as NUM_EST
            FROM AULA a
            LEFT JOIN ESTUDIANTE e ON a.ID_AULA = e.ID_AULA
            WHERE a.ID_TUTOR = :1
            GROUP BY a.ID_AULA
            ORDER BY a.ID_AULA
        """, (id_tutor,))
        rows = cur.fetchall()
        return [{"id_aula": r[0], "numero_estudiantes": int(r[1])} for r in rows]
    finally:
        cur.close(); conn.close()

# 6) Con id_tutor -> lista de estudiantes por aula (estructura: {id_aula: [estudiantes]})
@router.get("/{id_tutor}/aulas/students", response_model=List[dict])
def students_list_per_aula_by_tutor(id_tutor: int):
    """
    Devuelve lista de objetos: { "id_aula": X, "estudiantes": [{id_estudiante,nombre,...}, ...] }
    """
    conn = get_conn(); cur = conn.cursor()
    try:
        # primero obtener aulas del tutor
        cur.execute("SELECT ID_AULA FROM AULA WHERE ID_TUTOR = :1 ORDER BY ID_AULA", (id_tutor,))
        aulas = [r[0] for r in cur.fetchall()]
        result = []
        for id_aula in aulas:
            cur2 = conn.cursor()
            cur2.execute("""
                SELECT ID_ESTUDIANTE, NOMBRE, TIPO_DOCUMENTO, GRADO
                FROM ESTUDIANTE
                WHERE ID_AULA = :1
                ORDER BY ID_ESTUDIANTE
            """, (id_aula,))
            studs = [{"id_estudiante": r[0], "nombre": r[1], "tipo_documento": r[2], "grado": r[3]} for r in cur2.fetchall()]
            cur2.close()
            result.append({"id_aula": id_aula, "estudiantes": studs})
        return result
    finally:
        cur.close(); conn.close()

# 7) Dado un conjunto de id_tutor -> obtener horarios de las aulas que tienen
#    Query param `tutors` acepta lista separada por comas: ?tutors=1,2,3
@router.get("/horarios", response_model=List[HorarioSimple])
def horarios_by_tutors(tutors: Optional[str] = Query(None, description="Lista de id_tutor separados por comas, ej: 1,2,3")):
    if not tutors:
        raise HTTPException(status_code=400, detail="Parámetro tutors requerido, ejemplo: ?tutors=1,2")
    # parse tutors -> list of ints
    try:
        tutor_ids = [int(x.strip()) for x in tutors.split(",") if x.strip() != ""]
        if not tutor_ids:
            raise ValueError()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato inválido para tutors. Ejemplo: ?tutors=1,2,3")
    # construir IN-clause seguro usando binds dinamicos
    binds = {}
    in_clause = []
    for idx, tid in enumerate(tutor_ids):
        key = f"t{idx}"
        binds[key] = tid
        in_clause.append(":" + key)
    in_sql = ",".join(in_clause)

    sql = f"""
        SELECT h.ID_HORARIO, h.DIA, h.HORA_INICIO, h.HORA_FIN, h.ID_AULA, a.ID_TUTOR
        FROM HORARIO h
        JOIN AULA a ON h.ID_AULA = a.ID_AULA
        WHERE a.ID_TUTOR IN ({in_sql})
        ORDER BY a.ID_TUTOR, h.ID_HORARIO
    """
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute(sql, binds)
        rows = cur.fetchall()
        cols = [c[0].lower() for c in cur.description]
        result = []
        for r in rows:
            d = dict(zip(cols, r))
            result.append({
                "id_horario": d.get("id_horario"),
                "dia": d.get("dia"),
                "hora_inicio": d.get("hora_inicio"),
                "hora_fin": d.get("hora_fin"),
                "id_aula": d.get("id_aula"),
                "id_tutor": d.get("id_tutor")
            })
        return result
    finally:
        cur.close(); conn.close()