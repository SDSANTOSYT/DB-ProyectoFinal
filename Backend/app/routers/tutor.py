# app/routers/tutor.py
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import oracledb
import logging
from ..db import get_conn
from ..schemas import TutorCreate, TutorRead, AsignacionTutorCreate
from ..utils import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tutores", tags=["tutores"])


@router.post("/", response_model=TutorRead)
def create_tutor(payload: TutorCreate, user=Depends(get_current_user)):
    """
    Crea un nuevo tutor en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando tutor para persona {payload.id_persona}")
        
        cur.execute("""
            INSERT INTO tutor (id_persona, fecha_contrato) 
            VALUES (:1, TO_DATE(:2, 'YYYY-MM-DD'))
        """, (payload.id_persona, payload.fecha_contrato or None))
        
        conn.commit()
        
        # Obtener el ID generado
        cur2 = conn.cursor()
        cur2.execute("""
            SELECT id_tutor 
            FROM tutor 
            WHERE id_persona = :1 
            ORDER BY id_tutor DESC 
            FETCH FIRST 1 ROW ONLY
        """, (payload.id_persona,))
        
        r = cur2.fetchone()
        
        if not r:
            logger.error("No se pudo recuperar el tutor recién creado")
            raise HTTPException(
                status_code=500,
                detail="Error al recuperar el tutor creado"
            )
        
        logger.info(f"Tutor {r[0]} creado exitosamente")
        
        return {
            "id_tutor": r[0],
            "id_persona": payload.id_persona,
            "fecha_contrato": payload.fecha_contrato
        }
        
    except HTTPException:
        if conn:
            conn.rollback()
        raise
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear tutor: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que la persona existe."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear tutor: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear tutor: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.post("/asignar")
def asignar_tutor(payload: AsignacionTutorCreate, user=Depends(get_current_user)):
    """
    Asigna un tutor a un aula.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Asignando tutor {payload.id_tutor} al aula {payload.id_aula}")
        
        cur.execute("""
            INSERT INTO asignacion_tutor_aula (id_tutor, id_aula, fecha_inicio, fecha_fin)
            VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4)
        """, (payload.id_tutor, payload.id_aula, payload.fecha_inicio or None, payload.fecha_fin or None))
        
        conn.commit()
        
        logger.info("Asignación de tutor creada exitosamente")
        
        return {"status": "ok"}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al asignar tutor: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que el tutor y el aula existen."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al asignar tutor: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al asignar tutor: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@router.get("/{id_tutor}", response_model=TutorRead)
def get_tutor(id_tutor: int, user=Depends(get_current_user)):
    """
    Obtiene un tutor por su ID.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Consultando tutor {id_tutor}")
        
        cur.execute("""
            SELECT id_tutor, id_persona, TO_CHAR(fecha_contrato, 'YYYY-MM-DD') 
            FROM tutor 
            WHERE id_tutor = :1
        """, (id_tutor,))
        
        r = cur.fetchone()
        
        if not r:
            logger.warning(f"Tutor {id_tutor} no encontrado")
            raise HTTPException(404, "Tutor no encontrado")
        
        return {
            "id_tutor": r[0],
            "id_persona": r[1],
            "fecha_contrato": r[2]
        }
        
    except HTTPException:
        raise
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos al consultar tutor: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la base de datos"
        )
        
    except Exception as e:
        logger.error(f"Error inesperado al consultar tutor: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()