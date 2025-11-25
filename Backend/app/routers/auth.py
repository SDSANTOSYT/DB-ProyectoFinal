# app/routers/auth.py
from fastapi import APIRouter, HTTPException
import oracledb
import logging
from ..db import get_conn
from ..schemas import LoginRequest, LoginResponse
from ..utils import create_token_for_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """
    Autentica a un usuario y retorna un token de acceso.
    """
    conn = None
    cur = None
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        logger.info(f"Intento de login para usuario: {payload.username}")
        
        # Buscar el usuario
        cur.execute("""
            SELECT p.id_persona, p.nombre, u.id_usuario, u.contrasena
            FROM PERSONA p
            JOIN USUARIO u ON p.id_persona = u.id_persona
            WHERE LOWER(p.nombre) = LOWER(:1)
        """, (payload.username,))
        
        row = cur.fetchone()
        
        if not row:
            logger.warning(f"Usuario no encontrado: {payload.username}")
            raise HTTPException(
                status_code=401,
                detail="Usuario o contraseña incorrectos"
            )
        
        id_persona, nombre, id_usuario, contrasena = row[0], row[1], row[2], row[3]
        
        # Verificar contraseña
        if payload.password != contrasena:
            logger.warning(f"Contraseña incorrecta para usuario: {payload.username}")
            raise HTTPException(
                status_code=401,
                detail="Usuario o contraseña incorrectos"
            )
        
        # Generar token
        token = create_token_for_user(id_persona, nombre)
        
        logger.info(f"Login exitoso para usuario: {nombre} (ID: {id_persona})")
        
        return {
            "access_token": token,
            "nombre": nombre,
            "id_persona": id_persona
        }
        
    except HTTPException:
        raise
        
    except oracledb.DatabaseError as e:
        logger.error(f"Error de base de datos en login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la base de datos"
        )
        
    except Exception as e:
        logger.error(f"Error inesperado en login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()