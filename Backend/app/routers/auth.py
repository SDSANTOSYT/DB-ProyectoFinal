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
        
        logger.info(f"Intento de login para usuario: {payload.email}")
        
        # Buscar el usuario
        cur.execute("""
            SELECT p.id_persona, p.nombre, p.correo, p.rol, u.contrasena
            FROM PERSONA p
            JOIN USUARIO u ON p.id_persona = u.id_persona
            WHERE LOWER(p.correo) = LOWER(:1)
        """, (payload.email,))
        row = cur.fetchone()
        
        if not row:
            logger.warning(f"Usuario no encontrado: {payload.email}")
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

        id_persona, nombre, correo, rol, contrasena = row[0], row[1], row[2], row[3], row[4]

        # Validación simple: contraseña en claro (según tu diseño)
        if payload.password != contrasena:
            logger.warning(f"Contraseña incorrecta para: {payload.email}")
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

        # crear token JWT (payload mínimo)
        token = create_token_for_user(id_persona, nombre)
        
        logger.info(f"Login exitoso para: {nombre} (ID: {id_persona})")

        # devolver los atributos solicitados (nombre, correo, rol, id_persona) + token
        return {
            "access_token": token,
            "nombre": nombre,
            "correo": correo,
            "rol": rol,
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