# app/routers/motivo.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import MotivoCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/motivos", tags=["motivos"])

@router.post("/", status_code=201)
def create_motivo(payload: MotivoCreate):
    """
    Crea un nuevo motivo en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando motivo: {payload.descripcion}")
        
        cur.execute("""
            INSERT INTO MOTIVO (DESCRIPCION) 
            VALUES (:1)
        """, (payload.descripcion,))
        
        conn.commit()
        
        logger.info("Motivo creado exitosamente")
        
        return {"status": "ok"}
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear motivo: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear motivo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()