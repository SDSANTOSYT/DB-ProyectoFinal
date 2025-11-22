import { useState } from 'react';
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

export default function GestionInstituciones() {
  const [expandedInst, setExpandedInst] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSedeDialog, setOpenSedeDialog] = useState(false);
  const [selectedInstitucion, setSelectedInstitucion] = useState<string | null>(null);

  const handleAddInstitucion = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Institución creada exitosamente');
    setOpenDialog(false);
  };

  const handleAddSede = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Sede creada exitosamente');
    setOpenSedeDialog(false);
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
                <Input id="nombre" placeholder="Ej: Colegio San José" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit">NIT</Label>
                <Input id="nit" placeholder="900123456-1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" placeholder="Calle 45 #23-67" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" placeholder="3201234567" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input id="ciudad" placeholder="Bogotá" required />
                </div>
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
                          className={`w-5 h-5 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
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
                            <Button variant="outline" size="sm">
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
