import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import {
  Plus,
  Search,
  Edit,
  Users,
  Calendar,
  UserCog,
  Clock,
  X,
} from 'lucide-react';
import {
  instituciones,
  sedes,
  tutores,
} from '../../lib/mockData';
import { toast } from 'sonner@2.0.3';
import type { Aula, Institucion, Sede, TutorInfo } from '../../lib/types';

export default function GestionAulas() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitucion, setFilterInstitucion] = useState<string>('all');
  const [filterSede, setFilterSede] = useState<string>('all');
  const [filterPrograma, setFilterPrograma] = useState<string>('all');
  const [filterGrado, setFilterGrado] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [openTutorDialog, setOpenTutorDialog] = useState(false);
  const [selectedAula, setSelectedAula] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<string>('');
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [tutors, setTutors] = useState<TutorInfo[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [formData, setFormData] = useState({
    nombre_aula: '',
    grado: '',
    id_sede: '',
    id_institucion: '',
    id_programa: '',
    id_tutor: ''
  })

  // Estado para el formulario de nueva aula
  const [newAulaGrado, setNewAulaGrado] = useState<string>('');

  const [activeFilters, setActiveFilters] = useState<string[]>([]);


  const getInstituciones = async () => {
    const url = `http://127.0.0.1:8000/instituciones/`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.log(response.statusText);
      return [];
    }

    const institucionesData = await response.json();
    return institucionesData as Institucion[];
  };

  const getSedesById = async (id_institucion: number) => {
    const url = `http://127.0.0.1:8000/sedes/by-institucion/${id_institucion}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.log(response.statusText);
      return [];
    }

    const sedesData = await response.json();
    return sedesData as Sede[];
  };

  useEffect(() => {
    const obtenerInstituciones = async () => {
      const data = await getInstituciones();
      setInstituciones(data);
    };
    obtenerInstituciones();
  }, []);

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

  const getTutors = async () => {
    const url = `http://127.0.0.1:8000/tutores/info`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.log(response.statusText);
      return [];
    }

    const tutoresData = await response.json();
    return tutoresData as TutorInfo[];
  };


  useEffect(() => {
    const obtenerAulas = async () => {
      const data = await getAulas();
      setAulas(data);
    };
    obtenerAulas();
  }, []);

  useEffect(() => {
    const obtenerTutores = async () => {
      const data = await getTutors();
      setTutors(data);
    };
    obtenerTutores();
  }, []);

  // Aplicar filtros desde la navegación
  useEffect(() => {
    if (location.state) {
      const { filterSede: sedeId, filterInstitucion: institucionId } = location.state as any;

      if (institucionId) {
        setFilterInstitucion(institucionId);
        setActiveFilters(prev => [...prev, 'institucion']);
      }

      if (sedeId) {
        setFilterSede(sedeId);
        setActiveFilters(prev => [...prev, 'sede']);
      }

      // Mostrar notificación
      const sede = sedes.find(s => s.id_sede === sedeId);
      if (sede) {
        toast.info(`Filtrando aulas de: ${sede.nombre_sede}`);
      }
    }
  }, [location.state]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterInstitucion('all');
    setFilterSede('all');
    setFilterPrograma('all');
    setFilterGrado('all');
    setActiveFilters([]);
    toast.success('Filtros limpiados');
  };

  const sedesFiltradas = filterInstitucion === 'all'
    ? sedes
    : sedes.filter(sede => sede.id_institucion.toString() === filterInstitucion);

  const filteredAulas = aulas.filter(async (aula) => {
    const sede = { id: aula.id_sede, nombre: aula.nombre_sede }
    const institucion = { id: aula.id_institucion, nombre: aula.nombre_institucion }
    const tutor = tutors.find((t) => t.id_tutor === aula.id_tutor)

    const matchesSearch =
      aula.nombre_aula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor?.nombre_persona.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesInstitucion =
      filterInstitucion === 'all' || institucion?.id.toString() === filterInstitucion;

    const matchesSede =
      filterSede === 'all' || sede.id.toString() === filterSede;

    const matchesPrograma =
      filterPrograma === 'all' || aula.id_programa.toString() === filterPrograma;

    const matchesGrado = filterGrado === 'all' || aula.grado === filterGrado;

    return matchesSearch && matchesInstitucion && matchesSede && matchesPrograma && matchesGrado;
  });

  const handleCreateAula = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Aula creada exitosamente');
    setOpenDialog(false);
  };

  const handleChangeTutor = (e: React.FormEvent) => {
    e.preventDefault();

    toast.success('Tutor asignado exitosamente');
    setOpenTutorDialog(false);
  };

  const handleChangeSelectedInstitucion = async (value: string) => {
    setFormData(prev => ({ ...prev, id_institucion: value, id_sede: '' }))
    const sedes = await getSedesById(Number(value))
    setSedes(sedes)
  }

  const hasActiveFilters = filterInstitucion !== 'all' ||
    filterSede !== 'all' ||
    filterPrograma !== 'all' ||
    filterGrado !== 'all' ||
    searchTerm !== '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Aulas</h1>
          <p className="text-muted-foreground">
            Administra aulas, tutores y horarios
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Aula</DialogTitle>
              <DialogDescription>
                Configura una nueva aula asignando institución, sede, programa y tutor
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAula} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre_aula">Nombre del Aula</Label>
                  <Input id="nombre_aula" placeholder="Ej: Aula 4A" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grado">Grado</Label>
                  <Select
                    required
                    value={formData.grado}
                    onValueChange={(value: string) => { setFormData(prev => ({ ...prev, grado: value })) }}
                  >
                    <SelectTrigger id="grado">
                      <SelectValue placeholder="Seleccionar grado" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_programa">Programa</Label>
                  <Select
                    value={formData.id_programa}
                    onValueChange={(value: string) => { setFormData(prev => ({ ...prev, id_programa: value })) }}
                    required>
                    <SelectTrigger id="id_programa">
                      <SelectValue placeholder="Seleccionar programa" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.grado === '' || (formData.grado === '4' || formData.grado === '5')) && <SelectItem value="1">
                        INSIDECLASSROOM (4°-5°)
                      </SelectItem>}
                      {(formData.grado === '' || (formData.grado === '9' || formData.grado === '10')) && <SelectItem value="2">
                        OUTSIDECLASSROOM (9°-10°)
                      </SelectItem>}
                    </SelectContent>
                  </Select>
                  {newAulaGrado && (
                    <p className="text-xs text-muted-foreground">
                      {(newAulaGrado === '4' || newAulaGrado === '5') ? (
                        <span>📚 Horario regular de institución (Lun-Vie, máx 2h)</span>
                      ) : (
                        <span>🌙 Horario extracurricular (Lun-Sáb, máx 3h)</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aula-institucion">Institución</Label>
                  <Select
                    value={formData.id_institucion}
                    onValueChange={(value: string) => { handleChangeSelectedInstitucion(value) }}
                    required>
                    <SelectTrigger id="id-institucion">
                      <SelectValue placeholder="Seleccionar institución" />
                    </SelectTrigger>
                    <SelectContent>
                      {instituciones.map((inst) => (
                        <SelectItem key={inst.id_institucion} value={inst.id_institucion.toString()}>
                          {inst.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_sede">Sede</Label>
                  <Select required>
                    <SelectTrigger id="id_sede">
                      <SelectValue placeholder="Seleccionar sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {sedes.map((sede) => (
                        <SelectItem key={sede.id_sede} value={sede.id_sede.toString()}>
                          {sede.nombre_sede}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_tutor">Tutor Asignado</Label>
                  <Select required>
                    <SelectTrigger id="id_tutor">
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
              </div>
              {newAulaGrado && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    📋 Restricciones de Horario - Grado {newAulaGrado}°
                  </h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                      <span className="font-medium">•</span>
                      <span>
                        <strong>Programa:</strong> {(newAulaGrado === '4' || newAulaGrado === '5') ? 'INSIDECLASSROOM' : 'OUTSIDECLASSROOM'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium">•</span>
                      <span>
                        <strong>Días permitidos:</strong> {(newAulaGrado === '4' || newAulaGrado === '5') ? 'Lunes a Viernes' : 'Lunes a Sábado'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium">•</span>
                      <span>
                        <strong>Horas semanales:</strong> Máximo {(newAulaGrado === '4' || newAulaGrado === '5') ? '2 horas' : '3 horas'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium">•</span>
                      <span>
                        <strong>Horario:</strong> {(newAulaGrado === '4' || newAulaGrado === '5') ? 'Dentro del horario escolar' : 'Jornada contraria'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Aula</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-6">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por aula o tutor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filterInstitucion} onValueChange={setFilterInstitucion}>
                <SelectTrigger>
                  <SelectValue placeholder="Institución" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las instituciones</SelectItem>
                  {instituciones.map((inst) => (
                    <SelectItem key={inst.id_institucion} value={inst.id_institucion}>
                      {inst.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterSede}
                onValueChange={setFilterSede}
                disabled={filterInstitucion === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sedes</SelectItem>
                  {sedesFiltradas.map((sede) => (
                    <SelectItem key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPrograma} onValueChange={setFilterPrograma}>
                <SelectTrigger>
                  <SelectValue placeholder="Programa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los programas</SelectItem>
                  <SelectItem value="INSIDECLASSROOM">INSIDECLASSROOM</SelectItem>
                  <SelectItem value="OUTSIDECLASSROOM">OUTSIDECLASSROOM</SelectItem>
                </SelectContent>
              </Select>
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

            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Filtros activos aplicados
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Aulas Registradas ({filteredAulas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aula</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Institución / Sede</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAulas.map((aula) => {
                const sede = { id: aula.id_sede, nombre: aula.nombre_sede }
                const institucion = { id: aula.id_institucion, nombre: aula.nombre_institucion }
                const tutor = tutors.find((t) => t.id_tutor === aula.id_tutor)

                return (
                  <TableRow key={`${aula.id_aula}-${aula.id_sede}-${aula.id_institucion}`}>
                    <TableCell>{aula.nombre_aula}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{aula.grado}°</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          aula.id_programa === 1
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {aula.id_programa === 1 ? 'Inside' : 'Outside'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{institucion?.nombre}</p>
                        <p className="text-xs text-muted-foreground">{sede?.nombre}</p>
                      </div>
                    </TableCell>
                    <TableCell>{tutor ? tutor.nombre_persona : 'No hay tutor asignado'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAula(JSON.stringify({
                              id_aula: aula.id_aula,
                              id_sede: aula.id_sede,
                              id_institucion: aula.id_institucion
                            }));
                            setOpenTutorDialog(true);
                          }}
                        >
                          <UserCog className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredAulas.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron aulas con los filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Tutor Dialog */}
      <Dialog open={openTutorDialog} onOpenChange={setOpenTutorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Tutor</DialogTitle>
            <DialogDescription>
              Asigna un nuevo tutor a esta aula
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangeTutor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-tutor">Nuevo Tutor</Label>
              <Select
                value={selectedTutor}
                onValueChange={(value: string) => setSelectedTutor(value)}
                required>
                <SelectTrigger id="id_tutor">
                  <SelectValue placeholder="Seleccionar tutor" />
                </SelectTrigger>
                <SelectContent>
                  {tutors.map((tutor) => (
                    <SelectItem key={tutor.id_tutor} value={tutor.id_tutor.toString()}>
                      Tutor {tutor.id_tutor}: {tutor.nombre_persona} - {tutor.id_persona}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenTutorDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Asignar Tutor</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}