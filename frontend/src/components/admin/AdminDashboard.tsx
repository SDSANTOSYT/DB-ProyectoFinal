import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Building2,
  Users,
  GraduationCap,
  School,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { instituciones, aulas, estudiantes, tutores } from '../../lib/mockData';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Instituciones',
      value: instituciones.length,
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      link: '/instituciones',
      change: '+2 este mes',
    },
    {
      title: 'Aulas Activas',
      value: aulas.length,
      icon: <School className="w-8 h-8 text-purple-600" />,
      link: '/aulas',
      change: '+3 este mes',
    },
    {
      title: 'Estudiantes',
      value: estudiantes.length,
      icon: <GraduationCap className="w-8 h-8 text-green-600" />,
      link: '/estudiantes',
      change: '+12 este mes',
    },
    {
      title: 'Tutores',
      value: tutores.length,
      icon: <Users className="w-8 h-8 text-orange-600" />,
      link: '/personal',
      change: '+1 este mes',
    },
  ];

  const insideClassroomAulas = aulas.filter(
    (a) => a.programa === 'INSIDECLASSROOM'
  ).length;
  const outsideClassroomAulas = aulas.filter(
    (a) => a.programa === 'OUTSIDECLASSROOM'
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Panel de Administrador</h1>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión educativa GLOBALENGLISH
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-2">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-2">{stat.change}</p>
              <Link to={stat.link}>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Ver detalles →
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Programs Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Programa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p>INSIDECLASSROOM</p>
                <p className="text-sm text-muted-foreground">Grados 4° y 5°</p>
              </div>
              <div className="text-3xl text-blue-600">
                {insideClassroomAulas}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p>OUTSIDECLASSROOM</p>
                <p className="text-sm text-muted-foreground">Grados 9° y 10°</p>
              </div>
              <div className="text-3xl text-purple-600">
                {outsideClassroomAulas}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/configuracion">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Gestionar Calendario y Festivos
              </Button>
            </Link>
            <Link to="/admin/usuarios">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Administrar Usuarios
              </Button>
            </Link>
            <Link to="/instituciones">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="w-4 h-4 mr-2" />
                Crear Nueva Institución
              </Button>
            </Link>
            <Link to="/aulas">
              <Button variant="outline" className="w-full justify-start">
                <School className="w-4 h-4 mr-2" />
                Configurar Aulas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="bg-green-100 p-2 rounded">
                <GraduationCap className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">12 nuevos estudiantes matriculados</p>
                <p className="text-xs text-muted-foreground">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="bg-blue-100 p-2 rounded">
                <School className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">Nueva aula creada: Aula 10A</p>
                <p className="text-xs text-muted-foreground">Hace 5 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 p-2 rounded">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">Nuevo tutor contratado: Diego Torres</p>
                <p className="text-xs text-muted-foreground">Hace 1 día</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
