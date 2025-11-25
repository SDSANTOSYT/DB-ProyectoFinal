# app/routers/sede.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import SedeCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sedes", tags=["sedes"])

@router.post("/", status_code=201)
def create_sede(payload: SedeCreate):
    """
    Crea una nueva sede en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando sede: {payload.nombre_sede}")
        
        cur.execute("""
            INSERT INTO SEDE (NOMBRE_SEDE, DIRECCION, ID_INSTITUCION) 
            VALUES (:1, :2, :3)
        """, (payload.nombre_sede, payload.direccion, payload.id_institucion))
        
        conn.commit()
        
        logger.info("Sede creada exitosamente")
        
        return {"status": "ok"}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear sede: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que la institución existe."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear sede: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear sede: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()