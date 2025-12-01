import { useEffect, useState } from 'react';
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
  NotebookPen,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Aula, Estudiante } from '../../lib/types';

export default function GestionEstudiantes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrado, setFilterGrado] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [targetAula, setTargetAula] = useState<string>('');
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [openScoreDialog, setOpenScoreDialog] = useState(false);

  const [formData, setFormData] = useState({
    id_estudiante: '',
    tipo_documento: '',
    nombre: '',
    grado: '',
    score_inicial: '',
    score_final: '',
    aula: ''
  });

  const getEstudiantes = async () => {
    const url = `http://127.0.0.1:8000/estudiantes/`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.log(response.statusText);
      return [];
    }

    const estudiantesData = await response.json();
    return estudiantesData as Estudiante[];
  }

  const getAulas = async () => {
    const url = `http://127.0.0.1:8000/aulas/`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.log(response.statusText);
      return [];
    }

    const aulasData = await response.json();
    return aulasData as Aula[];
  }

  useEffect(() => {
    const obtenerEstudiantes = async () => {
      const data = await getEstudiantes();
      setEstudiantes(data);
    };
    obtenerEstudiantes();
  }, []);

  useEffect(() => {
    const obtenerAulas = async () => {
      const data = await getAulas();
      setAulas(data);
    };
    obtenerAulas();
  }, []);

  const filteredEstudiantes = estudiantes.filter((estudiante) => {
    const matchesSearch =
      estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.id_estudiante.toString().includes(searchTerm);

    const matchesGrado =
      filterGrado === 'all' || estudiante.grado === filterGrado;

    return matchesSearch && matchesGrado;
  });

  const handleCreateEstudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    const aulaInfo = JSON.parse(formData.aula)

    const nuevoEstudiante = {
      id_estudiante: formData.id_estudiante,
      tipo_documento: formData.tipo_documento,
      nombre: formData.nombre,
      grado: formData.grado,
      score_inicial: formData.score_inicial,
      id_aula: aulaInfo.id_aula,
      id_sede: aulaInfo.id_sede,
      id_institucion: aulaInfo.id_institucion
    }
    const url = `http://127.0.0.1:8000/estudiantes/`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoEstudiante)
    });

    if (!response.ok) {
      return
    }

    const estudiantesData = await getEstudiantes()

    setEstudiantes(estudiantesData)

    setFormData({
      id_estudiante: '',
      tipo_documento: '',
      nombre: '',
      grado: '',
      score_inicial: '',
      score_final: '',
      aula: ''
    })

    toast.success('Estudiante matriculado exitosamente');
    setOpenDialog(false);
  };

  const handleMoveEstudiante = (e: React.FormEvent) => {
    e.preventDefault();

    const student = estudiantes.find((e) => e.id_estudiante === selectedStudent);
    const newAula = aulas.find((a) => a.id_aula.toString() === targetAula);

    if (student && newAula && student.grado !== newAula.grado) {
      toast.error('El estudiante no puede moverse a un aula de diferente grado');
      return;
    }

    toast.success('Estudiante movido exitosamente');
    setOpenMoveDialog(false);
    setSelectedStudent(null);
    setTargetAula('');
  };

  const handleScoreEstudiante = (e: React.FormEvent) => {
    e.preventDefault();

    const student = estudiantes.find((e) => e.id_estudiante === selectedStudent);
    const score_final = Number(formData.score_final);

    if (score_final > 100 || score_final < 0) {
      toast.error('El estudiante no puede moverse a un aula de diferente grado');
      return;
    }

    // Hacer fetch para poner el score

    toast.success('Score final ingresado exitosamente');
    setOpenScoreDialog(false);
    setSelectedStudent(null);
    setTargetAula('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (!((id === 'score_inicial' || id === 'score_final') && Number(value) > 100)) {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const getCompatibleAulas = (studentGrado: string) => {
    if (studentGrado === '9' || studentGrado === '10') {
      return aulas.filter((a) => a.grado === '9' || a.grado === '10');
    } else
      return aulas.filter((a) => a.grado === '4' || a.grado === '5');
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
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Juan Pérez"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id_estudiante">Documento</Label>
                    <Input
                      id="id_estudiante"
                      placeholder="1001234567"
                      type='number'
                      value={formData.id_estudiante}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_documento">Tipo de documento</Label>
                    <Select
                      value={formData.tipo_documento}
                      onValueChange={(value: string) => { setFormData(prev => ({ ...prev, tipo_documento: value })) }}
                      required>
                      <SelectTrigger id="tipo_documento">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">CC</SelectItem>
                        <SelectItem value="TI">TI</SelectItem>
                        <SelectItem value="CE">CE</SelectItem>
                        <SelectItem value="PP">CE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grado">Grado</Label>
                    <Select
                      value={formData.grado}
                      onValueChange={(value: string) => { setFormData(prev => ({ ...prev, grado: value, aula: '' })) }}
                      required>
                      <SelectTrigger id="grado">
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
                  <Label htmlFor="aula">Aula</Label>
                  <Select
                    value={formData.aula}
                    onValueChange={(value: string) => { setFormData(prev => ({ ...prev, aula: value })) }}
                    required>
                    <SelectTrigger id="aula">
                      <SelectValue placeholder="Seleccionar aula" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        key={'Ninguna'}
                        value={JSON.stringify({
                          id_aula: null,
                          id_sede: null,
                          id_institucion: null
                        })}>
                        Sin Aula
                      </SelectItem>
                      {
                        (formData.grado !== '' ? getCompatibleAulas(formData.grado) : aulas).map((aula) => {
                          const institucion = { id: aula.id_institucion, nombre: aula.nombre_institucion }
                          return (
                            <SelectItem
                              key={`${aula.id_aula}-${aula.id_sede}-${aula.id_institucion}`}
                              value={JSON.stringify({
                                id_aula: aula.id_aula,
                                id_sede: aula.id_sede,
                                id_institucion: aula.id_institucion
                              })}
                            >
                              {aula.id_aula} - {institucion.nombre}: {aula.nombre_sede} (Grado {aula.grado}°)
                            </SelectItem>
                          );
                        })
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="score_inicial">Score Inicial</Label>
                  <Input
                    id="score_inicial"
                    type="number"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    value={formData.score_inicial}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenDialog(false)
                      setFormData({
                        id_estudiante: '',
                        tipo_documento: '',
                        nombre: '',
                        grado: '',
                        score_inicial: '',
                        score_final: '',
                        aula: ''
                      })
                    }}
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
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Tipo de Documento</TableHead>
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

                return (
                  <TableRow key={estudiante.id_estudiante}>
                    <TableCell>{estudiante.nombre}</TableCell>
                    <TableCell>{estudiante.tipo_documento}</TableCell>
                    <TableCell>{estudiante.id_estudiante}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{estudiante.grado}°</Badge>
                    </TableCell>
                    <TableCell>{estudiante.nombre_aula || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{estudiante.nombre_institucion || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {estudiante.nombre_sede || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{estudiante.score_inicial}</Badge>
                    </TableCell>
                    <TableCell>
                      {estudiante.score_final ? (
                        <Badge>{estudiante.score_final}</Badge>
                      ) : (
                        <div className='space-y-1'>
                          <span className="block text-muted-foreground text-sm">
                            Pendiente
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(estudiante.id_estudiante);
                              setOpenScoreDialog(true);
                            }}
                          >
                            <NotebookPen className="w-4 h-4 mr-1" />
                            Calificar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(estudiante.id_estudiante);
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
              const student = estudiantes.find((e) => e.id_estudiante === selectedStudent);
              const currentAula = { id: student?.id_aula, nombre: student?.nombre_aula }
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
                          .filter((a) => a.id_aula !== currentAula?.id)
                          .map((aula) => {
                            const institucion = { id: aula.id_institucion, nombre: aula.nombre_institucion }
                            return (
                              <SelectItem key={aula.id_aula} value={aula.id_aula}>
                                {aula.nombre} - {institucion?.nombre}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>

                  {targetAula && (() => {
                    const newAula = aulas.find((a) => a.id_aula.toString() === targetAula);
                    const newSede = { id: newAula?.id_aula, nombre: newAula?.nombre };
                    const newInstitucion = { id: newAula?.id_institucion, nombre: newAula?.nombre_institucion }

                    return (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <p>Aula destino: {newAula?.nombre}</p>
                          <p>Institución: {newInstitucion?.nombre}</p>
                          <p>Sede: {newSede?.nombre}</p>
                          <p>Programa: {!newAula ? 'SIN PROGRAMA' : newAula.id_programa === 1 ? 'INSIDECLASSROOM' : 'OUTSIDECLASSROOM'}</p>
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

      {/* Dialog para calificar el score final */}
      <Dialog open={openScoreDialog} onOpenChange={setOpenScoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificaciar Estudiante</DialogTitle>
            <DialogDescription>
              Ingresa el Score Final para el estudiante
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScoreEstudiante} className="space-y-4">
            {selectedStudent && (() => {
              const student = estudiantes.find((e) => e.id_estudiante === selectedStudent);
              const currentAula = { id: student?.id_aula, nombre: student?.nombre_aula }

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
                    <Label htmlFor="score_final">Score Final</Label>
                    <Input
                      id="score_final"
                      type="number"
                      placeholder="0-100"
                      min="0"
                      max="100"
                      value={formData.score_final}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              );
            })()}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenScoreDialog(false);
                  setSelectedStudent(null);
                  setFormData(prev => ({ ...prev, score_final: '' }))
                  setTargetAula('');
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Calificar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
