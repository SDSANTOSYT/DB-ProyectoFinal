# app/main.py
from fastapi import FastAPI
from .db import init_db
from .routers import persona, auth

app = FastAPI(title="GlobalEnglish API")

@app.on_event("startup")
def startup():
    init_db()

app.include_router(persona.router)
app.include_router(auth.router)

