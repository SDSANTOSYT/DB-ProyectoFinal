export type Rol = 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TUTOR';


export interface Aula {
  id_aula: number
  grado: string
  id_sede: number
  id_programa: number
  id_tutor: number
}


export interface User {
  nombre: string;
  correo: string;
  rol: Rol;
  id_persona: string;
}

export interface Horario {
    id_horario: number,
    dia: string,
    hora_inicio: string,
    hora_fin: string,
    id_aula: number,
    id_tutor: number
  }