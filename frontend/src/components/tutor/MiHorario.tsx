import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewWeek, createViewMonthGrid } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';

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

const ANIOS_A_GENERAR = 3;
const SEMANAS_POR_ANO = 52;

// 🔥 FUNCIÓN CLAVE: Generar eventos recurrentes usando Temporal (3 años)
const generarEventosRecurrentes = (
  horarios: Horario[],
  numSemanas: number = SEMANAS_POR_ANO * ANIOS_A_GENERAR
) => {
  console.log('🔄 ===== GENERANDO EVENTOS RECURRENTES =====');
  console.log('📊 Horarios recibidos:', horarios.length);
  console.log('📅 Semanas a generar:', numSemanas);

  if (horarios.length === 0) {
    console.warn('⚠️ NO HAY HORARIOS PARA PROCESAR');
    return [];
  }

  const eventos: any[] = [];

  // 1 = Lunes, 2 = Martes, ... 7 = Domingo
  const mapaDias: { [key: string]: number } = {
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
    Domingo: 7,
  };

  // Año base: 2024 (cubre 2024, 2025 y 2026 con 156 semanas)
  const año = 2024;
  const mes = 0; // Enero
  const diaInicio = 1; // 1 de enero de 2024

  horarios.forEach((horario, idx) => {
    console.log(`\n--- Horario ${idx + 1}/${horarios.length} ---`);
    console.log('Datos:', {
      dia: horario.dia,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      aula: horario.nombre_aula,
      grado: horario.grado,
    });

    const numeroDia = mapaDias[horario.dia];

    if (!numeroDia) {
      console.error(`❌ DÍA NO RECONOCIDO: "${horario.dia}"`);
      return;
    }

    console.log(`✓ Día "${horario.dia}" mapeado a número: ${numeroDia}`);

    for (let semana = 0; semana < numSemanas; semana++) {
      const fecha = new Date(año, mes, diaInicio + semana * 7 + (numeroDia - 1));

      const añoStr = fecha.getFullYear();
      const mesStr = String(fecha.getMonth() + 1).padStart(2, '0');
      const diaStr = String(fecha.getDate()).padStart(2, '0');
      const fechaStr = `${añoStr}-${mesStr}-${diaStr}`;

      // 🇨🇴 Timezone Bogotá (UTC-5)
      const inicioISO = `${fechaStr}T${horario.hora_inicio}:00-05:00[America/Bogota]`;
      const finISO = `${fechaStr}T${horario.hora_fin}:00-05:00[America/Bogota]`;

      const evento = {
        id: `${horario.id_horario}-sem${semana}`,
        title: `${horario.nombre_aula || 'Aula'} - ${horario.grado}°\n${
          horario.nombre_tutor || 'Sin tutor'
        }`,
        start: Temporal.ZonedDateTime.from(inicioISO),
        end: Temporal.ZonedDateTime.from(finISO),
      };

      if (semana < 2) {
        console.log(`  Semana ${semana}: ${fechaStr} | ${horario.hora_inicio}-${horario.hora_fin}`);
      }

      eventos.push(evento);
    }

    console.log(`✅ Generados ${numSemanas} eventos para este horario`);
  });

  console.log('\n🎯 ===== RESUMEN FINAL =====');
  console.log('Total eventos creados:', eventos.length);
  console.log('Primer evento:', eventos[0]);
  console.log('Último evento:', eventos[eventos.length - 1]);
  console.log('=================================\n');

  return eventos;
};

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
    duracion_minutos: 60,
  });
  const [error, setError] = useState<string | null>(null);

  const puedeEditarHorarios = user?.rol === 'ADMINISTRATIVO' || user?.rol === 'ADMINISTRADOR';
  const esTutor = user?.rol === 'TUTOR';

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const generarHoras = () => {
    const horas: string[] = [];
    for (let i = 6; i <= 18; i++) {
      horas.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return horas;
  };

  const horasDisponibles = generarHoras();

  // 🔌 Plugin de eventos: se crea una sola vez
  const eventsService = useState(() => createEventsServicePlugin())[0];

  // 1. Cargar tutores
  useEffect(() => {
    console.log('🔵 [1/3] Cargando tutores...');
    const cargarTutores = async () => {
      try {
        const response = await fetch(`${API_URL}/personas?rol=TUTOR`);
        const data = await response.json();
        console.log('✅ Tutores obtenidos:', data.length);

        const tutoresMap = new Map<number, Tutor>();
        data.forEach((tutor: any) => {
          tutoresMap.set(tutor.id_persona, {
            id_persona: tutor.id_persona,
            nombre: tutor.nombre,
            apellido: tutor.apellido,
          });
        });

        setTutores(tutoresMap);
        console.log('✅ Tutores guardados en estado:', tutoresMap.size);
      } catch (err) {
        console.error('❌ Error al cargar tutores:', err);
      }
    };

    cargarTutores();
  }, []);

  // 2. Cargar aulas
  useEffect(() => {
    console.log('🟡 [2/3] Cargando aulas...');
    const cargarAulas = async () => {
      if (!user?.id_persona) {
        console.warn('⚠️ No hay usuario, esperando...');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/aulas/`);
        const data = await response.json();
        console.log('✅ Aulas obtenidas del API:', data.length);

        let aulasAMostrar;
        if (esTutor) {
          aulasAMostrar = data.filter((aula: Aula) => aula.id_tutor === Number(user.id_persona));
          console.log(`✅ Aulas filtradas para tutor ${user.id_persona}:`, aulasAMostrar.length);
        } else {
          aulasAMostrar = data;
          console.log('✅ Mostrando todas las aulas (admin):', aulasAMostrar.length);
        }

        setMisAulas(aulasAMostrar);
      } catch (err) {
        console.error('❌ Error al cargar aulas:', err);
        setError('Error al cargar las aulas');
      }
    };

    cargarAulas();
  }, [user?.id_persona, esTutor]);

  // 3. Cargar horarios
  useEffect(() => {
    console.log('🟢 [3/3] Cargando horarios...');
    const cargarHorarios = async () => {
      if (!user?.id_persona) {
        console.warn('⚠️ No hay usuario');
        setLoading(false);
        return;
      }

      if (misAulas.length === 0) {
        console.warn('⚠️ Aún no hay aulas, esperando...');
        setLoading(false);
        return;
      }

      try {
        let response;
        if (esTutor) {
          console.log('📥 Obteniendo horarios del tutor:', user.id_persona);
          response = await fetch(`${API_URL}/horarios?id_tutor=${user.id_persona}`);
        } else {
          console.log('📥 Obteniendo TODOS los horarios (admin)');
          response = await fetch(`${API_URL}/horarios?limit=1000`);
        }

        const data = await response.json();
        console.log('✅ Horarios obtenidos del API:', data.length);
        console.log('📋 Primeros horarios:', data.slice(0, 3));

        const horariosEnriquecidos = data.map((horario: any) => {
          const aula = misAulas.find((a) => a.id_aula === horario.id_aula);
          const tutor = aula ? tutores.get(aula.id_tutor) : null;

          return {
            ...horario,
            nombre_aula: aula?.nombre_aula,
            grado: aula?.grado,
            tutor: tutor || undefined,
            nombre_tutor: tutor ? `${tutor.nombre} ${tutor.apellido}` : 'Sin tutor',
          } as Horario;
        });

        console.log('✅ Horarios enriquecidos:', horariosEnriquecidos.length);
        setHorarios(horariosEnriquecidos);
      } catch (err) {
        console.error('❌ Error al cargar horarios:', err);
        setError('Error al cargar los horarios');
      } finally {
        setLoading(false);
        console.log('✅ Carga completada');
      }
    };

    cargarHorarios();
  }, [user?.id_persona, esTutor, misAulas, tutores]);

  // 🔥 GENERAR EVENTOS PARA EL CALENDARIO (recurrentes 3 años)
  const eventosCalendario = useMemo(() => {
    console.log('📆 ===== GENERANDO EVENTOS PARA CALENDARIO =====');
    console.log('Horarios disponibles:', horarios.length);

    if (horarios.length === 0) {
      console.warn('⚠️ No hay horarios, calendario vacío');
      return [];
    }

    const eventos = generarEventosRecurrentes(horarios, SEMANAS_POR_ANO * ANIOS_A_GENERAR);
    console.log(
      '✅ Eventos generados para calendario (3 años):',
      eventos.length
    );
    return eventos;
  }, [horarios]);

  // Calcular estadísticas
  const totalClases = horarios.length;
  const horasSemanales = horarios.reduce((acc, h) => {
    const inicio = new Date(`2000-01-01T${h.hora_inicio}`);
    const fin = new Date(`2000-01-01T${h.hora_fin}`);
    const duracion = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    return acc + duracion;
  }, 0);

  const validarMaximoHoras = (aulaId: number): { valido: boolean; mensaje: string } => {
    const aula = misAulas.find((a) => a.id_aula === aulaId);
    if (!aula) return { valido: false, mensaje: 'Aula no encontrada' };

    const horariosAula = horarios.filter((h) => h.id_aula === aulaId);
    const maxHoras = aula.id_programa === 1 ? 2 : 3;

    if (horariosAula.length >= maxHoras) {
      return {
        valido: false,
        mensaje: `Esta aula ya tiene ${horariosAula.length} hora(s) asignada(s). Máximo permitido: ${maxHoras} horas por semana.`,
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
      duracion_minutos: duracion,
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

    return `${fechaInicio.getHours().toString().padStart(2, '0')}:${fechaInicio
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Creando nuevo horario...');
    setError(null);

    if (!selectedAula) return;

    if (!validarDia(formData.dia, selectedAula.grado)) {
      setError('Grados 4° y 5° solo pueden tener clases de Lunes a Viernes');
      return;
    }

    const horaFin = calcularHoraFin(formData.hora_inicio, formData.duracion_minutos);

    const payload = {
      dia: formData.dia,
      hora_inicio: formData.hora_inicio,
      hora_fin: horaFin,
      duracion_minutos: formData.duracion_minutos,
      id_aula: selectedAula.id_aula,
    };

    console.log('📤 Enviando:', payload);

    try {
      const response = await fetch(`${API_URL}/horarios/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear horario');
      }

      const nuevoHorario = await response.json();
      console.log('✅ Horario creado:', nuevoHorario);

      const tutor = tutores.get(selectedAula.id_tutor);

      setHorarios([
        ...horarios,
        {
          id_horario: nuevoHorario.id_horario,
          dia: nuevoHorario.dia,
          hora_inicio: nuevoHorario.hora_inicio,
          hora_fin: nuevoHorario.hora_fin,
          id_aula: nuevoHorario.id_aula,
          nombre_aula: selectedAula.nombre_aula,
          grado: selectedAula.grado,
          tutor: tutor,
          nombre_tutor: tutor ? `${tutor.nombre} ${tutor.apellido}` : 'Sin tutor',
        },
      ]);

      cerrarModal();
    } catch (err: any) {
      console.error('❌ Error:', err);
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
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar horario');
      }

      console.log('✅ Horario eliminado:', idHorario);
      setHorarios(horarios.filter((h) => h.id_horario !== idHorario));
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      setError('Error al eliminar el horario');
      setTimeout(() => setError(null), 5000);
    }
  };

  // 🔥 CONFIGURAR CALENDARIO
  console.log('📅 Configurando calendario con', eventosCalendario.length, 'eventos');

  const calendar = useCalendarApp({
    views: [createViewWeek(), createViewMonthGrid()],
    events: [], // se rellena vía plugin
    plugins: [eventsService],
    weekOptions: {
      gridHeight: 1200,
    },
    dayBoundaries: {
      start: '05:00',
      end: '21:00',
    },
    // Abrir en la misma "época" donde están tus eventos
    selectedDate: Temporal.PlainDate.from({ year: 2024, month: 1, day: 1 }),
    timezone: 'America/Bogota',
  });

  // 🔄 Sincronizar eventos del estado con el calendario (plugin)
  useEffect(() => {
    console.log('🔄 Actualizando eventsService con', eventosCalendario.length, 'eventos');
    eventsService.set(eventosCalendario);
  }, [eventosCalendario, eventsService]);

  if (loading) {
    return <div className="p-6">Cargando horarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">
          {esTutor ? 'Mi Horario' : 'Gestión de Horarios'}
        </h1>
        <p className="text-muted-foreground">
          {esTutor
            ? 'Calendario semanal de clases asignadas - Se repiten todas las semanas'
            : 'Administración de horarios del sistema - Eventos recurrentes'}
        </p>
        {puedeEditarHorarios && (
          <p className="text-sm text-blue-600 mt-1">
            ✓ Tienes permisos para crear y eliminar horarios
          </p>
        )}
        <p className="text-sm text-green-600 mt-1">
          📅 Mostrando {eventosCalendario.length} eventos en el calendario (3 años: 2024–2026)
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
                const horariosAula = horarios.filter((h) => h.id_aula === aula.id_aula);
                const maxHoras = aula.id_programa === 1 ? 2 : 3;
                const puedeAgregarMas = horariosAula.length < maxHoras;
                const tutor = tutores.get(aula.id_tutor);

                return (
                  <div key={aula.id_aula} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{aula.nombre_aula}</p>
                        <p className="text-sm text-muted-foreground">
                          Grado {aula.grado}° •{' '}
                          {aula.id_programa === 1 ? 'INSIDECLASSROOM' : 'OUTSIDECLASSROOM'} •
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
          <CardTitle>Calendario Semanal (con eventos recurrentes)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
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
                  {diasSemana.map((dia) => {
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
                  onChange={(e) =>
                    setFormData({ ...formData, hora_inicio: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                >
                  {horasDisponibles.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Hora de fin (calculada automáticamente)
                </label>
                <input
                  type="text"
                  value={calcularHoraFin(
                    formData.hora_inicio,
                    formData.duracion_minutos
                  )}
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
                <Button onClick={handleSubmit}>Crear Horario</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
