# backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional

# -----------------
# Institución / Sede / Programa / Aula
# -----------------
class InstitucionCreate(BaseModel):
    nombre: str

class SedeCreate(BaseModel):
    nombre_sede: str
    direccion: Optional[str] = None
    id_institucion: int

class ProgramaCreate(BaseModel):
    tipo: str

# Aula: incluimos campos de ambas variantes (ER y versión anterior)
class AulaCreate(BaseModel):
    # campos del ER
    grado: Optional[str] = None
    id_sede: Optional[int] = None
    id_tutor: Optional[int] = None
    id_programa: Optional[int] = None
    # campos alternativos (algunos routers usan estos)
    codigo_aula: Optional[str] = None
    capacidad: Optional[int] = None
    ubicacion: Optional[str] = None

class AulaUpdate(BaseModel):
    grado: Optional[str] = None
    id_sede: Optional[int] = None
    id_tutor: Optional[int] = None
    id_programa: Optional[int] = None
    codigo_aula: Optional[str] = None
    capacidad: Optional[int] = None
    ubicacion: Optional[str] = None

class AulaResponse(AulaCreate):
    id_aula: int

# -----------------
# Persona / Usuario / Tutor / Estudiante
# -----------------
class PersonaCreate(BaseModel):
    nombre: str
    rol: Optional[str] = None

class PersonaRead(BaseModel):
    id_persona: int
    nombre: str
    rol: Optional[str] = None

class UsuarioCreate(BaseModel):
    contrasena: str
    id_persona: int

class TutorCreate(BaseModel):
    id_persona: int

class TutorRead(BaseModel):
    id_tutor: int
    id_persona: int

class AsignacionTutorCreate(BaseModel):
    id_tutor: int
    id_aula: int
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None

class EstudianteCreate(BaseModel):
    tipo_documento: Optional[str] = None
    nombre: str
    grado: Optional[str] = None
    score_inicial: Optional[float] = None
    score_final: Optional[float] = None
    id_aula: Optional[int] = None

class EstudianteRead(BaseModel):
    id_estudiante: int
    tipo_documento: Optional[str]
    nombre: str
    grado: Optional[str]
    score_inicial: Optional[float]
    score_final: Optional[float]
    id_aula: Optional[int]

# -----------------
# Horario / Periodo / Componente / Nota
# -----------------
class HorarioCreate(BaseModel):
    dia: str
    hora_inicio: str
    hora_fin: str
    id_aula: Optional[int] = None

class PeriodoCreate(BaseModel):
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    id_programa: Optional[int] = None

class ComponenteCreate(BaseModel):
    nombre: str
    porcentaje: float
    id_programa: int

# Nota: incluyo ambos nombres (valor / calificacion) para compatibilidad
class NotaCreate(BaseModel):
    # campos usados por algunas versiones
    valor: Optional[float] = None
    # campos usados por las versiones de router recientes
    calificacion: Optional[float] = None
    id_estudiante: int
    id_periodo: Optional[int] = None
    id_componente: Optional[int] = None
    id_tutor: Optional[int] = None

class NotaUpdate(BaseModel):
    calificacion: Optional[float] = None
    id_estudiante: Optional[int] = None
    id_componente: Optional[int] = None

class NotaResponse(BaseModel):
    id_nota: int
    id_estudiante: int
    id_componente: Optional[int] = None
    # devolver el campo que use el router (calificacion/valor)
    calificacion: Optional[float] = None
    valor: Optional[float] = None
    fecha_registro: Optional[str] = None

# -----------------
# Asistencia / Motivo / Festivo / Registro de cambio
# -----------------
class AsistenciaTutorCreate(BaseModel):
    fecha: Optional[str] = None
    se_dio: Optional[int] = 1
    id_tutor: int
    id_horario: Optional[int] = None
    id_motivo: Optional[int] = None
    id_asistencia_reposicion: Optional[int] = None
    # alternativas que usan otros routers
    id_aula: Optional[int] = None
    hora_entrada: Optional[str] = None
    hora_salida: Optional[str] = None

class AsistenciaTutorResponse(BaseModel):
    id_asistencia: int
    id_tutor: Optional[int] = None
    id_aula: Optional[int] = None
    fecha: Optional[str] = None
    hora_entrada: Optional[str] = None
    hora_salida: Optional[str] = None
    se_dio: Optional[int] = None

class AsistenciaEstudianteCreate(BaseModel):
    fecha: Optional[str] = None
    id_estudiante: int
    id_aula: Optional[int] = None
    hora_entrada: Optional[str] = None
    hora_salida: Optional[str] = None
    presente: Optional[int] = None

class AsistenciaEstudianteResponse(BaseModel):
    id_asistencia: int
    id_estudiante: Optional[int] = None
    id_aula: Optional[int] = None
    fecha: Optional[str] = None
    hora_entrada: Optional[str] = None
    hora_salida: Optional[str] = None
    presente: Optional[int] = None

class MotivoCreate(BaseModel):
    descripcion: str

class FestivoCreate(BaseModel):
    fecha_festivo: str
    descripcion: Optional[str] = None

class RegistroCambioCreate(BaseModel):
    fecha: Optional[str] = None
    hora: Optional[str] = None
    motivo: Optional[str] = None
    id_persona: Optional[int] = None
    id_tutor: Optional[int] = None

# -----------------
# Auth
# -----------------
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nombre: str
    id_persona: int
