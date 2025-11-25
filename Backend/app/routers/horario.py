# app/routers/horario.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import HorarioCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/horarios", tags=["horarios"])

@router.post("/", status_code=201)
def create_horario(payload: HorarioCreate):
    """
    Crea un nuevo horario en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando horario para aula {payload.id_aula}")
        
        cur.execute("""
            INSERT INTO HORARIO (DIA, HORA_INICIO, HORA_FIN, ID_AULA) 
            VALUES (:1, :2, :3, :4)
        """, (payload.dia, payload.hora_inicio, payload.hora_fin, payload.id_aula))
        
        conn.commit()
        
        logger.info("Horario creado exitosamente")
        
        return {"status": "ok"}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear horario: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que el aula existe."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear horario: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear horario: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()