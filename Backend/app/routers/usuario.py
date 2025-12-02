# app/routers/usuario.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import UsuarioCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.post("/", status_code=201)
def create_usuario(payload: UsuarioCreate):
    """
    Crea un nuevo usuario en el sistema.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Creando usuario para persona {payload.id_persona}")
        
        cur.execute("""
            INSERT INTO USUARIO (CONTRASENA, ID_PERSONA) 
            VALUES (:1, :2)
        """, (payload.contrasena, payload.id_persona))
        
        conn.commit()
        
        logger.info("Usuario creado exitosamente")
        
        return {"status": "ok"}
        
    except oracledb.IntegrityError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de integridad al crear usuario: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Error de integridad de datos. Verifique que la persona existe y no tenga ya un usuario."
        )
        
    except oracledb.DatabaseError as e:
        if conn:
            conn.rollback()
        logger.error(f"Error de base de datos al crear usuario: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error en la base de datos"
        )
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error inesperado al crear usuario: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()