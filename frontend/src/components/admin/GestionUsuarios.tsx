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
import { Plus, Search, Mail, Shield, Edit, Trash2 } from 'lucide-react';
import { tutores } from '../../lib/mockData';
import { toast } from 'sonner@2.0.3';

const mockUsers = [
  {
    id: '1',
    nombre: 'Admin Principal',
    email: 'admin@globalenglish.com',
    rol: 'ADMINISTRADOR',
    estado: 'Activo',
  },
  {
    id: '2',
    nombre: 'María González',
    email: 'admin2@globalenglish.com',
    rol: 'ADMINISTRATIVO',
    estado: 'Activo',
  },
  ...tutores.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    email: t.email,
    rol: 'TUTOR',
    estado: 'Activo',
  })),
];

export default function GestionUsuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRol = filterRol === 'all' || user.rol === filterRol;

    return matchesSearch && matchesRol;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Usuario creado exitosamente');
    setOpenDialog(false);
  };

  const handleDeleteUser = (id: string) => {
    toast.success('Usuario eliminado');
  };

  const getRolBadgeVariant = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'destructive';
      case 'ADMINISTRATIVO':
        return 'default';
      case 'TUTOR':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Ingresa los datos del usuario y asigna su rol
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-nombre">Nombre Completo</Label>
                <Input
                  id="user-nombre"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Correo Electrónico</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="usuario@globalenglish.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-rol">Rol</Label>
                <Select required>
                  <SelectTrigger id="user-rol">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                    <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                    <SelectItem value="TUTOR">Tutor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Contraseña Inicial</Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="••••••••"
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
                <Button type="submit">Crear Usuario</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                <SelectItem value="TUTOR">Tutor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{mockUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">
              {mockUsers.filter((u) => u.rol === 'ADMINISTRADOR').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Administrativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">
              {mockUsers.filter((u) => u.rol === 'ADMINISTRATIVO').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tutores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">
              {mockUsers.filter((u) => u.rol === 'TUTOR').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      {user.nombre}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRolBadgeVariant(user.rol)}>
                      {user.rol}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">{user.estado}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron usuarios</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción de Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <Badge variant="destructive" className="mb-2">
                ADMINISTRADOR
              </Badge>
              <p className="text-sm text-muted-foreground">
                Acceso total al sistema. Puede gestionar usuarios, configuración,
                instituciones, aulas y todo el personal.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge variant="default" className="mb-2">
                ADMINISTRATIVO
              </Badge>
              <p className="text-sm text-muted-foreground">
                Gestiona instituciones, aulas, estudiantes y personal. No puede
                modificar configuración del sistema ni usuarios.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge variant="secondary" className="mb-2">
                TUTOR
              </Badge>
              <p className="text-sm text-muted-foreground">
                Acceso a sus aulas asignadas. Puede tomar asistencia, ingresar
                notas y ver sus reportes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
