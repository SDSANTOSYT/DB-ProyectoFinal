# app/routers/auth.py
from fastapi import APIRouter, HTTPException
from ..db import get_conn
from ..schemas import LoginRequest, LoginResponse
from ..utils import create_token_for_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("""
            SELECT p.id_persona, p.nombre, u.id_usuario, u.contrasena
            FROM PERSONA p
            JOIN USUARIO u ON p.id_persona = u.id_persona
            WHERE LOWER(p.nombre) = LOWER(:1)
        """, (payload.username,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        id_persona, nombre, id_usuario, contrasena = row[0], row[1], row[2], row[3]
        if payload.password != contrasena:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        token = create_token_for_user(id_persona, nombre)
        return {"access_token": token, "nombre": nombre, "id_persona": id_persona}
    finally:
        cur.close(); conn.close()
