# app/routers/tutor.py
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import oracledb
import logging
from ..db import get_conn
from ..schemas import (
    TutorAssignRequest, TutorAssignResponse, TutorCreate, TutorDeleteResponse, TutorIdResponse, AulaSimple, AulasCountResponse,
    AulaStudentCount, StudentSimple, HorarioSimple, LoginRequest, LoginResponse, TutorListItem, TutorUnlinkResponse
)

logger = logging.getLogger(__name__)

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
        if cur:
            cur.close()
        if conn:
            conn.close()


# 2) Con id_tutor -> obtener aulas (lista de aulas)
@router.get("/{id_tutor}/aulas", response_model=List[AulaSimple])
def get_aulas_by_tutor(id_tutor: int):
    conn = get_conn(); cur = conn.cursor()
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Asignando tutor {payload.id_tutor} al aula {payload.id_aula}")
        
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
        if cur:
            cur.close()
        if conn:
            conn.close()


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

# 8) listar todos los tutores con su id_persona
@router.get("/all", response_model=List[TutorListItem])
def listar_todos_tutores():
    conn = get_conn()
    cur = conn.cursor()
    try:
        # Selecciona todos los tutores con su id_persona (puede ser NULL)
        cur.execute("SELECT ID_TUTOR, ID_PERSONA FROM TUTOR ORDER BY ID_TUTOR")
        rows = cur.fetchall()
        result = [{"id_tutor": r[0], "id_persona": r[1]} for r in rows]
        return result
    finally:
        cur.close()
        conn.close()

# 9) asignar / relacionar un tutor con una persona
@router.put("/{id_tutor}/asignar-persona", response_model=TutorAssignResponse)
def asignar_persona_a_tutor(id_tutor: int, payload: TutorAssignRequest):
    conn = get_conn()
    cur = conn.cursor()
    try:
        # Verificar que el tutor exista
        cur.execute("SELECT ID_TUTOR FROM TUTOR WHERE ID_TUTOR = :1", (id_tutor,))
        t = cur.fetchone()
        if not t:
            raise HTTPException(status_code=404, detail=f"Tutor {id_tutor} no existe")

        # Verificar que la persona exista
        cur.execute("SELECT ID_PERSONA FROM PERSONA WHERE ID_PERSONA = :1", (payload.id_persona,))
        p = cur.fetchone()
        if not p:
            raise HTTPException(status_code=404, detail=f"Persona {payload.id_persona} no existe")

        # Actualizar la relación
        cur.execute("UPDATE TUTOR SET ID_PERSONA = :1 WHERE ID_TUTOR = :2", (payload.id_persona, id_tutor))
        conn.commit()

        return {"id_tutor": id_tutor, "id_persona": payload.id_persona, "mensaje": "Asignación realizada"}
    finally:
        cur.close()
        conn.close()


# 10) Crear tutor 
@router.post("/", status_code=201)
def crear_tutor(payload: TutorCreate):
    conn = get_conn(); cur = conn.cursor()
    try:
        if payload.id_persona is not None:
            # verificar persona existe
            cur.execute("SELECT ID_PERSONA FROM PERSONA WHERE ID_PERSONA = :1", (payload.id_persona,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Persona no encontrada")
        cur.execute("INSERT INTO TUTOR (ID_PERSONA) VALUES (:1)", (payload.id_persona,))
        conn.commit()
        # devolver tutor creado
        cur2 = conn.cursor()
        cur2.execute("SELECT ID_TUTOR, ID_PERSONA FROM TUTOR WHERE ID_TUTOR = (SELECT MAX(ID_TUTOR) FROM TUTOR)")
        r = cur2.fetchone()
        return {"id_tutor": r[0], "id_persona": r[1]}
    finally:
        cur.close(); conn.close()

# 11) Eliminar tutor 
@router.delete("/{id_tutor}", response_model=TutorDeleteResponse)
def eliminar_tutor(id_tutor: int):
    conn = get_conn(); cur = conn.cursor()
    try:
        # opcional: verificar no hay dependencias (aulas, asistencias, etc.)
        # Si quieres evitar borrados cuando hay dependencias, chequea y lanza 400.
        cur.execute("DELETE FROM TUTOR WHERE ID_TUTOR = :1", (id_tutor,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Tutor no encontrado")
        conn.commit()
        return {"id_tutor": id_tutor, "mensaje": "Tutor eliminado correctamente"}
    finally:
        cur.close(); conn.close()

# 12) Desvincular persona de tutor 
@router.put("/{id_tutor}/desvincular-persona", response_model=TutorUnlinkResponse)
def desvincular_persona_de_tutor(id_tutor: int):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("SELECT ID_TUTOR, ID_PERSONA FROM TUTOR WHERE ID_TUTOR = :1", (id_tutor,))
        r = cur.fetchone()
        if not r:
            raise HTTPException(status_code=404, detail="Tutor no encontrado")
        cur.execute("UPDATE TUTOR SET ID_PERSONA = NULL WHERE ID_TUTOR = :1", (id_tutor,))
        conn.commit()
        return {"id_tutor": id_tutor, "id_persona": None, "mensaje": "Persona desvinculada del tutor"}
    finally:
        cur.close(); conn.close()