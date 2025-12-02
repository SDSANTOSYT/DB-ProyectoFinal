import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewWeek } from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill';

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

export default function MiHorario() {
  const { user } = useAuth();
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

  // Verificar si el usuario puede editar horarios
  const puedeEditarHorarios = user?.rol === 'ADMINISTRATIVO' || user?.rol === 'ADMINISTRADOR';
  const esTutor = user?.rol === 'TUTOR';

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Generar horas desde 06:00 hasta 18:00
  const generarHoras = () => {
    const horas = [];
    for (let i = 6; i <= 18; i++) {
      horas.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return horas;
  };

  const horasDisponibles = generarHoras();

  // Cargar tutores
  useEffect(() => {
    const cargarTutores = async () => {
      try {
        const response = await fetch(`${API_URL}/personas?rol=TUTOR`);
        const data = await response.json();

        const tutoresMap = new Map<number, Tutor>();
        data.forEach((tutor: any) => {
          tutoresMap.set(tutor.id_persona, {
            id_persona: tutor.id_persona,
            nombre: tutor.nombre,
            apellido: tutor.apellido
          });
        });

        setTutores(tutoresMap);
      } catch (err) {
        console.error('Error al cargar tutores:', err);
      }
    };

    cargarTutores();
  }, []);

  // Cargar aulas
  useEffect(() => {
    const cargarAulas = async () => {
      if (!user?.id_persona) return;

      try {
        const response = await fetch(`${API_URL}/aulas/`);
        const data = await response.json();

        // Si es tutor, filtrar solo sus aulas. Si es admin, mostrar todas
        let aulasAMostrar;
        if (esTutor) {
          aulasAMostrar = data.filter((aula: Aula) => aula.id_tutor === Number(user.id_persona));
        } else {
          aulasAMostrar = data; // Administrativos y administradores ven todas las aulas
        }

        setMisAulas(aulasAMostrar);
      } catch (err) {
        console.error('Error al cargar aulas:', err);
        setError('Error al cargar las aulas');
      }
    };

    cargarAulas();
  }, [user?.id_persona, esTutor]);

  // Cargar horarios con información de tutor
  useEffect(() => {
    const cargarHorarios = async () => {
      if (!user?.id_persona || misAulas.length === 0) {
        setLoading(false);
        return;
      }

      try {
        let response;
        if (esTutor) {
          // Tutores solo ven sus horarios
          response = await fetch(`${API_URL}/horarios?id_tutor=${user.id_persona}`);
        } else {
          // Administrativos ven todos los horarios
          response = await fetch(`${API_URL}/horarios?limit=1000`);
        }

        const data = await response.json();

        // Enriquecer horarios con información de tutor
        const horariosEnriquecidos = data.map((horario: any) => {
          const aula = misAulas.find(a => a.id_aula === horario.id_aula);
          const tutor = aula ? tutores.get(aula.id_tutor) : null;

          return {
            ...horario,
            nombre_aula: aula?.nombre_aula,
            grado: aula?.grado,
            tutor: tutor,
            nombre_tutor: tutor ? `${tutor.nombre} ${tutor.apellido}` : 'Sin tutor'
          };
        });

        setHorarios(horariosEnriquecidos);
      } catch (err) {
        console.error('Error al cargar horarios:', err);
        setError('Error al cargar los horarios');
      } finally {
        setLoading(false);
      }
    };

    cargarHorarios();
  }, [user?.id_persona, esTutor, misAulas, tutores]);

  // Calcular estadísticas
  const totalClases = horarios.length;
  const horasSemanales = horarios.reduce((acc, h) => {
    const inicio = new Date(`2000-01-01T${h.hora_inicio}`);
    const fin = new Date(`2000-01-01T${h.hora_fin}`);
    const duracion = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    return acc + duracion;
  }, 0);

  // Validar máximo de horas por aula
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

  // Validar días permitidos según grado
  const validarDia = (dia: string, grado: string): boolean => {
    const gradoNum = parseInt(grado);
    if (gradoNum === 4 || gradoNum === 5) {
      return !dia.includes('Sábado');
    }
    return true;
  };

  const abrirModal = (aula: Aula) => {
    console.log('Abriendo modal para aula:', aula);
    console.log('Usuario puede editar:', puedeEditarHorarios);

    if (!puedeEditarHorarios) {
      setError('No tienes permisos para crear horarios');
      setTimeout(() => setError(null), 5000);
      return;
    }

    const validacion = validarMaximoHoras(aula.id_aula);
    console.log('Validación de máximo de horas:', validacion);

    if (!validacion.valido) {
      setError(validacion.mensaje);
      setTimeout(() => setError(null), 5000);
      return;
    }

    setSelectedAula(aula);
    const duracion = aula.duracion_hora || 60;
    console.log('Duración de hora para esta aula:', duracion);

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

    // Validar día según grado
    if (!validarDia(formData.dia, selectedAula.grado)) {
      setError('Grados 4° y 5° solo pueden tener clases de Lunes a Viernes');
      return;
    }

    // Calcular hora fin
    const horaFin = calcularHoraFin(formData.hora_inicio, formData.duracion_minutos);

    const payload = {
      dia: formData.dia,
      hora_inicio: formData.hora_inicio,
      hora_fin: horaFin,
      duracion_minutos: formData.duracion_minutos,
      id_aula: selectedAula.id_aula
    };

    console.log('Enviando payload:', payload);

    try {
      const response = await fetch(`${API_URL}/horarios/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.detail || 'Error al crear horario');
      }

      const nuevoHorario = await response.json();
      console.log('Horario creado:', nuevoHorario);

      const tutor = tutores.get(selectedAula.id_tutor);

      // Actualizar lista de horarios
      setHorarios([...horarios, {
        id_horario: nuevoHorario.id_horario,
        dia: nuevoHorario.dia,
        hora_inicio: nuevoHorario.hora_inicio,
        hora_fin: nuevoHorario.hora_fin,
        id_aula: nuevoHorario.id_aula,
        nombre_aula: selectedAula.nombre_aula,
        grado: selectedAula.grado,
        tutor: tutor,
        nombre_tutor: tutor ? `${tutor.nombre} ${tutor.apellido}` : 'Sin tutor'
      }]);

      cerrarModal();
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message || 'Error al crear el horario');
    }
  };

  const eliminarHorario = async (idHorario: number) => {
    if (!puedeEditarHorarios) {
      setError('No tienes permisos para eliminar horarios');
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (!confirm('¿Está seguro de eliminar este horario?')) return;

    try {
      const response = await fetch(`${API_URL}/horarios/${idHorario}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar horario');
      }

      setHorarios(horarios.filter(h => h.id_horario !== idHorario));
    } catch (err) {
      console.error('Error al eliminar horario:', err);
      setError('Error al eliminar el horario');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Configuración del calendario con información de tutor
  const calendar = useCalendarApp({
    views: [createViewWeek()],
    events: horarios.map(h => {
      const diaIndex = diasSemana.indexOf(h.dia);
      // Asegurarnos de que el índice del día sea válido
      const diaCalendario = diaIndex >= 0 ? diaIndex + 1 : 1;

      console.log('Creando evento:', {
        horario: h,
        dia: h.dia,
        diaIndex,
        nombre_tutor: h.nombre_tutor
      });

      return {
        id: h.id_horario.toString(),
        title: `${h.nombre_aula || 'Aula'} - ${h.grado}°\n${h.nombre_tutor || 'Sin tutor'}`,
        start: `2024-01-0${diaCalendario}T${h.hora_inicio}`,
        end: `2024-01-0${diaCalendario}T${h.hora_fin}`,
      };
    }),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">
          {esTutor ? 'Mi Horario' : 'Gestión de Horarios'}
        </h1>
        <p className="text-muted-foreground">
          {esTutor
            ? 'Calendario semanal de clases asignadas'
            : 'Administración de horarios del sistema'}
        </p>
        {puedeEditarHorarios && (
          <p className="text-sm text-blue-600 mt-1">
            ✓ Tienes permisos para crear y eliminar horarios
          </p>
        )}
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
                          Grado {aula.grado}° • {aula.id_programa ? aula.id_programa === 1 ? 'INSIDECLASSROOM' : 'OUTSIDECLASSROOM' : 'Sin programa'} •
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
          <CardTitle>Calendario Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="scale-90 origin-top-left">
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
                <Button type="button" variant="outline" onClick={cerrarModal}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSubmit}>
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