# app/routers/componente.py
from fastapi import APIRouter,HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import ComponenteCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/componentes", tags=["componentes"])

@router.post("/", status_code=201)
def create_componente(payload: ComponenteCreate):
    """
    Crea un nuevo componente en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando componente: {payload.nombre}")
        
        cur.execute("""
            INSERT INTO COMPONENTE (NOMBRE, PORCENTAJE, ID_PROGRAMA) 
            VALUES (:1, :2, :3)
        """, (payload.nombre, payload.porcentaje, payload.id_programa))
        
        conn.commit()
        
        logger.info("Componente creado exitosamente")
        
        return {"status": "ok"}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear componente: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que el programa existe."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear componente: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear componente: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()