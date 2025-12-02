# backend/app/utils.py
import os
from datetime import datetime, timedelta

import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Configuración (se puede sobreescribir con .env)
JWT_SECRET = os.getenv("JWT_SECRET", "globalenglishsecret")
JWT_ALGO = "HS256"
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", 60 * 24))  # por defecto 24h

security = HTTPBearer()


def create_token_for_user(id_persona: int, nombre: str) -> str:
    """
    Crea un JWT con payload mínimo.
    - sub: id_persona (string)
    - nombre: nombre del usuario
    - exp: tiempo de expiración
    """
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MINUTES)
    payload = {
        "sub": str(id_persona),
        "nombre": nombre,
        "exp": expire
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
    # PyJWT>=2 devuelve str, versiones antiguas bytes -> aseguramos str
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Dependencia para endpoints protegidos.
    Devuelve el payload del token decodificado o lanza HTTPException 401.
    Uso: user = Depends(get_current_user)
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        # payload mínimo: {"sub": "...", "nombre": "...", "exp": ...}
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
