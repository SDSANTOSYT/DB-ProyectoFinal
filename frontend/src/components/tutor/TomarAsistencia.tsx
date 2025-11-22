import { useState } from 'react';
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
import { CheckCircle, XCircle, Save, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAulasByTutor,
  getEstudiantesByAula,
  getSedeById,
  getInstitucionById,
} from '../../lib/mockData';
import { toast } from 'sonner@2.0.3';

export default function TomarAsistencia() {
  const { user } = useAuth();
  const misAulas = getAulasByTutor(user?.id || '');

  const [selectedAula, setSelectedAula] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [classHeld, setClassHeld] = useState(true);
  const [motivo, setMotivo] = useState('');
  const [requiereReposicion, setRequiereReposicion] = useState(false);

  const estudiantes = selectedAula ? getEstudiantesByAula(selectedAula) : [];
  const selectedAulaData = misAulas.find((a) => a.id === selectedAula);

  const handleToggleAttendance = (estudianteId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [estudianteId]: !prev[estudianteId],
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedAula || !selectedDate) {
      toast.error('Selecciona un aula y una fecha');
      return;
    }

    if (classHeld) {
      toast.success('Asistencia registrada exitosamente');
    } else {
      toast.success('Clase no dictada registrada. Motivo: ' + motivo);
    }

    // Reset form
    setAttendance({});
    setClassHeld(true);
    setMotivo('');
    setRequiereReposicion(false);
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
        {/* Selection Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selección</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Aula</Label>
                <Select value={selectedAula} onValueChange={setSelectedAula}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar aula" />
                  </SelectTrigger>
                  <SelectContent>
                    {misAulas.map((aula) => {
                      const sede = getSedeById(aula.sedeId);
                      const institucion = sede
                        ? getInstitucionById(sede.institucionId)
                        : null;
                      return (
                        <SelectItem key={aula.id} value={aula.id}>
                          {aula.nombre} - {institucion?.nombre}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha</Label>
                <div className="border rounded-lg p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                  />
                </div>
              </div>

              {selectedAulaData && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm">Aula Seleccionada:</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p>{selectedAulaData.nombre}</p>
                    <Badge className="mt-2">Grado {selectedAulaData.grado}°</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance Panel */}
        <div className="lg:col-span-2">
          {!selectedAula || !selectedDate ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecciona un aula y una fecha para comenzar</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="estudiantes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="estudiantes">Asistencia de Estudiantes</TabsTrigger>
                <TabsTrigger value="tutor">Registro de Clase</TabsTrigger>
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
                          onClick={() => handleToggleAttendance(estudiante.id)}
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
                          <p className="text-sm text-muted-foreground">Presentes</p>
                          <p className="text-2xl text-green-600">{presentCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Ausentes</p>
                          <p className="text-2xl text-red-600">{absentCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Total</p>
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
                        checked={classHeld}
                        onCheckedChange={(checked) => setClassHeld(checked as boolean)}
                      />
                      <label
                        htmlFor="class-held"
                        className="text-sm cursor-pointer"
                      >
                        La clase fue dictada
                      </label>
                    </div>

                    {!classHeld && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="motivo">Motivo de Ausencia</Label>
                          <Select value={motivo} onValueChange={setMotivo}>
                            <SelectTrigger id="motivo">
                              <SelectValue placeholder="Seleccionar motivo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Enfermedad">Enfermedad</SelectItem>
                              <SelectItem value="Calamidad">Calamidad</SelectItem>
                              <SelectItem value="Permiso Personal">
                                Permiso Personal
                              </SelectItem>
                              <SelectItem value="Festivo">Festivo</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="reposicion"
                            checked={requiereReposicion}
                            onCheckedChange={(checked) =>
                              setRequiereReposicion(checked as boolean)
                            }
                          />
                          <label
                            htmlFor="reposicion"
                            className="text-sm cursor-pointer"
                          >
                            Requiere reposición
                          </label>
                        </div>
                      </>
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
