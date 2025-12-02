# backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional

# -----------------
# Institución / Sede / Programa / Aula
# -----------------
class InstitucionCreate(BaseModel):
    nombre: str
    jornada: str
    duracion_hora: int

class SedeCreate(BaseModel):
    nombre_sede: str
    direccion: Optional[str] = None
    id_institucion: int
    telefono: Optional[str] = None

class ProgramaCreate(BaseModel):
    tipo: str

class InstitucionRead(BaseModel):
    id_institucion: int
    nombre: str
    duracion_hora: int
    jornada: str

class SedeRead(BaseModel):
    id_sede: int
    nombre_sede: str
    direccion: Optional[str] = None
    id_institucion: Optional[int] = None
    telefono: Optional[str] = None

# Aula: incluimos campos de ambas variantes 
class AulaCreate(BaseModel):
    nombre_aula: Optional[str] = None
    grado: Optional[str] = None
    id_sede: int
    id_institucion: int
    id_programa: Optional[int] = None
    id_tutor: Optional[int] = None

class AulaUpdate(BaseModel):
    id_aula: int
    nombre_aula: Optional[str] = None
    grado: Optional[str] = None
    id_sede: int
    nombre_sede: Optional[str] = None
    id_institucion: int
    nombre_institucion: Optional[str] = None
    id_programa: int
    id_tutor: Optional[int] = None

class AulaResponse(AulaCreate):
    id_aula: int
    nombre_aula: Optional[str] = None
    grado: Optional[str] = None
    id_sede: int
    nombre_sede: Optional[str] = None
    id_institucion: int
    nombre_institucion: Optional[str] = None
    id_programa: Optional[int] = None
    id_tutor: Optional[int] = None

class AsignarTutorRequest(BaseModel):
    id_aula: int
    id_sede: int
    id_institucion: int
    id_tutor: Optional[int] = None
    

# -----------------
# Persona / Usuario / Tutor / Estudiante
# -----------------
class PersonaCreate(BaseModel):
    id_persona: int
    nombre: str
    rol: Optional[str] = None
    correo: Optional[str] = None

class PersonaRead(BaseModel):
    id_persona: int
    nombre: str
    rol: Optional[str] = None
    correo: Optional[str] = None 

class UsuarioCreate(BaseModel):
    contrasena: str
    id_persona: int

class TutorCreate(BaseModel):
    id_persona: Optional[int] = None

class TutorRead(BaseModel):
    id_tutor: int
    id_persona: int

class AsignacionTutorCreate(BaseModel):
    id_tutor: int
    id_aula: int
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None

class EstudianteCreate(BaseModel):
    id_estudiante: int
    tipo_documento: Optional[str] = None
    nombre: str
    grado: Optional[str] = None
    score_inicial: Optional[float] = None
    id_aula: Optional[int] = None
    id_sede: Optional[int] = None
    id_institucion: Optional[int] = None

class EstudianteRead(BaseModel):
    id_estudiante: int
    tipo_documento: Optional[str] = None
    nombre: str
    grado: Optional[str] = None
    score_inicial: Optional[float] = None
    score_final: Optional[float] = None
    id_aula: Optional[int] = None
    id_sede: Optional[int] = None
    id_institucion: Optional[int] = None
    
class EstudianteInfoRead(BaseModel):
    id_estudiante: int
    tipo_documento: Optional[str] = None
    nombre: str
    grado: Optional[str] = None
    score_inicial: Optional[int] = None
    score_final: Optional[int] = None
    id_aula: Optional[int] = None
    nombre_aula: Optional[str] = None
    id_sede: Optional[int] = None
    nombre_sede: Optional[str] = None
    id_institucion: Optional[int] = None
    nombre_institucion: Optional[str] = None

class CambiarAulaRequest(BaseModel):
    id_aula: int
    id_sede: int
    id_institucion: int
    

class ActualizarScoreFinalRequest(BaseModel):
    score_final: float


# -----------------
# Tutor
# -----------------
    

class TutorListItem(BaseModel):
    id_tutor: int
    id_persona: Optional[int] = None
    
class TutorListInfoItem(BaseModel):
    id_tutor: int
    id_persona: Optional[int] = None
    nombre_persona: Optional[str] = None

class TutorAssignRequest(BaseModel):
    id_persona: int

class TutorAssignResponse(BaseModel):
    id_tutor: int
    id_persona: Optional[int] = None
    mensaje: Optional[str] = None

class TutorDeleteResponse(BaseModel):
    id_tutor: int
    mensaje: str

class TutorUnlinkResponse(BaseModel):
    id_tutor: int
    id_persona: Optional[int] = None
    mensaje: str

class TutorAulaAssignRequest(BaseModel):
    id_tutor: int
    id_aula: int
    id_sede: int
    id_institucion: int

class TutorAulaAssignResponse(BaseModel):
    tutor: TutorListItem
    aula: AulaUpdate
    mensaje: Optional[str] = None

# -----------------
# Horario / Periodo / Componente / Nota
# -----------------
class HorarioCreate(BaseModel):
    dia: str
    hora_inicio: str
    hora_fin: str
    duracion_minutos: int = 60
    id_aula: int

class HorarioRead(BaseModel):
    id_horario: int
    dia: str
    hora_inicio: str
    hora_fin: str
    id_aula: Optional[int] = None
    id_sede: Optional[int] = None
    id_institucion: Optional[int] = None
    grado: Optional[str] = None
    nombre_aula: Optional[str] = None

class HorarioUpdate(BaseModel):
    dia: Optional[str] = None
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    duracion_minutos: Optional[int] = 60

class HorarioAsignacionCreate(BaseModel):
    id_horario: int
    id_aula: int

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
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nombre: str
    correo: Optional[str] = None  
    rol: Optional[str] = None     
    id_persona: int

class TutorIdResponse(BaseModel):
    id_tutor: Optional[int] = None

class AulaSimple(BaseModel):
    id_aula: int
    grado: Optional[str] = None
    id_sede: Optional[int] = None
    id_programa: Optional[int] = None
    id_tutor: Optional[int] = None

class AulasCountResponse(BaseModel):
    id_tutor: int
    numero_aulas: int

class AulaStudentCount(BaseModel):
    id_aula: int
    numero_estudiantes: int

class StudentSimple(BaseModel):
    id_estudiante: int
    nombre: Optional[str] = None
    tipo_documento: Optional[str] = None
    grado: Optional[str] = None

class HorarioSimple(BaseModel):
    id_horario: int
    dia: Optional[str] = None
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    id_aula: Optional[int] = None
    id_tutor: Optional[int] = None


# -----------------
# Sede
# -----------------

class SedeRead(BaseModel):
    id_sede: int
    id_institucion: int
    nombre_sede: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None

class SedeCreate(BaseModel):
    nombre_sede: str
    direccion: Optional[str] = None
    id_institucion: int
    telefono: Optional[str] = None


