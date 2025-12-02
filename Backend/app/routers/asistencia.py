# app/routers/asistencia.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from app.db import get_conn
from app.schemas import (
    AsistenciaTutorCreate, AsistenciaTutorResponse,
    AsistenciaEstudianteCreate, AsistenciaEstudianteResponse
)
from typing import List, Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/asistencias", tags=["Asistencias"])


# ------------------- TUTOR -----------------------

@router.get("/tutores", response_model=List[AsistenciaTutorResponse])
def listar_asistencia_tutor(limit: int = 500):
    """
    Lista todas las asistencias de tutores.
    """
    conn = None
    cur = None

    try:
        conn = get_conn()
        cur = conn.cursor()

        logger.info("Listando asistencias de tutores")

        cur.execute("""
            SELECT ID_ASISTENCIA, ID_TUTOR, ID_AULA, ID_SEDE, ID_INSTITUCION,
                   FECHA, HORA_ENTRADA, HORA_SALIDA, SE_DIO
            FROM ASISTENCIA_AULA_TUTOR
            WHERE ROWNUM <= :1
            ORDER BY ID_ASISTENCIA DESC
        """, (limit,))

        rows = cur.fetchall()
        cols = [x[0].lower() for x in cur.description]
        res = [dict(zip(cols, r)) for r in rows]

        return res

    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al listar asistencias de tutores: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al consultar la base de datos")

    except Exception as e:
        logger.exception(f"Error inesperado al listar asistencias de tutores: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@router.post("/tutores", response_model=AsistenciaTutorResponse, status_code=201)
def registrar_asistencia_tutor(a: AsistenciaTutorCreate):
    """
    Registra una nueva asistencia de tutor.
    La fecha se registra automáticamente con SYSDATE.
    """
    conn = None
    cur = None

    try:
        conn = get_conn()
        cur = conn.cursor()

        logger.info(f"Registrando asistencia de tutor {a.id_tutor} en aula {a.id_aula}")

        id_var = cur.var(int)

        # Sin fecha explícita, Oracle usará SYSDATE por defecto o NULL
        cur.execute("""
            INSERT INTO ASISTENCIA_AULA_TUTOR
              (ID_TUTOR, ID_AULA, ID_SEDE, ID_INSTITUCION, FECHA, HORA_ENTRADA, HORA_SALIDA, SE_DIO, ID_MOTIVO, ID_ASISTENCIA_REPOSICION)
            VALUES
              (:id_tutor, :id_aula, :id_sede, :id_institucion, 
               SYSDATE, :hora_entrada, :hora_salida, 
               :se_dio, :id_motivo, :id_asistencia_reposicion)
            RETURNING ID_ASISTENCIA INTO :id_out
        """, {
            "id_tutor": a.id_tutor,
            "id_aula": a.id_aula,
            "id_sede": a.id_sede,
            "id_institucion": a.id_institucion,
            "hora_entrada": a.hora_entrada,
            "hora_salida": a.hora_salida,
            "se_dio": 1,
            "id_motivo": a.id_motivo,
            "id_asistencia_reposicion": a.id_asistencia_reposicion,
            "id_out": id_var
        })

        new_id = id_var.getvalue()
        if isinstance(new_id, (list, tuple)):
            new_id = new_id[0]

        conn.commit()

        logger.info(f"Asistencia de tutor {new_id} registrada exitosamente")

        return {
            "id_asistencia": int(new_id) if new_id is not None else None,
            "id_tutor": a.id_tutor,
            "id_aula": a.id_aula,
            "id_sede": a.id_sede,
            "id_institucion": a.id_institucion,
            "fecha": None,
            "hora_entrada": a.hora_entrada,
            "hora_salida": a.hora_salida,
            "se_dio": 1
        }

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al registrar asistencia de tutor: {str(e)}")
        raise HTTPException(status_code=400, detail="Error de integridad. Verifique que tutor y aula existan y sean consistentes.")

    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al registrar asistencia de tutor: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en la base de datos: {str(e)}")

    except Exception as e:
        if conn:
            conn.rollback()
        logger.exception(f"Error inesperado al registrar asistencia de tutor: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ------------------- ESTUDIANTE -----------------------

@router.get("/estudiantes", response_model=List[AsistenciaEstudianteResponse])
def listar_asistencia_estudiante(limit: int = 500):
    """
    Lista todas las asistencias de estudiantes.
    """
    conn = None
    cur = None

    try:
        conn = get_conn()
        cur = conn.cursor()

        logger.info("Listando asistencias de estudiantes")

        cur.execute("""
            SELECT ID_ASISTENCIA, ID_ESTUDIANTE, ID_AULA, ID_SEDE, ID_INSTITUCION,
                   FECHA, HORA_ENTRADA, HORA_SALIDA, PRESENTE
            FROM ASISTENCIA_AULA_ESTUDIANTE
            WHERE ROWNUM <= :1
            ORDER BY ID_ASISTENCIA DESC
        """, (limit,))

        rows = cur.fetchall()
        cols = [x[0].lower() for x in cur.description]
        res = [dict(zip(cols, r)) for r in rows]

        return res

    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al listar asistencias de estudiantes: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al consultar la base de datos")

    except Exception as e:
        logger.exception(f"Error inesperado al listar asistencias de estudiantes: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.post("/estudiantes", response_model=AsistenciaEstudianteResponse, status_code=201)
def registrar_asistencia_estudiante(a: AsistenciaEstudianteCreate):
    """
    Registra una nueva asistencia de estudiante.
    La fecha se registra automáticamente con SYSDATE.
    """
    conn = None
    cur = None

    try:
        conn = get_conn()
        cur = conn.cursor()

        logger.info(f"Registrando asistencia de estudiante {a.id_estudiante}")

        id_var = cur.var(int)

        # Sin fecha explícita, Oracle usará SYSDATE
        cur.execute("""
            INSERT INTO ASISTENCIA_AULA_ESTUDIANTE
              (ID_ESTUDIANTE, ID_AULA, ID_SEDE, ID_INSTITUCION, FECHA, HORA_ENTRADA, HORA_SALIDA, PRESENTE)
            VALUES
              (:id_estudiante, :id_aula, :id_sede, :id_institucion, 
               SYSDATE, :hora_entrada, :hora_salida, :presente)
            RETURNING ID_ASISTENCIA INTO :id_out
        """, {
            "id_estudiante": a.id_estudiante,
            "id_aula": a.id_aula,
            "id_sede": a.id_sede,
            "id_institucion": a.id_institucion,
            "hora_entrada": a.hora_entrada,
            "hora_salida": a.hora_salida,
            "presente": a.presente,
            "id_out": id_var
        })

        new_id = id_var.getvalue()
        if isinstance(new_id, (list, tuple)):
            new_id = new_id[0]

        conn.commit()

        logger.info(f"Asistencia de estudiante {new_id} registrada exitosamente")

        return {
            "id_asistencia": int(new_id) if new_id is not None else None,
            "id_estudiante": a.id_estudiante,
            "id_aula": a.id_aula,
            "id_sede": a.id_sede,
            "id_institucion": a.id_institucion,
            "fecha": None,
            "hora_entrada": a.hora_entrada,
            "hora_salida": a.hora_salida,
            "presente": a.presente
        }

    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al registrar asistencia de estudiante: {str(e)}")
        raise HTTPException(status_code=400, detail="Error de integridad. Verifique que estudiante y aula existan y sean consistentes.")

    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al registrar asistencia de estudiante: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en la base de datos: {str(e)}")

    except Exception as e:
        if conn:
            conn.rollback()
        logger.exception(f"Error inesperado al registrar asistencia de estudiante: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()