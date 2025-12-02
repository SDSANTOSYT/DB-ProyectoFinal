import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import {
  Building2,
  Plus,
  ChevronDown,
  CalendarClock,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Jornada, Institucion, Sede } from '../../lib/types';

const API_URL = 'http://127.0.0.1:8000';

export default function GestionInstituciones() {
  const navigate = useNavigate();
  const [expandedInst, setExpandedInst] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSedeDialog, setOpenSedeDialog] = useState(false);
  const [selectedInstitucion, setSelectedInstitucion] = useState<number | null>(null);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [sedesByInstitution, setSedesByInstitution] = useState<Record<number, Sede[]>>({});

  // Estado para el formulario de nueva institución / sede
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    duracion_clase: '60', // Duración en minutos
    jornada: '',
    nombre_sede: ''
  });

  const getInstituciones = async () => {
    const url = `${API_URL}/instituciones/`;

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
    const url = `${API_URL}/sedes/by-institucion/${id_institucion}`;

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

  const handleExpandInstitution = async (instId: number) => {
    setExpandedInst(prev => (prev === instId ? null : instId));

    // Si ya tenemos las sedes cargadas, no volvemos a llamar
    if (sedesByInstitution[instId]) return;

    const sedes = await getSedesById(instId);

    setSedesByInstitution(prev => ({
      ...prev,
      [instId]: sedes,
    }));
  };

  const handleAddInstitucion = async (e: React.FormEvent) => {
    e.preventDefault();

    const nuevaInstitucion = {
      nombre: formData.nombre,
      jornada: formData.jornada,
      duracion_hora: Number(formData.duracion_clase),
    };

    try {
      // Crear institución
      let url = `${API_URL}/instituciones/`;

      let response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaInstitucion),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Error Creando Institución");
      }

      const institucionData: Institucion = await response.json();
      setInstituciones(prev => [...prev, institucionData]);

      // Crear Sede Principal
      const sedePrincipal = {
        nombre_sede: "Sede Principal",
        direccion: formData.direccion,
        id_institucion: institucionData.id_institucion,
        telefono: formData.telefono,
      };

      url = `${API_URL}/sedes/`;
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sedePrincipal),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Error Creando Sede Principal");
      }

      const sedeData: Sede = await response.json();

      setSedesByInstitution(prev => ({
        ...prev,
        [institucionData.id_institucion]: [sedeData]
      }));

      // Limpiar formulario
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        duracion_clase: '60',
        jornada: '',
        nombre_sede: ''
      });

      toast.success('Institución y Sede Principal creadas exitosamente');
      setOpenDialog(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al crear la institución');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAddSede = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInstitucion) {
      toast.error('No hay institución seleccionada');
      return;
    }

    const sedeNueva = {
      nombre_sede: formData.nombre_sede,
      direccion: formData.direccion,
      id_institucion: selectedInstitucion,
      telefono: formData.telefono,
    };

    try {
      const url = `${API_URL}/sedes/`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sedeNueva),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Error creando sede");
      }

      const sedeData: Sede = await response.json();

      setSedesByInstitution(prev => ({
        ...prev,
        [selectedInstitucion]: [...(prev[selectedInstitucion] || []), sedeData]
      }));

      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        duracion_clase: '60',
        jornada: '',
        nombre_sede: ''
      });

      toast.success('Sede creada exitosamente');
      setOpenSedeDialog(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al crear la sede');
    }
  };

  const handleGestionarAulas = (sedeId: string, institucionId: string) => {
    navigate('/aulas', {
      state: {
        filterSede: sedeId,
        filterInstitucion: institucionId
      }
    });
  };

  // 🔴 Eliminar sede
  const handleDeleteSede = async (id_sede: number, id_institucion: number) => {
    const confirmar = window.confirm(
      '¿Está seguro de eliminar esta sede? Esta acción no se puede deshacer.'
    );
    if (!confirmar) return;

    try {
      const url = `${API_URL}/sedes/${id_sede}/${id_institucion}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast.success('Sede eliminada correctamente');
        setSedesByInstitution(prev => {
          const sedesInst = prev[id_institucion] || [];
          return {
            ...prev,
            [id_institucion]: sedesInst.filter(s => s.id_sede !== id_sede),
          };
        });
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(
          errorData?.detail ??
          'Error al eliminar la sede. Verifica si tiene datos relacionados.'
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al eliminar la sede');
    }
  };

  // 🔴 Eliminar institución
  const handleDeleteInstitucion = async (id_institucion: number) => {
    const confirmar = window.confirm(
      '¿Está seguro de eliminar esta institución? También deberían eliminarse o quedar huérfanas sus sedes y aulas relacionadas.'
    );
    if (!confirmar) return;

    try {
      const url = `${API_URL}/instituciones/${id_institucion}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast.success('Institución eliminada correctamente');
        setInstituciones(prev =>
          prev.filter(inst => inst.id_institucion !== id_institucion)
        );
        setSedesByInstitution(prev => {
          const nuevo = { ...prev };
          delete nuevo[id_institucion];
          return nuevo;
        });
        setExpandedInst(prev => (prev === id_institucion ? null : prev));
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(
          errorData?.detail ??
          'Error al eliminar la institución. Verifica si tiene sedes, aulas u otros registros relacionados.'
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al eliminar la institución');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Crear institución */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Instituciones</h1>
          <p className="text-muted-foreground">
            Administra instituciones educativas y sus sedes
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Institución
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Institución</DialogTitle>
              <DialogDescription>
                Ingresa los datos de la institución educativa
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddInstitucion} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Institución</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Colegio San José"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jornada">Jornada</Label>
                <Select
                  value={formData.jornada}
                  onValueChange={(value: Jornada) =>
                    setFormData(prev => ({ ...prev, jornada: value }))
                  }
                  required
                >
                  <SelectTrigger id="jornada">
                    <SelectValue placeholder="Seleccionar Jornada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNICA MAÑANA">Unica Mañana</SelectItem>
                    <SelectItem value="UNICA TARDE">Unica Tarde</SelectItem>
                    <SelectItem value="MIXTA">MIXTA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección (Sede Principal)</Label>
                <Input
                  id="direccion"
                  placeholder="Calle 45 #23-67"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Esta dirección se usará para la sede principal
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (Sede Principal)</Label>
                <Input
                  id="telefono"
                  placeholder="3201234567"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracion_clase">
                  Duración de Clases (minutos)
                </Label>
                <Select
                  value={formData.duracion_clase}
                  onValueChange={(value: string) =>
                    setFormData(prev => ({ ...prev, duracion_clase: value }))
                  }
                  required
                >
                  <SelectTrigger id="duracion_clase">
                    <SelectValue placeholder="Seleccionar duración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="40">40 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="50">50 minutos</SelectItem>
                    <SelectItem value="55">55 minutos</SelectItem>
                    <SelectItem value="60">60 minutos (1 hora)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Esta duración se aplicará a todas las clases de la institución
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>📝 Nota importante:</strong>
                </p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4">
                  <li>
                    • Se creará automáticamente una "Sede Principal" con la
                    dirección y teléfono indicados
                  </li>
                  <li>
                    • La duración de clase seleccionada aplicará para todas las
                    aulas de esta institución
                  </li>
                  <li>
                    • Esta duración se considera equivalente a 1 hora para los
                    reportes
                  </li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Institución</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de instituciones */}
      <div className="space-y-4">
        {instituciones.map(inst => {
          const sedes = sedesByInstitution[inst.id_institucion] || [];
          const isExpanded = expandedInst === inst.id_institucion;

          return (
            <Card key={inst.id_institucion}>
              <Collapsible
                open={isExpanded}
                onOpenChange={() =>
                  handleExpandInstitution(inst.id_institucion)
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-4 cursor-pointer">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle>{inst.nombre}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarClock className="w-4 h-4" />
                              {inst.jornada}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="w-4 h-4" />
                              {inst.duracion_hora}
                            </span>
                            <Badge variant="secondary">
                              {sedes.length} Sedes
                            </Badge>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 ml-2 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </CollapsibleTrigger>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteInstitucion(inst.id_institucion);
                      }}
                    >
                      Eliminar institución
                    </Button>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm">Sedes de {inst.nombre}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedInstitucion(inst.id_institucion);
                            setOpenSedeDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Agregar Sede
                        </Button>
                      </div>

                      {sedes.map(sede => (
                        <div
                          key={sede.id_sede}
                          className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 gap-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p>{sede.nombre_sede}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {sede.direccion}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Tel: {sede.telefono}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleGestionarAulas(
                                  sede.id_sede.toString(),
                                  inst.id_institucion.toString()
                                )
                              }
                            >
                              Gestionar Aulas
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteSede(
                                  sede.id_sede,
                                  inst.id_institucion
                                )
                              }
                            >
                              Eliminar sede
                            </Button>
                          </div>
                        </div>
                      ))}

                      {sedes.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No hay sedes registradas</p>
                          <p className="text-sm">
                            Agrega la primera sede de esta institución
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Add Sede Dialog */}
      <Dialog open={openSedeDialog} onOpenChange={setOpenSedeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Sede</DialogTitle>
            <DialogDescription>
              Ingresa los datos de la nueva sede
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSede} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_sede">Nombre de la Sede</Label>
              <Input
                id="nombre_sede"
                placeholder="Ej: Sede Norte"
                value={formData.nombre_sede}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                placeholder="Calle 45 #23-67"
                value={formData.direccion}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="3201234567"
                value={formData.telefono}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenSedeDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Crear Sede</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
