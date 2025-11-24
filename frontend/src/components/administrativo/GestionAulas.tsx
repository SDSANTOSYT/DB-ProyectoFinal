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
  aulas,
  instituciones,
  sedes,
  tutores,
  getSedeById,
  getInstitucionById,
  getTutorById,
  getEstudiantesByAula,
} from '../../lib/mockData';
import { toast } from 'sonner@2.0.3';

export default function GestionAulas() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitucion, setFilterInstitucion] = useState<string>('all');
  const [filterSede, setFilterSede] = useState<string>('all');
  const [filterPrograma, setFilterPrograma] = useState<string>('all');
  const [filterGrado, setFilterGrado] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [openTutorDialog, setOpenTutorDialog] = useState(false);
  const [openHorarioDialog, setOpenHorarioDialog] = useState(false);
  const [selectedAula, setSelectedAula] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

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
      const sede = sedes.find(s => s.id === sedeId);
      if (sede) {
        toast.info(`Filtrando aulas de: ${sede.nombre}`);
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
    : sedes.filter(sede => sede.institucionId === filterInstitucion);

  const filteredAulas = aulas.filter((aula) => {
    const sede = getSedeById(aula.sedeId);
    const institucion = sede ? getInstitucionById(sede.institucionId) : null;
    const tutor = getTutorById(aula.tutorId);

    const matchesSearch =
      aula.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor?.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesInstitucion =
      filterInstitucion === 'all' || institucion?.id === filterInstitucion;

    const matchesSede =
      filterSede === 'all' || aula.sedeId === filterSede;

    const matchesPrograma =
      filterPrograma === 'all' || aula.programa === filterPrograma;

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

  const handleUpdateHorario = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Horario actualizado exitosamente');
    setOpenHorarioDialog(false);
  };

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
                  <Label htmlFor="aula-nombre">Nombre del Aula</Label>
                  <Input id="aula-nombre" placeholder="Ej: Aula 4A" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aula-grado">Grado</Label>
                  <Select required>
                    <SelectTrigger id="aula-grado">
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
                  <Label htmlFor="aula-programa">Programa</Label>
                  <Select required>
                    <SelectTrigger id="aula-programa">
                      <SelectValue placeholder="Seleccionar programa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSIDECLASSROOM">
                        INSIDECLASSROOM (4°-5°)
                      </SelectItem>
                      <SelectItem value="OUTSIDECLASSROOM">
                        OUTSIDECLASSROOM (9°-10°)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aula-institucion">Institución</Label>
                  <Select required>
                    <SelectTrigger id="aula-institucion">
                      <SelectValue placeholder="Seleccionar institución" />
                    </SelectTrigger>
                    <SelectContent>
                      {instituciones.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aula-sede">Sede</Label>
                  <Select required>
                    <SelectTrigger id="aula-sede">
                      <SelectValue placeholder="Seleccionar sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {sedes.map((sede) => (
                        <SelectItem key={sede.id} value={sede.id}>
                          {sede.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aula-tutor">Tutor Asignado</Label>
                  <Select required>
                    <SelectTrigger id="aula-tutor">
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
                    <SelectItem key={inst.id} value={inst.id}>
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
                <TableHead>Horarios</TableHead>
                <TableHead>Estudiantes</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAulas.map((aula) => {
                const sede = getSedeById(aula.sedeId);
                const institucion = sede ? getInstitucionById(sede.institucionId) : null;
                const tutor = getTutorById(aula.tutorId);
                const estudiantesCount = getEstudiantesByAula(aula.id).length;

                return (
                  <TableRow key={aula.id}>
                    <TableCell>{aula.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{aula.grado}°</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          aula.programa === 'INSIDECLASSROOM'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {aula.programa === 'INSIDECLASSROOM' ? 'Inside' : 'Outside'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{institucion?.nombre}</p>
                        <p className="text-xs text-muted-foreground">{sede?.nombre}</p>
                      </div>
                    </TableCell>
                    <TableCell>{tutor?.nombre}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">{aula.horarios.length} sesiones</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="text-sm">{estudiantesCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAula(aula.id);
                            setOpenTutorDialog(true);
                          }}
                        >
                          <UserCog className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAula(aula.id);
                            setOpenHorarioDialog(true);
                          }}
                        >
                          <Calendar className="w-4 h-4" />
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
              <Select required>
                <SelectTrigger id="new-tutor">
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
            <div className="space-y-2">
              <Label htmlFor="fecha-cambio">Fecha de Cambio</Label>
              <Input id="fecha-cambio" type="date" required />
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

      {/* Modify Schedule Dialog */}
      <Dialog open={openHorarioDialog} onOpenChange={setOpenHorarioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modificar Horario</DialogTitle>
            <DialogDescription>
              Ajusta los horarios de clase para esta aula
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateHorario} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dia-semana">Día de la Semana</Label>
              <Select required>
                <SelectTrigger id="dia-semana">
                  <SelectValue placeholder="Seleccionar día" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lunes">Lunes</SelectItem>
                  <SelectItem value="Martes">Martes</SelectItem>
                  <SelectItem value="Miércoles">Miércoles</SelectItem>
                  <SelectItem value="Jueves">Jueves</SelectItem>
                  <SelectItem value="Viernes">Viernes</SelectItem>
                  <SelectItem value="Sábado">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora-inicio">Hora Inicio</Label>
                <Input id="hora-inicio" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora-fin">Hora Fin</Label>
                <Input id="hora-fin" type="time" required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenHorarioDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar Horario</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}