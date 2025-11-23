# app/routers/auth.py
from fastapi import APIRouter, HTTPException
from ..db import get_conn
from ..schemas import LoginRequest, LoginResponse
import os
import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "cambialo_en_produccion")
JWT_ALGO = "HS256"
JWT_EXPIRES_MINUTES = 60*24  # 1 día

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """
    Login simple:
      - username = persona.nombre
      - password = id_persona (string)
    """
    conn = get_conn()
    cur = conn.cursor()
    try:
        # Buscar persona por nombre (case-insensitive)
        cur.execute("""
            SELECT id_persona, nombre FROM persona
            WHERE LOWER(nombre) = LOWER(:1)
        """, (payload.username,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        id_persona, nombre = row[0], row[1]
        # Comparar password con el id_persona (string)
        if str(id_persona) != payload.password:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        # Crear token JWT
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MINUTES)
        token = jwt.encode({"sub": str(id_persona), "nombre": nombre, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGO)
        return {"access_token": token, "nombre": nombre, "id_persona": id_persona}
    finally:
        cur.close()
        conn.close()
