// Mock data para demostración del sistema

export type ProgramaTipo = 'INSIDECLASSROOM' | 'OUTSIDECLASSROOM';
export type Grado = '4' | '5' | '9' | '10';

export interface Institucion {
  id: string;
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  ciudad: string;
}

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  institucionId: string;
}

export interface Horario {
  id: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export interface Tutor {
  id: string;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
}

export interface Aula {
  id: string;
  nombre: string;
  grado: Grado;
  programa: ProgramaTipo;
  sedeId: string;
  tutorId: string;
  horarios: Horario[];
  cantidadEstudiantes: number;
}

export interface Estudiante {
  id: string;
  nombre: string;
  documento: string;
  grado: Grado;
  aulaId: string;
  scoreInicial: number;
  scoreFinal: number | null;
  fechaMatricula: string;
}

export interface AsistenciaEstudiante {
  id: string;
  estudianteId: string;
  aulaId: string;
  fecha: string;
  presente: boolean;
}

export interface AsistenciaTutor {
  id: string;
  tutorId: string;
  aulaId: string;
  fecha: string;
  dictada: boolean;
  motivo?: string;
  requiereReposicion: boolean;
  fechaReposicion?: string;
  festivo: boolean;
}

export interface Nota {
  id: string;
  estudianteId: string;
  aulaId: string;
  periodo: string;
  componente: string;
  porcentaje: number;
  valor: number;
  observaciones?: string;
}

// Mock Data
export const instituciones: Institucion[] = [
  {
    id: 'inst-1',
    nombre: 'Colegio San José',
    nit: '900123456-1',
    direccion: 'Calle 45 #23-67',
    telefono: '3201234567',
    ciudad: 'Bogotá',
  },
  {
    id: 'inst-2',
    nombre: 'Instituto Técnico Industrial',
    nit: '900234567-2',
    direccion: 'Carrera 15 #89-23',
    telefono: '3109876543',
    ciudad: 'Medellín',
  },
  {
    id: 'inst-3',
    nombre: 'Liceo Moderno',
    nit: '900345678-3',
    direccion: 'Avenida 7 #34-56',
    telefono: '3158765432',
    ciudad: 'Cali',
  },
];

export const sedes: Sede[] = [
  {
    id: 'sede-1',
    nombre: 'Sede Principal',
    direccion: 'Calle 45 #23-67',
    telefono: '3201234567',
    institucionId: 'inst-1',
  },
  {
    id: 'sede-2',
    nombre: 'Sede Norte',
    direccion: 'Calle 100 #15-23',
    telefono: '3201234568',
    institucionId: 'inst-1',
  },
  {
    id: 'sede-3',
    nombre: 'Sede Única',
    direccion: 'Carrera 15 #89-23',
    telefono: '3109876543',
    institucionId: 'inst-2',
  },
  {
    id: 'sede-4',
    nombre: 'Campus Central',
    direccion: 'Avenida 7 #34-56',
    telefono: '3158765432',
    institucionId: 'inst-3',
  },
  {
    id: 'sede-5',
    nombre: 'Campus Sur',
    direccion: 'Calle 5 #12-34',
    telefono: '3158765433',
    institucionId: 'inst-3',
  },
];

export const tutores: Tutor[] = [
  {
    id: '3',
    nombre: 'Carlos Rodríguez',
    documento: '1122334455',
    email: 'carlos.rodriguez@globalenglish.com',
    telefono: '3201111111',
  },
  {
    id: 't-2',
    nombre: 'Ana María López',
    documento: '2233445566',
    email: 'ana.lopez@globalenglish.com',
    telefono: '3202222222',
  },
  {
    id: 't-3',
    nombre: 'Pedro Martínez',
    documento: '3344556677',
    email: 'pedro.martinez@globalenglish.com',
    telefono: '3203333333',
  },
  {
    id: 't-4',
    nombre: 'Laura Gómez',
    documento: '4455667788',
    email: 'laura.gomez@globalenglish.com',
    telefono: '3204444444',
  },
  {
    id: 't-5',
    nombre: 'Diego Torres',
    documento: '5566778899',
    email: 'diego.torres@globalenglish.com',
    telefono: '3205555555',
  },
];

export const aulas: Aula[] = [
  {
    id: 'aula-1',
    nombre: 'Aula 4A',
    grado: '4',
    programa: 'INSIDECLASSROOM',
    sedeId: 'sede-1',
    tutorId: '3',
    horarios: [
      { id: 'h-1', diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '09:30' },
      { id: 'h-2', diaSemana: 'Miércoles', horaInicio: '08:00', horaFin: '09:30' },
    ],
    cantidadEstudiantes: 28,
  },
  {
    id: 'aula-2',
    nombre: 'Aula 4B',
    grado: '4',
    programa: 'INSIDECLASSROOM',
    sedeId: 'sede-1',
    tutorId: 't-2',
    horarios: [
      { id: 'h-3', diaSemana: 'Martes', horaInicio: '10:00', horaFin: '11:30' },
      { id: 'h-4', diaSemana: 'Jueves', horaInicio: '10:00', horaFin: '11:30' },
    ],
    cantidadEstudiantes: 25,
  },
  {
    id: 'aula-3',
    nombre: 'Aula 5A',
    grado: '5',
    programa: 'INSIDECLASSROOM',
    sedeId: 'sede-2',
    tutorId: 't-3',
    horarios: [
      { id: 'h-5', diaSemana: 'Lunes', horaInicio: '14:00', horaFin: '15:30' },
      { id: 'h-6', diaSemana: 'Viernes', horaInicio: '14:00', horaFin: '15:30' },
    ],
    cantidadEstudiantes: 30,
  },
  {
    id: 'aula-4',
    nombre: 'Aula 9A',
    grado: '9',
    programa: 'OUTSIDECLASSROOM',
    sedeId: 'sede-3',
    tutorId: 't-4',
    horarios: [
      { id: 'h-7', diaSemana: 'Martes', horaInicio: '16:00', horaFin: '18:00' },
      { id: 'h-8', diaSemana: 'Jueves', horaInicio: '16:00', horaFin: '18:00' },
    ],
    cantidadEstudiantes: 22,
  },
  {
    id: 'aula-5',
    nombre: 'Aula 10A',
    grado: '10',
    programa: 'OUTSIDECLASSROOM',
    sedeId: 'sede-4',
    tutorId: 't-5',
    horarios: [
      { id: 'h-9', diaSemana: 'Miércoles', horaInicio: '17:00', horaFin: '19:00' },
      { id: 'h-10', diaSemana: 'Sábado', horaInicio: '09:00', horaFin: '11:00' },
    ],
    cantidadEstudiantes: 18,
  },
];

export const estudiantes: Estudiante[] = [
  // Aula 4A
  { id: 'est-1', nombre: 'Juan Pérez', documento: '1001234567', grado: '4', aulaId: 'aula-1', scoreInicial: 45, scoreFinal: null, fechaMatricula: '2025-01-15' },
  { id: 'est-2', nombre: 'María García', documento: '1001234568', grado: '4', aulaId: 'aula-1', scoreInicial: 38, scoreFinal: null, fechaMatricula: '2025-01-15' },
  { id: 'est-3', nombre: 'Luis Martínez', documento: '1001234569', grado: '4', aulaId: 'aula-1', scoreInicial: 52, scoreFinal: null, fechaMatricula: '2025-01-15' },
  { id: 'est-4', nombre: 'Carolina Silva', documento: '1001234570', grado: '4', aulaId: 'aula-1', scoreInicial: 41, scoreFinal: null, fechaMatricula: '2025-01-15' },
  { id: 'est-5', nombre: 'Andrés López', documento: '1001234571', grado: '4', aulaId: 'aula-1', scoreInicial: 48, scoreFinal: null, fechaMatricula: '2025-01-15' },
  
  // Aula 4B
  { id: 'est-6', nombre: 'Sofía Ramírez', documento: '1001234572', grado: '4', aulaId: 'aula-2', scoreInicial: 55, scoreFinal: null, fechaMatricula: '2025-01-16' },
  { id: 'est-7', nombre: 'Daniel Torres', documento: '1001234573', grado: '4', aulaId: 'aula-2', scoreInicial: 43, scoreFinal: null, fechaMatricula: '2025-01-16' },
  { id: 'est-8', nombre: 'Isabella Castro', documento: '1001234574', grado: '4', aulaId: 'aula-2', scoreInicial: 50, scoreFinal: null, fechaMatricula: '2025-01-16' },
  
  // Aula 5A
  { id: 'est-9', nombre: 'Camilo Herrera', documento: '1001234575', grado: '5', aulaId: 'aula-3', scoreInicial: 60, scoreFinal: null, fechaMatricula: '2025-01-17' },
  { id: 'est-10', nombre: 'Valentina Díaz', documento: '1001234576', grado: '5', aulaId: 'aula-3', scoreInicial: 58, scoreFinal: null, fechaMatricula: '2025-01-17' },
  { id: 'est-11', nombre: 'Santiago Morales', documento: '1001234577', grado: '5', aulaId: 'aula-3', scoreInicial: 62, scoreFinal: null, fechaMatricula: '2025-01-17' },
  
  // Aula 9A
  { id: 'est-12', nombre: 'Alejandra Ruiz', documento: '1001234578', grado: '9', aulaId: 'aula-4', scoreInicial: 70, scoreFinal: null, fechaMatricula: '2025-01-18' },
  { id: 'est-13', nombre: 'Sebastián Vargas', documento: '1001234579', grado: '9', aulaId: 'aula-4', scoreInicial: 65, scoreFinal: null, fechaMatricula: '2025-01-18' },
  { id: 'est-14', nombre: 'Natalia Jiménez', documento: '1001234580', grado: '9', aulaId: 'aula-4', scoreInicial: 72, scoreFinal: null, fechaMatricula: '2025-01-18' },
  
  // Aula 10A
  { id: 'est-15', nombre: 'Nicolás Mendoza', documento: '1001234581', grado: '10', aulaId: 'aula-5', scoreInicial: 75, scoreFinal: null, fechaMatricula: '2025-01-19' },
  { id: 'est-16', nombre: 'Gabriela Ortiz', documento: '1001234582', grado: '10', aulaId: 'aula-5', scoreInicial: 78, scoreFinal: null, fechaMatricula: '2025-01-19' },
  { id: 'est-17', nombre: 'Felipe Sánchez', documento: '1001234583', grado: '10', aulaId: 'aula-5', scoreInicial: 80, scoreFinal: null, fechaMatricula: '2025-01-19' },
];

// Helper functions
export function getInstitucionById(id: string): Institucion | undefined {
  return instituciones.find((i) => i.id === id);
}

export function getSedeById(id: string): Sede | undefined {
  return sedes.find((s) => s.id === id);
}

export function getSedesByInstitucion(institucionId: string): Sede[] {
  return sedes.filter((s) => s.institucionId === institucionId);
}

export function getTutorById(id: string): Tutor | undefined {
  return tutores.find((t) => t.id === id);
}

export function getAulaById(id: string): Aula | undefined {
  return aulas.find((a) => a.id === id);
}

export function getAulasBySede(sedeId: string): Aula[] {
  return aulas.filter((a) => a.sedeId === sedeId);
}

export function getAulasByTutor(tutorId: string): Aula[] {
  return aulas.filter((a) => a.tutorId === tutorId);
}

export function getEstudiantesByAula(aulaId: string): Estudiante[] {
  return estudiantes.filter((e) => e.aulaId === aulaId);
}
