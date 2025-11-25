# app/routers/programa.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import ProgramaCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/programas", tags=["programas"])

@router.post("/", status_code=201)
def create_programa(payload: ProgramaCreate):
    """
    Crea un nuevo programa en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando programa: {payload.tipo}")
        
        cur.execute("""
            INSERT INTO PROGRAMA (TIPO) 
            VALUES (:1)
        """, (payload.tipo,))
        
        conn.commit()
        
        logger.info("Programa creado exitosamente")
        
        return {"status": "ok"}
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear programa: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear programa: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()