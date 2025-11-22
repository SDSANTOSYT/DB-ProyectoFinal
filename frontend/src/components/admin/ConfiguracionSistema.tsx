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
import { Calendar } from '../ui/calendar';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Calendar as CalendarIcon, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const mockFestivos = [
  { id: '1', fecha: '2025-01-01', nombre: 'Año Nuevo' },
  { id: '2', fecha: '2025-01-06', nombre: 'Reyes Magos' },
  { id: '3', fecha: '2025-03-24', nombre: 'Día de San José' },
  { id: '4', fecha: '2025-04-17', nombre: 'Jueves Santo' },
  { id: '5', fecha: '2025-04-18', nombre: 'Viernes Santo' },
  { id: '6', fecha: '2025-05-01', nombre: 'Día del Trabajo' },
  { id: '7', fecha: '2025-07-20', nombre: 'Día de la Independencia' },
  { id: '8', fecha: '2025-08-07', nombre: 'Batalla de Boyacá' },
  { id: '9', fecha: '2025-12-25', nombre: 'Navidad' },
];

const mockMotivos = [
  { id: '1', nombre: 'Enfermedad' },
  { id: '2', nombre: 'Calamidad Doméstica' },
  { id: '3', nombre: 'Permiso Personal' },
  { id: '4', nombre: 'Festivo' },
  { id: '5', nombre: 'Capacitación' },
];

export default function ConfiguracionSistema() {
  const [openFestivoDialog, setOpenFestivoDialog] = useState(false);
  const [openMotivoDialog, setOpenMotivoDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleAddFestivo = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Festivo agregado exitosamente');
    setOpenFestivoDialog(false);
  };

  const handleAddMotivo = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Motivo creado exitosamente');
    setOpenMotivoDialog(false);
  };

  const handleDeleteFestivo = (id: string) => {
    toast.success('Festivo eliminado');
  };

  const handleDeleteMotivo = (id: string) => {
    toast.success('Motivo eliminado');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Configuración del Sistema</h1>
        <p className="text-muted-foreground">
          Gestiona calendario, festivos y configuraciones generales
        </p>
      </div>

      <Tabs defaultValue="festivos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="festivos">Festivos y Calendario</TabsTrigger>
          <TabsTrigger value="motivos">Motivos de Ausencia</TabsTrigger>
          <TabsTrigger value="periodos">Periodos Académicos</TabsTrigger>
          <TabsTrigger value="general">Configuración General</TabsTrigger>
        </TabsList>

        <TabsContent value="festivos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Días Festivos</CardTitle>
                <Dialog open={openFestivoDialog} onOpenChange={setOpenFestivoDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Festivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Día Festivo</DialogTitle>
                      <DialogDescription>
                        Registra un nuevo día festivo en el calendario
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddFestivo} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="festivo-nombre">Nombre del Festivo</Label>
                        <Input
                          id="festivo-nombre"
                          placeholder="Ej: Día de la Independencia"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="festivo-fecha">Fecha</Label>
                        <Input id="festivo-fecha" type="date" required />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpenFestivoDialog(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">Agregar</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {mockFestivos.map((festivo) => (
                  <div
                    key={festivo.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"
                  >
                    <div>
                      <p>{festivo.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(festivo.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFestivo(festivo.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendario Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motivos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Motivos de Ausencia</CardTitle>
                <Dialog open={openMotivoDialog} onOpenChange={setOpenMotivoDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Motivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Motivo de Ausencia</DialogTitle>
                      <DialogDescription>
                        Define un nuevo motivo para registro de ausencias
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddMotivo} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="motivo-nombre">Nombre del Motivo</Label>
                        <Input
                          id="motivo-nombre"
                          placeholder="Ej: Capacitación"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpenMotivoDialog(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">Crear</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockMotivos.map((motivo) => (
                  <div
                    key={motivo.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <Badge variant="outline">{motivo.nombre}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMotivo(motivo.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periodos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Periodos Académicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Periodo 1', 'Periodo 2', 'Periodo 3', 'Periodo 4'].map(
                  (periodo, idx) => (
                    <div
                      key={periodo}
                      className="p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p>{periodo}</p>
                        <Badge>Activo</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fecha Inicio</p>
                          <p>
                            {new Date(2025, idx * 3, 1).toLocaleDateString(
                              'es-ES'
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fecha Fin</p>
                          <p>
                            {new Date(2025, (idx + 1) * 3 - 1, 28).toLocaleDateString(
                              'es-ES'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre-sistema">Nombre del Sistema</Label>
                <Input
                  id="nombre-sistema"
                  defaultValue="GLOBALENGLISH"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-sistema">Email de Notificaciones</Label>
                <Input
                  id="email-sistema"
                  type="email"
                  defaultValue="admin@globalenglish.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zona-horaria">Zona Horaria</Label>
                <Input
                  id="zona-horaria"
                  defaultValue="America/Bogota"
                  disabled
                />
              </div>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
