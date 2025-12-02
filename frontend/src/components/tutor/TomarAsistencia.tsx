import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  CheckCircle,
  XCircle,
  Save,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEstudiantesByAula } from '../../lib/mockData';
import { toast } from 'sonner@2.0.3';
import type { Aula, TutorInfo } from '../../lib/types';

const API_URL = 'http://127.0.0.1:8000';

// Tipo simple para los horarios que devuelve /tutores/horarios
type HorarioSimple = {
  id_horario: number;
  dia?: string | null;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  id_aula?: number | null;
  id_tutor?: number | null;
};

export default function TomarAsistencia() {
  const { user } = useAuth();

  const [misAulas, setMisAulas] = useState<Aula[]>([]);
  const [tutores, setTutores] = useState<TutorInfo[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string>('');

  const [selectedAula, setSelectedAula] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [timeOptions, setTimeOptions] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [classHeld, setClassHeld] = useState(true);
  const [motivo, setMotivo] = useState('');
  const [isReposition, setIsReposition] = useState(false);
  const [horarios, setHorarios] = useState<HorarioSimple[]>([]);
  const [currentTutorId, setCurrentTutorId] = useState<number | null>(null); // <-- id_tutor real

  const esTutor = user?.rol === 'TUTOR';
  const esAdmin =
    user?.rol === 'ADMINISTRADOR' || user?.rol === 'ADMINISTRATIVO';

  // ========= Helpers de backend =========

  // Aulas para un tutor por id_tutor
  const aulasPorTutorId = async (idTutor: number): Promise<Aula[]> => {
    try {
      const url = `${API_URL}/tutores/${idTutor}/aulas`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('Error al obtener aulas por tutorId', response.statusText);
        return [];
      }

      const aulasData = await response.json();
      return aulasData as Aula[];
    } catch (err) {
      console.error('Error en aulasPorTutorId', err);
      return [];
    }
  };

  // Horarios para un tutor (todas sus aulas)
  const horariosPorTutorId = async (
    idTutor: number
  ): Promise<HorarioSimple[]> => {
    try {
      const url = `${API_URL}/tutores/horarios?tutors=${idTutor}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('Error al obtener horarios por tutorId', response.statusText);
        return [];
      }

      const data = await response.json();
      return data as HorarioSimple[];
    } catch (err) {
      console.error('Error en horariosPorTutorId', err);
      return [];
    }
  };

  // ========= Efectos =========

  // Si es TUTOR: cargar directamente sus aulas y horarios
  useEffect(() => {
    if (!user || !esTutor) return;

    const cargarAulasYHorarios = async () => {
      try {
        // obtener id_tutor desde id_persona
        const resId = await fetch(
          `${API_URL}/tutores/by-persona/${user.id_persona}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (!resId.ok) {
          console.error('Error al obtener tutor por persona', resId.statusText);
          setMisAulas([]);
          setHorarios([]);
          setCurrentTutorId(null);
          return;
        }

        const data = await resId.json();
        if (!data.id_tutor) {
          setMisAulas([]);
          setHorarios([]);
          setCurrentTutorId(null);
          return;
        }

        const idTutor = Number(data.id_tutor);
        setCurrentTutorId(idTutor);

        const aulas = await aulasPorTutorId(idTutor);
        setMisAulas(aulas);

        const horariosTutor = await horariosPorTutorId(idTutor);
        setHorarios(horariosTutor);
      } catch (err) {
        console.error('Error al cargar aulas/horarios del tutor', err);
        setMisAulas([]);
        setHorarios([]);
        setCurrentTutorId(null);
      }
    };

    cargarAulasYHorarios();
  }, [user, esTutor]);

  // Si es ADMIN/ADMINISTRATIVO: cargar lista de tutores
  useEffect(() => {
    if (!esAdmin) return;

    const cargarTutores = async () => {
      try {
        const url = `${API_URL}/tutores/info`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          console.error('Error al cargar tutores', res.statusText);
          return;
        }
        const data = await res.json();
        setTutores(data as TutorInfo[]);
      } catch (err) {
        console.error('Error en cargarTutores', err);
      }
    };

    cargarTutores();
  }, [esAdmin]);

  // Cuando un admin selecciona un tutor, cargar sus aulas y horarios
  useEffect(() => {
    if (!esAdmin) return;

    if (!selectedTutorId) {
      setMisAulas([]);
      setHorarios([]);
      setSelectedAula('');
      setTimeOptions([]);
      setSelectedTimes([]);
      setCurrentTutorId(null);
      return;
    }

    const cargarAulasTutor = async () => {
      const tutorIdNum = Number(selectedTutorId);
      setCurrentTutorId(tutorIdNum);

      const dataAulas = await aulasPorTutorId(tutorIdNum);
      setMisAulas(dataAulas);
      setSelectedAula('');

      const dataHorarios = await horariosPorTutorId(tutorIdNum);
      setHorarios(dataHorarios);
      setTimeOptions([]);
      setSelectedTimes([]);
    };

    cargarAulasTutor();
  }, [esAdmin, selectedTutorId]);

  // Actualizar opciones de hora según el aula seleccionada y sus horarios
  useEffect(() => {
    if (!selectedAula) {
      setTimeOptions([]);
      setSelectedTimes([]);
      return;
    }

    const aulaId = Number(selectedAula);
    const horariosAula = horarios.filter((h) => h.id_aula === aulaId);

    if (horariosAula.length > 0) {
      const ranges = horariosAula.map((h) => {
        const start = (h.hora_inicio || '').slice(0, 5);
        const end = (h.hora_fin || '').slice(0, 5);
        return `${start} - ${end}`;
      });
      setTimeOptions(ranges);
      setSelectedTimes(ranges);
    } else {
      setTimeOptions([]);
      setSelectedTimes([]);
    }
  }, [selectedAula, horarios]);

  // ========= Lógica de UI =========

  const estudiantes = selectedAula ? getEstudiantesByAula(selectedAula) : [];
  const selectedAulaData = misAulas.find(
    (a) => String(a.id_aula) === selectedAula
  );

  const handleChangeTimes = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setSelectedTimes(selectedValues);
  };

  const handleToggleAttendance = (estudianteId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [estudianteId]: !prev[estudianteId],
    }));
  };

  // Helper para obtener hora_entrada / hora_salida del arreglo de rangos "HH:MM - HH:MM"
  const getHoraEntradaYSalida = () => {
    if (selectedTimes.length === 0) {
      return { horaEntrada: null as string | null, horaSalida: null as string | null };
    }

    const starts: string[] = [];
    const ends: string[] = [];

    selectedTimes.forEach((range) => {
      const [ini, fin] = range.split('-').map((s) => s.trim());
      if (ini) starts.push(ini);
      if (fin) ends.push(fin);
    });

    if (starts.length === 0 || ends.length === 0) {
      return { horaEntrada: null, horaSalida: null };
    }

    // Orden lexicográfica funciona para "HH:MM"
    const horaEntrada = [...starts].sort()[0];
    const horaSalida = [...ends].sort()[ends.length - 1];

    return { horaEntrada, horaSalida };
  };

  const handleSaveAttendance = async () => {
    if (!selectedAula || !selectedDate || selectedTimes.length < 1) {
      toast.error('Selecciona un aula, una fecha y al menos un horario');
      return;
    }

    if (!selectedAulaData) {
      toast.error('No se encontró información del aula seleccionada');
      return;
    }

    if (!currentTutorId) {
      toast.error('No se pudo determinar el tutor para esta asistencia');
      return;
    }

    if (
      selectedAulaData.id_sede == null ||
      selectedAulaData.id_institucion == null
    ) {
      toast.error('El aula no tiene sede o institución asociadas');
      return;
    }

    const { horaEntrada, horaSalida } = getHoraEntradaYSalida();
    
    // Formatear fecha como YYYY-MM-DD para Oracle
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;

    // Payload para AsistenciaTutorCreate (según schemas.py)
    const asistenciaTutorPayload = {
      id_tutor: currentTutorId,
      id_aula: Number(selectedAulaData.id_aula),
      id_sede: Number(selectedAulaData.id_sede),
      id_institucion: Number(selectedAulaData.id_institucion),
      fecha: fechaStr,
      hora_entrada: horaEntrada,
      hora_salida: horaSalida,
      id_motivo: null,
      id_asistencia_reposicion: null,
    };

    // Payloads de estudiantes (AsistenciaEstudianteCreate)
    const estudiantesPayloads = (classHeld || isReposition)
      ? estudiantes.map((est) => ({
          id_estudiante: Number(est.id),
          id_aula: Number(selectedAulaData.id_aula),
          id_sede: Number(selectedAulaData.id_sede),
          id_institucion: Number(selectedAulaData.id_institucion),
          fecha: fechaStr,
          hora_entrada: horaEntrada,
          hora_salida: horaSalida,
          presente: attendance[est.id] ? 1 : 0,
        }))
      : [];

    try {
      // 1) Registrar asistencia del tutor
      const resTutor = await fetch(`${API_URL}/asistencias/tutores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asistenciaTutorPayload),
      });

      if (!resTutor.ok) {
        const errorData = await resTutor.json().catch(() => null);
        throw new Error(
          errorData?.detail || 'Error al registrar asistencia del tutor'
        );
      }

      // 2) Registrar asistencias de estudiantes solo si la clase se dictó o es reposición
      if (classHeld || isReposition) {
        const requests = estudiantesPayloads.map((p) =>
          fetch(`${API_URL}/asistencias/estudiantes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
          })
        );

        const responses = await Promise.all(requests);

        for (const r of responses) {
          if (!r.ok) {
            const errBody = await r.json().catch(() => null);
            throw new Error(
              errBody?.detail || 'Error al registrar asistencia de estudiante'
            );
          }
        }

        toast.success('Asistencia de tutor y estudiantes registrada exitosamente');
      } else {
        // Clase NO dictada: por ahora solo registramos al tutor (sin estudiantes)
        toast.success(
          'Clase no dictada registrada para el tutor. (Estudiantes no marcados)'
        );
      }

      // Reset form (lo básico)
      setAttendance({});
      setClassHeld(true);
      setMotivo('');
      setIsReposition(false);
    } catch (err: any) {
      console.error('Error al guardar asistencia:', err);
      toast.error(err?.message || 'Error al guardar asistencia');
    }
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<string, boolean> = {};
    estudiantes.forEach((est) => {
      allPresent[est.id] = true;
    });
    setAttendance(allPresent);
  };

  const presentCount = Object.values(attendance).filter((v) => v).length;
  const absentCount = estudiantes.length - presentCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Tomar Asistencia</h1>
        <p className="text-muted-foreground">
          Registra la asistencia de tus estudiantes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel de selección */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selección</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selector de tutor solo para admins */}
              {esAdmin && (
                <div className="space-y-2">
                  <Label>Tutor</Label>
                  <Select
                    value={selectedTutorId}
                    onValueChange={(value) => {
                      setSelectedTutorId(value);
                      setSelectedAula('');
                      setAttendance({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutores.map((t) => (
                        <SelectItem
                          key={t.id_tutor}
                          value={String(t.id_tutor)}
                        >
                          {t.nombre_persona} (ID {t.id_tutor})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Aula</Label>
                <Select
                  value={selectedAula}
                  onValueChange={(value) => {
                    setSelectedAula(value);
                    setAttendance({});
                  }}
                  disabled={esAdmin && !selectedTutorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar aula" />
                  </SelectTrigger>
                  <SelectContent>
                    {misAulas.map((aula: Aula) => (
                      <SelectItem
                        key={aula.id_aula}
                        value={String(aula.id_aula)}
                      >
                        {aula.nombre_aula} • {aula.nombre_institucion} -{' '}
                        {aula.nombre_sede}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex gap-3">
                <div className="space-y-3">
                  <Label>Fecha</Label>
                  <div className="border rounded-lg">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-3 flex-1 h-full">
                  <Label>Hora</Label>
                  <select
                    className="flex-1 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedTimes}
                    onChange={handleChangeTimes}
                    multiple
                  >
                    {timeOptions.length === 0 && (
                      <option value="" disabled>
                        No hay horarios configurados
                      </option>
                    )}
                    {timeOptions.map((time) => (
                      <option className="text-center" key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-x-2 justify-center">
                <Checkbox
                  id="is-reposition"
                  checked={isReposition}
                  onCheckedChange={(checked) =>
                    setIsReposition(checked as boolean)
                  }
                />
                <label
                  htmlFor="is-reposition"
                  className="text-sm cursor-pointer"
                >
                  La clase es de reposición
                </label>
              </div>

              {selectedAulaData && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm">Aula Seleccionada:</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p>{selectedAulaData.nombre_aula}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedAulaData.nombre_institucion} •{' '}
                      {selectedAulaData.nombre_sede}
                    </p>
                    <Badge className="mt-2">
                      Grado {selectedAulaData.grado}°
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de asistencia */}
        <div className="lg:col-span-2">
          {!selectedAula || !selectedDate || selectedTimes.length < 1 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecciona un aula, fecha y hora para comenzar</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="tutor" className="space-y-4">
              <TabsList>
                <TabsTrigger value="tutor">Registro de Clase</TabsTrigger>
                <TabsTrigger value="estudiantes">
                  Asistencia de Estudiantes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="estudiantes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Lista de Estudiantes</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllPresent}
                      >
                        Marcar Todos Presentes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {estudiantes.map((estudiante) => {
                      const isPresent = attendance[estudiante.id] || false;
                      return (
                        <div
                          key={estudiante.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            isPresent
                              ? 'bg-green-50 border-green-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() =>
                            handleToggleAttendance(estudiante.id)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox checked={isPresent} />
                            <div>
                              <p>{estudiante.nombre}</p>
                              <p className="text-sm text-muted-foreground">
                                Doc: {estudiante.documento}
                              </p>
                            </div>
                          </div>
                          {isPresent ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Presente
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <XCircle className="w-3 h-3 mr-1" />
                              Ausente
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Presentes
                          </p>
                          <p className="text-2xl text-green-600">
                            {presentCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Ausentes
                          </p>
                          <p className="text-2xl text-red-600">
                            {absentCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Total
                          </p>
                          <p className="text-2xl">{estudiantes.length}</p>
                        </div>
                      </div>
                      <Button onClick={handleSaveAttendance} size="lg">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Asistencia
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tutor" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Registro de Clase del Tutor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="class-held"
                        checked={isReposition ? true : classHeld}
                        onCheckedChange={(checked) =>
                          isReposition
                            ? undefined
                            : setClassHeld(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="class-held"
                        className="text-sm cursor-pointer"
                      >
                        La clase fue dictada
                      </label>
                    </div>

                    {isReposition && classHeld && (
                      <div className="space-y-2">
                        <Label htmlFor="motivo-repos">
                          Clase a reponer (motivo original)
                        </Label>
                        <Select value={motivo} onValueChange={setMotivo}>
                          <SelectTrigger id="motivo-repos">
                            <SelectValue placeholder="Seleccionar clase a reponer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Enfermedad">
                              Enfermedad
                            </SelectItem>
                            <SelectItem value="Calamidad">
                              Calamidad
                            </SelectItem>
                            <SelectItem value="Permiso Personal">
                              Permiso Personal
                            </SelectItem>
                            <SelectItem value="Festivo">Festivo</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {!classHeld && !isReposition && (
                      <div className="space-y-2">
                        <Label htmlFor="motivo-ausencia">
                          Motivo de Ausencia
                        </Label>
                        <Select value={motivo} onValueChange={setMotivo}>
                          <SelectTrigger id="motivo-ausencia">
                            <SelectValue placeholder="Seleccionar motivo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Enfermedad">
                              Enfermedad
                            </SelectItem>
                            <SelectItem value="Calamidad">
                              Calamidad
                            </SelectItem>
                            <SelectItem value="Permiso Personal">
                              Permiso Personal
                            </SelectItem>
                            <SelectItem value="Festivo">Festivo</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button onClick={handleSaveAttendance} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Registro
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
