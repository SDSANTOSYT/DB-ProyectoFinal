# app/routers/periodo.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import PeriodoCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/periodos", tags=["periodos"])

@router.post("/", status_code=201)
def create_periodo(payload: PeriodoCreate):
    """
    Crea un nuevo periodo en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando periodo para programa {payload.id_programa}")
        
        cur.execute("""
            INSERT INTO PERIODO (FECHA_INICIO, FECHA_FIN, ID_PROGRAMA) 
            VALUES (TO_DATE(:1, 'YYYY-MM-DD'), TO_DATE(:2, 'YYYY-MM-DD'), :3)
        """, (payload.fecha_inicio, payload.fecha_fin, payload.id_programa))
        
        conn.commit()
        
        logger.info("Periodo creado exitosamente")
        
        return {"status": "ok"}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear periodo: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que el programa existe."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear periodo: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos. Verifique el formato de las fechas (YYYY-MM-DD)."
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear periodo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()