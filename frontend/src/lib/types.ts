export type Rol = 'NULL'| 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TUTOR';

export type Jornada = 'NULL' | 'UNICA MAÑANA' | 'UNICA TARDE' | 'MIXTA';

export interface AulaInfo{
  id_aula: number
  id_sede: number
  id_institucion: number
  grado: string
}

export interface Aula {
  id_aula: number
  nombre: string
  grado: string
  id_sede: number
  nombre_sede: string
  id_institucion: number
  nombre_institucion: string
  id_programa: number
  id_tutor: number
}


export interface User {
  nombre: string;
  correo: string;
  rol: Rol;
  id_persona: number;
}

export interface Tutor {
  id_tutor: number;
  id_persona: number,
}

export interface Horario {
  id_horario: number,
  dia: string,
  hora_inicio: string,
  hora_fin: string,
  id_aula: number,
  id_tutor: number
  }

export interface Institucion {
  id_institucion: number,
  nombre: string,
  duracion_hora: number,
  jornada: string
}

export interface Sede {
  id_sede: number,
  id_institucion: number,
  nombre_sede: string,
  direccion: string,
  telefono: string
}

export interface Estudiante {
  id_estudiante: number,
  tipo_documento: string,
  nombre:string,
  grado: string,
  score_inicial: number,
  score_final: number,
  id_aula: number,
  nombre_aula: string,
  id_sede: number,
  nombre_sede: string,
  id_institucion: number
  nombre_institucion: string,
}
