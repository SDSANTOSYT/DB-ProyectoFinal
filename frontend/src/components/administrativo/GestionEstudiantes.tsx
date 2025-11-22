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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Plus,
  Search,
  Upload,
  MoveRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  estudiantes,
  aulas,
  getAulaById,
  getSedeById,
  getInstitucionById,
} from '../../lib/mockData';
import { toast } from 'sonner@2.0.3';

export default function GestionEstudiantes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrado, setFilterGrado] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [targetAula, setTargetAula] = useState<string>('');

  const filteredEstudiantes = estudiantes.filter((estudiante) => {
    const matchesSearch =
      estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.documento.includes(searchTerm);

    const matchesGrado =
      filterGrado === 'all' || estudiante.grado === filterGrado;

    return matchesSearch && matchesGrado;
  });

  const handleCreateEstudiante = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Estudiante matriculado exitosamente');
    setOpenDialog(false);
  };

  const handleMoveEstudiante = (e: React.FormEvent) => {
    e.preventDefault();
    
    const student = estudiantes.find((e) => e.id === selectedStudent);
    const newAula = aulas.find((a) => a.id === targetAula);

    if (student && newAula && student.grado !== newAula.grado) {
      toast.error('El estudiante no puede moverse a un aula de diferente grado');
      return;
    }

    toast.success('Estudiante movido exitosamente');
    setOpenMoveDialog(false);
    setSelectedStudent(null);
    setTargetAula('');
  };

  const getCompatibleAulas = (studentGrado: string) => {
    return aulas.filter((a) => a.grado === studentGrado);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Estudiantes</h1>
          <p className="text-muted-foreground">
            Matricular, buscar y mover estudiantes entre aulas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Carga Masiva CSV
          </Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Matricular Estudiante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Matricular Nuevo Estudiante</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del estudiante y asígnalo a un aula
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEstudiante} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="est-nombre">Nombre Completo</Label>
                  <Input
                    id="est-nombre"
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="est-documento">Documento</Label>
                    <Input
                      id="est-documento"
                      placeholder="1001234567"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="est-grado">Grado</Label>
                    <Select required>
                      <SelectTrigger id="est-grado">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4°</SelectItem>
                        <SelectItem value="5">5°</SelectItem>
                        <SelectItem value="9">9°</SelectItem>
                        <SelectItem value="10">10°</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="est-aula">Aula</Label>
                  <Select required>
                    <SelectTrigger id="est-aula">
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
                            {aula.nombre} - {institucion?.nombre} (Grado {aula.grado}°)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="est-score">Score Inicial</Label>
                  <Input
                    id="est-score"
                    type="number"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Matricular</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterGrado} onValueChange={setFilterGrado}>
              <SelectTrigger>
                <SelectValue placeholder="Grado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grados</SelectItem>
                <SelectItem value="4">4°</SelectItem>
                <SelectItem value="5">5°</SelectItem>
                <SelectItem value="9">9°</SelectItem>
                <SelectItem value="10">10°</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Estudiantes Registrados ({filteredEstudiantes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Aula Actual</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Score Inicial</TableHead>
                <TableHead>Score Final</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstudiantes.map((estudiante) => {
                const aula = getAulaById(estudiante.aulaId);
                const sede = aula ? getSedeById(aula.sedeId) : null;
                const institucion = sede
                  ? getInstitucionById(sede.institucionId)
                  : null;

                return (
                  <TableRow key={estudiante.id}>
                    <TableCell>{estudiante.nombre}</TableCell>
                    <TableCell>{estudiante.documento}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{estudiante.grado}°</Badge>
                    </TableCell>
                    <TableCell>{aula?.nombre || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{institucion?.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {sede?.nombre}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{estudiante.scoreInicial}</Badge>
                    </TableCell>
                    <TableCell>
                      {estudiante.scoreFinal ? (
                        <Badge>{estudiante.scoreFinal}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Pendiente
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(estudiante.id);
                          setOpenMoveDialog(true);
                        }}
                      >
                        <MoveRight className="w-4 h-4 mr-1" />
                        Mover
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredEstudiantes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron estudiantes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Move Student Dialog */}
      <Dialog open={openMoveDialog} onOpenChange={setOpenMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover Estudiante a Otra Aula</DialogTitle>
            <DialogDescription>
              Selecciona el aula destino para el estudiante
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMoveEstudiante} className="space-y-4">
            {selectedStudent && (() => {
              const student = estudiantes.find((e) => e.id === selectedStudent);
              const currentAula = student ? getAulaById(student.aulaId) : null;
              const compatibleAulas = student
                ? getCompatibleAulas(student.grado)
                : [];

              return (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="mb-2">
                        Estudiante: {student?.nombre}
                      </p>
                      <p>Aula actual: {currentAula?.nombre}</p>
                      <p>Grado: {student?.grado}°</p>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="target-aula">Nueva Aula (Mismo Grado)</Label>
                    <Select
                      value={targetAula}
                      onValueChange={setTargetAula}
                      required
                    >
                      <SelectTrigger id="target-aula">
                        <SelectValue placeholder="Seleccionar aula destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {compatibleAulas
                          .filter((a) => a.id !== student?.aulaId)
                          .map((aula) => {
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

                  {targetAula && (() => {
                    const newAula = aulas.find((a) => a.id === targetAula);
                    const newSede = newAula ? getSedeById(newAula.sedeId) : null;
                    const newInstitucion = newSede
                      ? getInstitucionById(newSede.institucionId)
                      : null;

                    return (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <p>Aula destino: {newAula?.nombre}</p>
                          <p>Institución: {newInstitucion?.nombre}</p>
                          <p>Sede: {newSede?.nombre}</p>
                          <p>Programa: {newAula?.programa}</p>
                        </AlertDescription>
                      </Alert>
                    );
                  })()}
                </>
              );
            })()}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenMoveDialog(false);
                  setSelectedStudent(null);
                  setTargetAula('');
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Confirmar Movimiento</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
