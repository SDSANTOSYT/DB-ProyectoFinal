import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Download,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  RefreshCw,
} from 'lucide-react';
import {
  tutores,
  aulas,
  getAulasByTutor,
  getSedeById,
  getInstitucionById,
  getEstudiantesByAula,
} from '../../lib/mockData';

export default function AsistenciaSeguimiento() {
  const [selectedTutor, setSelectedTutor] = useState<string>('');
  const [selectedAula, setSelectedAula] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const tutorAulas = selectedTutor ? getAulasByTutor(selectedTutor) : [];
  const selectedAulaData = selectedAula ? aulas.find((a) => a.id === selectedAula) : null;
  const estudiantesAula = selectedAula ? getEstudiantesByAula(selectedAula) : [];

  // Mock attendance data
  const mockTutorAttendance = [
    { fecha: '2025-11-15', dictada: true, festivo: false, motivo: null },
    { fecha: '2025-11-18', dictada: true, festivo: false, motivo: null },
    { fecha: '2025-11-20', dictada: false, festivo: false, motivo: 'Enfermedad', reposicion: '2025-11-27' },
    { fecha: '2025-11-22', dictada: true, festivo: false, motivo: null },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Asistencia y Seguimiento</h1>
        <p className="text-muted-foreground">
          Monitorea la asistencia de tutores y estudiantes
        </p>
      </div>

      <Tabs defaultValue="tutor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tutor">Asistencia de Tutores</TabsTrigger>
          <TabsTrigger value="estudiantes">Asistencia de Estudiantes</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="tutor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm">Seleccionar Tutor</label>
                  <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutores.map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          {tutor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTutor && (
                  <div className="space-y-2">
                    <label className="text-sm">Seleccionar Aula</label>
                    <Select value={selectedAula} onValueChange={setSelectedAula}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar aula" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutorAulas.map((aula) => (
                          <SelectItem key={aula.id} value={aula.id}>
                            {aula.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedAula && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Registro de Asistencia del Tutor</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Festivo</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Reposición</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTutorAttendance.map((record, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{record.fecha}</TableCell>
                        <TableCell>
                          {record.dictada ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Dictada
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              No Dictada
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.festivo ? (
                            <Badge variant="secondary">Festivo</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.motivo || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.reposicion ? (
                            <div className="flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" />
                              {record.reposicion}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="estudiantes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Aula y Fecha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm">Aula</label>
                  <Select value={selectedAula} onValueChange={setSelectedAula}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar aula" />
                    </SelectTrigger>
                    <SelectContent>
                      {aulas.map((aula) => {
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
                  <label className="text-sm">Fecha</label>
                  <div className="border rounded-lg p-3">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedAula && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Asistencia de Estudiantes - {selectedAulaData?.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estudiantesAula.map((estudiante) => {
                      const presente = Math.random() > 0.2; // Mock data
                      return (
                        <TableRow key={estudiante.id}>
                          <TableCell>{estudiante.nombre}</TableCell>
                          <TableCell>{estudiante.documento}</TableCell>
                          <TableCell>
                            {presente ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Presente
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Ausente
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reportes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generar Reportes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-auto py-6 justify-start">
                  <div className="text-left">
                    <p>Reporte de Asistencia por Institución</p>
                    <p className="text-xs text-muted-foreground">
                      Descargar Excel con todas las aulas
                    </p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-6 justify-start">
                  <div className="text-left">
                    <p>Reporte de Asistencia por Tutor</p>
                    <p className="text-xs text-muted-foreground">
                      Clases dictadas vs planificadas
                    </p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-6 justify-start">
                  <div className="text-left">
                    <p>Reporte de Reposiciones Pendientes</p>
                    <p className="text-xs text-muted-foreground">
                      Clases no dictadas que requieren reposición
                    </p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-6 justify-start">
                  <div className="text-left">
                    <p>Reporte General de Asistencia Estudiantil</p>
                    <p className="text-xs text-muted-foreground">
                      Porcentaje de asistencia por estudiante
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
