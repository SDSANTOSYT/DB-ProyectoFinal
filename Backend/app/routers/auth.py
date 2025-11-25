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
            SELECT p.id_persona, p.nombre, p.correo, p.rol, u.contrasena
            FROM PERSONA p
            JOIN USUARIO u ON p.id_persona = u.id_persona
            WHERE LOWER(p.correo) = LOWER(:1)
        """, (payload.email,))
        row = cur.fetchone()
        
        if not row:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

        id_persona, nombre, correo, rol, contrasena = row[0], row[1], row[2], row[3], row[4]

        # Validación simple: contraseña en claro (según tu diseño)
        if payload.password != contrasena:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

        # crear token JWT (payload mínimo)
        token = create_token_for_user(id_persona, nombre)

        # devolver los atributos solicitados (nombre, correo, rol, id_persona) + token
        return {
            "access_token": token,
            "nombre": nombre,
            "correo": correo,
            "rol": rol,
            "id_persona": id_persona
        }
    finally:
        cur.close()
        conn.close()
