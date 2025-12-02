import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Plus, X } from 'lucide-react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewWeek, createViewMonthGrid } from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';

// API URL - ajusta según tu configuración
const API_URL = 'http://localhost:8000';

interface Aula {
  id_aula: number;
  nombre_aula: string;
  grado: string;
  id_sede: number;
  id_institucion: number;
  id_tutor: number;
  id_programa: number;
  duracion_hora?: number;
  tipo_programa?: string;
}

interface Tutor {
  id_persona: number;
  nombre: string;
  apellido: string;
}

interface Horario {
  id_horario: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  id_aula: number;
  nombre_aula?: string;
  grado?: string;
  tutor?: Tutor;
  nombre_tutor?: string;
}

interface HorarioFormData {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  id_aula: number;
  duracion_minutos: number;
}

// Función para generar eventos recurrentes
const generarEventosRecurrentes = (horarios: Horario[], numSemanas: number = 52) => {
  const eventos = [];
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Fecha base: primera semana completa del año 2024
  const fechaBase = new Date('2024-01-01');

  for (const horario of horarios) {
    const diaIndex = diasSemana.indexOf(horario.dia);
    if (diaIndex === -1) continue;

    // Generar eventos para cada semana
    for (let semana = 0; semana < numSemanas; semana++) {
      // Calcular la fecha para esta semana
      const fecha = new Date(fechaBase);
      fecha.setDate(fechaBase.getDate() + (semana * 7) + diaIndex);

      // Formatear fecha como YYYY-MM-DD
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      const fechaStr = `${año}-${mes}-${dia}`;

      eventos.push({
        id: `${horario.id_horario}-semana${semana}`,
        title: `${horario.nombre_aula || 'Aula'} - ${horario.grado}°\n${horario.nombre_tutor || 'Sin tutor'}`,
        start: `${fechaStr}T${horario.hora_inicio}`,
        end: `${fechaStr}T${horario.hora_fin}`,
        // Datos adicionales para referencia
        _horarioId: horario.id_horario,
        _aulaId: horario.id_aula
      });
    }
  }

  return eventos;
};

export default function MiHorario() {
  const user = { id_persona: 1, rol: 'ADMINISTRATIVO' }; // Mock user
  const [misAulas, setMisAulas] = useState<Aula[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [tutores, setTutores] = useState<Map<number, Tutor>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [formData, setFormData] = useState<HorarioFormData>({
    dia: 'Lunes',
    hora_inicio: '06:00',
    hora_fin: '07:00',
    id_aula: 0,
    duracion_minutos: 60
  });
  const [error, setError] = useState<string | null>(null);

  const puedeEditarHorarios = user?.rol === 'ADMINISTRATIVO' || user?.rol === 'ADMINISTRADOR';
  const esTutor = user?.rol === 'TUTOR';

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const generarHoras = () => {
    const horas = [];
    for (let i = 6; i <= 18; i++) {
      horas.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return horas;
  };

  const horasDisponibles = generarHoras();

  // Simular carga de datos
  useEffect(() => {
    setTimeout(() => {
      // Mock data
      setMisAulas([
        { id_aula: 1, nombre_aula: '4-A', grado: '4', id_sede: 1, id_institucion: 1, id_tutor: 1, id_programa: 1, duracion_hora: 60 },
        { id_aula: 2, nombre_aula: '5-B', grado: '5', id_sede: 1, id_institucion: 1, id_tutor: 2, id_programa: 2, duracion_hora: 90 }
      ]);

      setTutores(new Map([
        [1, { id_persona: 1, nombre: 'María', apellido: 'García' }],
        [2, { id_persona: 2, nombre: 'Juan', apellido: 'Pérez' }]
      ]));

      setHorarios([
        {
          id_horario: 1,
          dia: 'Lunes',
          hora_inicio: '08:00',
          hora_fin: '09:00',
          id_aula: 1,
          nombre_aula: '4-A',
          grado: '4',
          nombre_tutor: 'María García'
        },
        {
          id_horario: 2,
          dia: 'Miércoles',
          hora_inicio: '10:00',
          hora_fin: '11:30',
          id_aula: 2,
          nombre_aula: '5-B',
          grado: '5',
          nombre_tutor: 'Juan Pérez'
        }
      ]);

      setLoading(false);
    }, 500);
  }, []);

  // Calcular estadísticas
  const totalClases = horarios.length;
  const horasSemanales = horarios.reduce((acc, h) => {
    const inicio = new Date(`2000-01-01T${h.hora_inicio}`);
    const fin = new Date(`2000-01-01T${h.hora_fin}`);
    const duracion = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    return acc + duracion;
  }, 0);

  const validarMaximoHoras = (aulaId: number): { valido: boolean; mensaje: string } => {
    const aula = misAulas.find(a => a.id_aula === aulaId);
    if (!aula) return { valido: false, mensaje: 'Aula no encontrada' };

    const horariosAula = horarios.filter(h => h.id_aula === aulaId);
    const maxHoras = aula.id_programa === 1 ? 2 : 3;

    if (horariosAula.length >= maxHoras) {
      return {
        valido: false,
        mensaje: `Esta aula ya tiene ${horariosAula.length} hora(s) asignada(s). Máximo permitido: ${maxHoras} horas por semana.`
      };
    }

    return { valido: true, mensaje: '' };
  };

  const validarDia = (dia: string, grado: string): boolean => {
    const gradoNum = parseInt(grado);
    if (gradoNum === 4 || gradoNum === 5) {
      return !dia.includes('Sábado');
    }
    return true;
  };

  const abrirModal = (aula: Aula) => {
    if (!puedeEditarHorarios) {
      setError('No tienes permisos para crear horarios');
      setTimeout(() => setError(null), 5000);
      return;
    }

    const validacion = validarMaximoHoras(aula.id_aula);
    if (!validacion.valido) {
      setError(validacion.mensaje);
      setTimeout(() => setError(null), 5000);
      return;
    }

    setSelectedAula(aula);
    const duracion = aula.duracion_hora || 60;

    setFormData({
      dia: 'Lunes',
      hora_inicio: '06:00',
      hora_fin: '07:00',
      id_aula: aula.id_aula,
      duracion_minutos: duracion
    });
    setError(null);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedAula(null);
    setError(null);
  };

  const calcularHoraFin = (horaInicio: string, duracion: number): string => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const fechaInicio = new Date(2000, 0, 1, horas, minutos);
    fechaInicio.setMinutes(fechaInicio.getMinutes() + duracion);

    return `${fechaInicio.getHours().toString().padStart(2, '0')}:${fechaInicio.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAula) return;

    if (!validarDia(formData.dia, selectedAula.grado)) {
      setError('Grados 4° y 5° solo pueden tener clases de Lunes a Viernes');
      return;
    }

    const horaFin = calcularHoraFin(formData.hora_inicio, formData.duracion_minutos);
    const tutor = tutores.get(selectedAula.id_tutor);

    // Simular creación
    const nuevoHorario: Horario = {
      id_horario: horarios.length + 1,
      dia: formData.dia,
      hora_inicio: formData.hora_inicio,
      hora_fin: horaFin,
      id_aula: selectedAula.id_aula,
      nombre_aula: selectedAula.nombre_aula,
      grado: selectedAula.grado,
      tutor: tutor,
      nombre_tutor: tutor ? `${tutor.nombre} ${tutor.apellido}` : 'Sin tutor'
    };

    setHorarios([...horarios, nuevoHorario]);
    cerrarModal();
  };

  const eliminarHorario = async (idHorario: number) => {
    if (!puedeEditarHorarios) {
      setError('No tienes permisos para eliminar horarios');
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (!confirm('¿Está seguro de eliminar este horario?')) return;
    setHorarios(horarios.filter(h => h.id_horario !== idHorario));
  };

  // Configuración del calendario con eventos recurrentes
  const calendar = useCalendarApp({
    views: [createViewWeek(), createViewMonthGrid()],
    events: generarEventosRecurrentes(horarios, 52) as any, // 52 semanas (1 año) — cast para compatibilidad de tipos
    weekOptions: {
      gridHeight: 1200,
    },
    dayBoundaries: {
      start: '05:00',
      end: '21:00'
    }
  });

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl mb-2">
          {esTutor ? 'Mi Horario' : 'Gestión de Horarios'}
        </h1>
        <p className="text-muted-foreground">
          {esTutor
            ? 'Calendario semanal de clases asignadas'
            : 'Administración de horarios del sistema'}
        </p>
        <p className="text-sm text-blue-600 mt-2">
          ℹ️ Los horarios se repiten automáticamente cada semana durante todo el año
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {esTutor ? 'Aulas Asignadas' : 'Total Aulas'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{misAulas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Clases por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{totalClases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Horas Semanales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{horasSemanales.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      {/* List View */}
      <Card>
        <CardHeader>
          <CardTitle>
            {esTutor ? 'Mis Aulas y Horarios' : 'Aulas y Horarios'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {misAulas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {esTutor ? 'No tienes aulas asignadas' : 'No hay aulas en el sistema'}
              </p>
            ) : (
              misAulas.map((aula) => {
                const horariosAula = horarios.filter(h => h.id_aula === aula.id_aula);
                const maxHoras = aula.id_programa === 1 ? 2 : 3;
                const puedeAgregarMas = horariosAula.length < maxHoras;
                const tutor = tutores.get(aula.id_tutor);

                return (
                  <div key={aula.id_aula} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{aula.nombre_aula}</p>
                        <p className="text-sm text-muted-foreground">
                          Grado {aula.grado}° • {aula.id_programa === 1 ? 'INSIDECLASSROOM' : 'OUTSIDECLASSROOM'} •
                          {horariosAula.length}/{maxHoras} horas asignadas
                        </p>
                        {tutor && (
                          <p className="text-sm text-blue-600 mt-1">
                            Tutor: {tutor.nombre} {tutor.apellido}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant={aula.id_programa === 1 ? 'default' : 'secondary'}>
                          {aula.id_programa === 1 ? 'INSIDECLASSROOM' : 'OUTSIDECLASSROOM'}
                        </Badge>
                        {puedeEditarHorarios && puedeAgregarMas && (
                          <Button
                            size="sm"
                            onClick={() => abrirModal(aula)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar Horario
                          </Button>
                        )}
                      </div>
                    </div>

                    {horariosAula.length > 0 ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {horariosAula.map((horario) => (
                          <div
                            key={horario.id_horario}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded"
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{horario.dia}</span>
                              <span className="text-muted-foreground">
                                {horario.hora_inicio} - {horario.hora_fin}
                              </span>
                            </div>
                            {puedeEditarHorarios && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => eliminarHorario(horario.id_horario)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No hay horarios asignados para esta aula
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario (Vista Semanal y Mensual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <ScheduleXCalendar calendarApp={calendar} />
          </div>
        </CardContent>
      </Card>

      {/* Modal para crear horario */}
      {showModal && selectedAula && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Agregar Horario</h2>
              <Button variant="ghost" size="sm" onClick={cerrarModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm font-medium">{selectedAula.nombre_aula}</p>
              <p className="text-xs text-muted-foreground">
                Grado {selectedAula.grado}° • Duración: {selectedAula.duracion_hora || 60} min
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Día</label>
                <select
                  value={formData.dia}
                  onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  {diasSemana.map(dia => {
                    const esValido = validarDia(dia, selectedAula.grado);
                    return (
                      <option key={dia} value={dia} disabled={!esValido}>
                        {dia} {!esValido ? '(No disponible)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hora de inicio</label>
                <select
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  {horasDisponibles.map(hora => (
                    <option key={hora} value={hora}>{hora}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Hora de fin (calculada automáticamente)
                </label>
                <input
                  type="text"
                  value={calcularHoraFin(formData.hora_inicio, formData.duracion_minutos)}
                  className="w-full p-2 border rounded bg-gray-50"
                  disabled
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={cerrarModal}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  Crear Horario
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}