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
import { Plus, Search, Mail, Phone, School } from 'lucide-react';
import { tutores, getAulasByTutor, getSedeById, getInstitucionById } from '../../lib/mockData';
import { toast } from 'sonner@2.0.3';
import type { Rol } from '../../lib/types';

export default function GestionPersonal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);


  const [selectedRole, setSelectedRole] = useState<Rol | string>('')

  const filteredTutores = tutores.filter((tutor) =>
    tutor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.documento.includes(searchTerm) ||
    tutor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTutor = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget
    const formData = new FormData(form)

    const data = {
      nombre: formData.get("nombre"),
      //documento: formData.get("documento"),
      correo: formData.get("email"),
      rol: selectedRole
    }

    console.log(data)

    const url = `http://127.0.0.1:8000/personas/`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Error Creando persona');
    }

    toast.success('Tutor contratado exitosamente');
    setOpenDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Personal</h1>
          <p className="text-muted-foreground">
            Administra tutores y asignaciones de aulas
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Contratar Persona
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contratar Nuevo Tutor</DialogTitle>
              <DialogDescription>
                Ingresa los datos de la persona
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTutor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="persona-nombre">Nombre Completo</Label>
                <Input
                  id="persona-nombre"
                  name='nombre'
                  placeholder="Ej: Carlos Rodríguez"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona-documento">Documento</Label>
                <Input
                  id="persona-documento"
                  name='documento'
                  placeholder="1122334455"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona-email">Correo Electrónico</Label>
                <Input
                  id="persona-email"
                  type="email"
                  name='email'
                  placeholder="tutor@globalenglish.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona-role">Rol</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key='TUTOR' value='TUTOR'>
                      Tutor
                    </SelectItem>
                    <SelectItem key='ADMINISTRATIVO' value='ADMINISTRATIVO'>
                      Administrativo
                    </SelectItem>
                    <SelectItem key='ADMINISTRADOR' value='ADMINISTRADOR'>
                      Administrador
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Contratar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, documento o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tutors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tutores Registrados ({filteredTutores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Aulas Asignadas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTutores.map((tutor) => {
                const aulasAsignadas = getAulasByTutor(tutor.id);

                return (
                  <TableRow key={tutor.id}>
                    <TableCell>{tutor.nombre}</TableCell>
                    <TableCell>{tutor.documento}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {tutor.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {tutor.telefono}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <School className="w-4 h-4" />
                        <span>{aulasAsignadas.length} aulas</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tutors Cards View */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTutores.map((tutor) => {
          const aulasAsignadas = getAulasByTutor(tutor.id);

          return (
            <Card key={tutor.id}>
              <CardHeader>
                <CardTitle className="text-lg">{tutor.nombre}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Doc: {tutor.documento}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{tutor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{tutor.telefono}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm mb-2">Aulas Asignadas:</p>
                    {aulasAsignadas.length > 0 ? (
                      <div className="space-y-2">
                        {aulasAsignadas.map((aula) => {
                          const sede = getSedeById(aula.sedeId);
                          const institucion = sede
                            ? getInstitucionById(sede.institucionId)
                            : null;

                          return (
                            <div
                              key={aula.id}
                              className="p-2 bg-gray-50 rounded text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span>{aula.nombre}</span>
                                <Badge
                                  variant={
                                    aula.programa === 'INSIDECLASSROOM'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {aula.grado}°
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {institucion?.nombre}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Sin aulas asignadas
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
