# app/routers/asistencia.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from app.db import get_conn
from app.schemas import (
    AsistenciaTutorCreate, AsistenciaTutorResponse,
    AsistenciaEstudianteCreate, AsistenciaEstudianteResponse
)
from typing import List

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/asistencias", tags=["Asistencias"])

# ------------------- TUTOR -----------------------

@router.get("/tutores", response_model=List[AsistenciaTutorResponse])
def listar_asistencia_tutor():
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
            SELECT ID_ASISTENCIA, ID_TUTOR, ID_AULA, FECHA, HORA_ENTRADA, HORA_SALIDA
            FROM ASISTENCIA_AULA_TUTOR
        """)
        
        res = [dict(zip([x[0].lower() for x in cur.description], r)) 
               for r in cur.fetchall()]
        
        return res
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al listar asistencias de tutores: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la base de datos"
        )
        
    except Exception as e:
        logger.error(f"Error inesperado al listar asistencias de tutores: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.post("/tutores", response_model=AsistenciaTutorResponse)
def registrar_asistencia_tutor(a: AsistenciaTutorCreate):
    """
    Registra una nueva asistencia de tutor.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Registrando asistencia de tutor {a.id_tutor} en aula {a.id_aula}")
        
        cur.execute("""
            INSERT INTO ASISTENCIA_AULA_TUTOR
            (ID_TUTOR, ID_AULA, FECHA, HORA_ENTRADA, HORA_SALIDA)
            VALUES (:1, :2, :3, :4, :5)
            RETURNING ID_ASISTENCIA INTO :6
        """, [a.id_tutor, a.id_aula, a.fecha, a.hora_entrada, a.hora_salida,
              conn.cursor().var(int)])
        
        new_id = cur.getimplicitresults()[0][0]
        
        conn.commit()
        
        logger.info(f"Asistencia de tutor {new_id} registrada exitosamente")
        
        return {"id_asistencia": new_id, **a.dict()}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al registrar asistencia de tutor: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que el tutor y el aula existen."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al registrar asistencia de tutor: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al registrar asistencia de tutor: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ------------------- ESTUDIANTE -----------------------

@router.get("/estudiantes", response_model=List[AsistenciaEstudianteResponse])
def listar_asistencia_estudiante():
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
            SELECT ID_ASISTENCIA, ID_ESTUDIANTE, ID_AULA, FECHA, HORA_ENTRADA, HORA_SALIDA
            FROM ASISTENCIA_AULA_ESTUDIANTE
        """)
        
        res = [dict(zip([x[0].lower() for x in cur.description], r)) 
               for r in cur.fetchall()]
        
        return res
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al listar asistencias de estudiantes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la base de datos"
        )
        
    except Exception as e:
        logger.error(f"Error inesperado al listar asistencias de estudiantes: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.post("/estudiantes", response_model=AsistenciaEstudianteResponse)
def registrar_asistencia_estudiante(a: AsistenciaEstudianteCreate):
    """
    Registra una nueva asistencia de estudiante.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Registrando asistencia de estudiante {a.id_estudiante} en aula {a.id_aula}")
        
        cur.execute("""
            INSERT INTO ASISTENCIA_AULA_ESTUDIANTE
            (ID_ESTUDIANTE, ID_AULA, FECHA, HORA_ENTRADA, HORA_SALIDA)
            VALUES (:1, :2, :3, :4, :5)
            RETURNING ID_ASISTENCIA INTO :6
        """, [a.id_estudiante, a.id_aula, a.fecha, a.hora_entrada, a.hora_salida,
              conn.cursor().var(int)])
        
        new_id = cur.getimplicitresults()[0][0]
        
        conn.commit()
        
        logger.info(f"Asistencia de estudiante {new_id} registrada exitosamente")
        
        return {"id_asistencia": new_id, **a.dict()}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al registrar asistencia de estudiante: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que el estudiante y el aula existen."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al registrar asistencia de estudiante: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al registrar asistencia de estudiante: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()