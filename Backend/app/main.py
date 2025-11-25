# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db

# importa routers
from .routers import auth, persona, usuario, tutor, estudiante, aula, sede, programa, horario, periodo, componente, nota, asistencia, motivo, registro_cambio

app = FastAPI(title="GlobalEnglish API - Modelo ER Real")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O ["*"] para permitir todos (solo en desarrollo)
    allow_credentials=True,
    allow_methods=["*"],   # GET, POST, PUT, DELETE, etc
    allow_headers=["*"],   # Permitir todos los headers
)

@app.on_event("startup")
def startup():
    init_db()

# registrar routers
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
