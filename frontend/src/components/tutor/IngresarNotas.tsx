import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
import { Save, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAulasByTutor,
  getEstudiantesByAula,
  getSedeById,
  getInstitucionById,
} from '../../lib/mockData';
import { toast } from 'sonner@2.0.3';

const periodos = ['Periodo 1', 'Periodo 2', 'Periodo 3', 'Periodo 4'];
const componentes = [
  { nombre: 'Listening', porcentaje: 25 },
  { nombre: 'Speaking', porcentaje: 25 },
  { nombre: 'Reading', porcentaje: 25 },
  { nombre: 'Writing', porcentaje: 25 },
];

export default function IngresarNotas() {
  const { user } = useAuth();
  const misAulas = getAulasByTutor(user?.id || '');

  const [selectedAula, setSelectedAula] = useState('');
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [selectedComponente, setSelectedComponente] = useState('');
  const [notas, setNotas] = useState<Record<string, string>>({});

  const estudiantes = selectedAula ? getEstudiantesByAula(selectedAula) : [];
  const selectedAulaData = misAulas.find((a) => a.id === selectedAula);
  const selectedComponenteData = componentes.find(
    (c) => c.nombre === selectedComponente
  );

  const handleNotaChange = (estudianteId: string, valor: string) => {
    const num = parseFloat(valor);
    if (valor === '' || (num >= 0 && num <= 100)) {
      setNotas((prev) => ({
        ...prev,
        [estudianteId]: valor,
      }));
    }
  };

  const handleSaveNotas = () => {
    if (!selectedAula || !selectedPeriodo || !selectedComponente) {
      toast.error('Selecciona aula, periodo y componente');
      return;
    }

    const notasIngresadas = Object.keys(notas).length;
    toast.success(`${notasIngresadas} notas guardadas exitosamente`);
    setNotas({});
  };

  const calculatePromedio = () => {
    const valores = Object.values(notas)
      .filter((n) => n !== '')
      .map((n) => parseFloat(n));
    if (valores.length === 0) return 0;
    return (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Ingresar Notas</h1>
        <p className="text-muted-foreground">
          Califica a tus estudiantes por periodo y componente
        </p>
      </div>

      {/* Selection Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Aula y Periodo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
              <Label>Periodo</Label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((periodo) => (
                    <SelectItem key={periodo} value={periodo}>
                      {periodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Componente</Label>
              <Select
                value={selectedComponente}
                onValueChange={setSelectedComponente}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar componente" />
                </SelectTrigger>
                <SelectContent>
                  {componentes.map((comp) => (
                    <SelectItem key={comp.nombre} value={comp.nombre}>
                      {comp.nombre} ({comp.porcentaje}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedAulaData && selectedPeriodo && selectedComponenteData && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">
                Ingresando notas para: <strong>{selectedAulaData.nombre}</strong> •{' '}
                {selectedPeriodo} • {selectedComponenteData.nombre} (
                {selectedComponenteData.porcentaje}%)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grades Table */}
      {selectedAula && selectedPeriodo && selectedComponente ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ingresar Calificaciones</CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  Promedio: <strong>{calculatePromedio()}</strong>
                </div>
                <Button onClick={handleSaveNotas}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Notas
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead className="w-32">Nota (0-100)</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estudiantes.map((estudiante, idx) => {
                  const nota = notas[estudiante.id] || '';
                  const notaNum = nota ? parseFloat(nota) : null;
                  let estado = null;
                  if (notaNum !== null) {
                    if (notaNum >= 60) estado = 'Aprobado';
                    else if (notaNum >= 40) estado = 'Regular';
                    else estado = 'Reprobado';
                  }

                  return (
                    <TableRow key={estudiante.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{estudiante.nombre}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {estudiante.documento}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={nota}
                          onChange={(e) =>
                            handleNotaChange(estudiante.id, e.target.value)
                          }
                          placeholder="0.0"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        {estado && (
                          <Badge
                            variant={
                              estado === 'Aprobado'
                                ? 'default'
                                : estado === 'Regular'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {estado}
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
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Selecciona aula, periodo y componente para ingresar notas</p>
          </CardContent>
        </Card>
      )}

      {/* Components Info */}
      <Card>
        <CardHeader>
          <CardTitle>Componentes de Evaluación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {componentes.map((comp) => (
              <div
                key={comp.nombre}
                className="p-4 border rounded-lg text-center"
              >
                <p className="mb-2">{comp.nombre}</p>
                <p className="text-2xl text-blue-600">{comp.porcentaje}%</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            La nota definitiva se calcula automáticamente según los porcentajes de
            cada componente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
