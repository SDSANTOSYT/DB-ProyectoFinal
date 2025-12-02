# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db, get_conn

# importa routers
from .routers import (
    auth,
    persona,
    usuario,
    tutor,
    estudiante,
    aula,
    sede,
    programa,
    horario,
    periodo,
    componente,
    nota,
    asistencia,
    motivo,
    registro_cambio,
    institucion,
)

app = FastAPI(
    title="GlobalEnglish API - Modelo ER Real",
    version="1.0.0",
)

# --------------------------
# Configuración de CORS
# --------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # en prod, pon aquí los dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],        # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],        # Permitir todos los headers
)

# --------------------------
# Eventos de inicio
# --------------------------
@app.on_event("startup")
def startup():
    # Inicializa el pool de conexiones a Oracle
    init_db()

# --------------------------
# Endpoints de diagnóstico
# --------------------------
@app.get("/", tags=["health"])
def root():
    return {"message": "GlobalEnglish API - Modelo ER Real", "status": "running"}

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

@app.get("/db-health", tags=["health"])
def db_health():
    """
    Endpoint para comprobar que la conexión a Oracle funciona.
    Hace un SELECT 1 FROM dual.
    """
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM dual")
        row = cur.fetchone()
        return {"db_ok": True, "result": row[0]}
    except Exception as ex:
        # Si algo falla con la BD, verás el detalle en la respuesta
        raise HTTPException(status_code=500, detail=f"DB error: {ex}")
    finally:
        conn.close()

# --------------------------
# Registrar routers
# --------------------------
app.include_router(auth.router)
app.include_router(persona.router)
app.include_router(usuario.router)
app.include_router(tutor.router)
app.include_router(estudiante.router)
app.include_router(aula.router)
app.include_router(sede.router)
app.include_router(programa.router)
app.include_router(horario.router)
app.include_router(periodo.router)
app.include_router(componente.router)
app.include_router(nota.router)
app.include_router(asistencia.router)
app.include_router(motivo.router)
app.include_router(registro_cambio.router)
app.include_router(institucion.router)
