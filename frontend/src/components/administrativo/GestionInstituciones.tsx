import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'; import { useState } from 'react';
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
import { Badge } from '../ui/badge';
import {
  Building2,
  Plus,
  ChevronDown,
  MapPin,
  Phone,
  School,
} from 'lucide-react';
import { instituciones, getSedesByInstitucion, getAulasBySede } from '../../lib/mockData';
import { toast } from 'sonner@2.0.3';
import type { Jornada } from '../../lib/types';

export default function GestionInstituciones() {
  const navigate = useNavigate();
  const [expandedInst, setExpandedInst] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSedeDialog, setOpenSedeDialog] = useState(false);
  const [selectedInstitucion, setSelectedInstitucion] = useState<string | null>(null);

  // Estado para el formulario de nueva institución
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    duracion_clase: '60', // Duración en minutos (40, 45, 50, 55, 60)
    jornada: ''
  });

  const handleAddInstitucion = async (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí se crearía la institución en el backend
    const nuevaInstitucion = {
      nombre: formData.nombre,
      jornada: formData.jornada,
      duracion_hora: Number(formData.duracion_clase),
    };

    console.log(nuevaInstitucion)

    let url = `http://127.0.0.1:8000/instituciones/`;

    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaInstitucion),
    });

    if (!response.ok) {
      throw new Error("Error Creando Institución");
    }

    const institucionData = await response.json()

    // Automáticamente crear la Sede Principal con los mismos datos
    const sedePrincipal = {
      nombre_sede: "Sede Principal",
      direccion: formData.direccion,
      id_institucion: institucionData.id_institucion,
      telefono: formData.telefono,
    };

    url = `http://127.0.0.1:8000/sedes/`
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sedePrincipal),
    });

    if (!response.ok) {
      throw new Error("Error Creando Sede Principal");
    }

    // Limpiar formulario
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      duracion_clase: '60',
      jornada: ''
    });

    toast.success('Institución y Sede Principal creadas exitosamente');
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAddSede = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Sede creada exitosamente');
    setOpenSedeDialog(false);
  };

  const handleGestionarAulas = (sedeId: string, institucionId: string) => {
    // Navega a la página de aulas con filtros aplicados
    navigate('/aulas', {
      state: {
        filterSede: sedeId,
        filterInstitucion: institucionId
      }
    });
  };

  return (
    <div className="space-y-6">
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
                  onValueChange={(value: Jornada) => setFormData(prev => ({ ...prev, jornada: value }))}
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
                <Label htmlFor="duracion_clase">Duración de Clases (minutos)</Label>
                <Select
                  value={formData.duracion_clase}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, duracion_clase: value }))}
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
                  <li>• Se creará automáticamente una "Sede Principal" con la dirección y teléfono indicados</li>
                  <li>• La duración de clase seleccionada aplicará para todas las aulas de esta institución</li>
                  <li>• Esta duración se considera equivalente a 1 hora para los reportes</li>
                </ul>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Institución</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {instituciones.map((inst) => {
          const sedes = getSedesByInstitucion(inst.id);
          const totalAulas = sedes.reduce((acc, sede) => {
            return acc + getAulasBySede(sede.id).length;
          }, 0);
          const isExpanded = expandedInst === inst.id;

          return (
            <Card key={inst.id}>
              <Collapsible
                open={isExpanded}
                onOpenChange={() =>
                  setExpandedInst(isExpanded ? null : inst.id)
                }
              >
                <CardHeader>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle>{inst.nombre}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {inst.ciudad}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {inst.telefono}
                            </span>
                            <Badge variant="secondary">{sedes.length} Sedes</Badge>
                            <Badge variant="outline">{totalAulas} Aulas</Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''
                            }`}
                        />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
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
                            setSelectedInstitucion(inst.id);
                            setOpenSedeDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Agregar Sede
                        </Button>
                      </div>

                      {sedes.map((sede) => {
                        const aulasCount = getAulasBySede(sede.id).length;
                        return (
                          <div
                            key={sede.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p>{sede.nombre}</p>
                                <Badge variant="secondary">
                                  <School className="w-3 h-3 mr-1" />
                                  {aulasCount} aulas
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {sede.direccion}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Tel: {sede.telefono}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGestionarAulas(sede.id, inst.id)}
                            >
                              Gestionar Aulas
                            </Button>
                          </div>
                        );
                      })}

                      {sedes.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No hay sedes registradas</p>
                          <p className="text-sm">Agrega la primera sede de esta institución</p>
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
              <Label htmlFor="sede-nombre">Nombre de la Sede</Label>
              <Input
                id="sede-nombre"
                placeholder="Ej: Sede Principal"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sede-direccion">Dirección</Label>
              <Input
                id="sede-direccion"
                placeholder="Calle 45 #23-67"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sede-telefono">Teléfono</Label>
              <Input
                id="sede-telefono"
                placeholder="3201234567"
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