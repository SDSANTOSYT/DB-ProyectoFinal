# app/routers/registro_cambio.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import RegistroCambioCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/registros", tags=["registros"])

@router.post("/", status_code=201)
def create_registro(payload: RegistroCambioCreate):
    """
    Crea un nuevo registro de cambio en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando registro de cambio para persona {payload.id_persona}")
        
        cur.execute("""
            INSERT INTO REGISTRO_DE_CAMBIO (FECHA, HORA, MOTIVO, ID_PERSONA, ID_TUTOR) 
            VALUES (TO_DATE(:1, 'YYYY-MM-DD'), :2, :3, :4, :5)
        """, (payload.fecha, payload.hora, payload.motivo, payload.id_persona, payload.id_tutor))
        
        conn.commit()
        
        logger.info("Registro de cambio creado exitosamente")
        
        return {"status": "ok"}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear registro: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que la persona y el tutor existen."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear registro: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos. Verifique el formato de la fecha (YYYY-MM-DD)."
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear registro: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()