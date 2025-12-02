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
      icon: <Building2 className="w-7 h-7 text-primary" />,
      link: '/instituciones',
      change: '+2 este mes',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Aulas Activas',
      value: aulas.length,
      icon: <School className="w-7 h-7 text-primary" />,
      link: '/aulas',
      change: '+3 este mes',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Estudiantes',
      value: estudiantes.length,
      icon: <GraduationCap className="w-7 h-7 text-success" />,
      link: '/estudiantes',
      change: '+12 este mes',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Tutores',
      value: tutores.length,
      icon: <Users className="w-7 h-7 text-primary" />,
      link: '/personal',
      change: '+1 este mes',
      bgColor: 'bg-red-50',
    },
  ];

  const insideClassroomAulas = aulas.filter(
    (a) => a.programa === 'INSIDECLASSROOM'
  ).length;
  const outsideClassroomAulas = aulas.filter(
    (a) => a.programa === 'OUTSIDECLASSROOM'
  ).length;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground">
        <span>Inicio</span>
        <span className="mx-2 text-primary">/</span>
        <span className="text-foreground font-medium">Panel de Administrador</span>
      </div>

      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-4xl font-semibold mb-2 text-foreground">Panel de Administrador</h1>
        <p className="text-muted-foreground text-lg">
          Bienvenido al sistema de gestión educativa GLOBALENGLISH
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-gray-200 hover:shadow-lg hover:border-primary/50 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2.5 rounded-lg`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2 text-foreground">{stat.value}</div>
              <p className="text-sm text-success mb-3">{stat.change}</p>
              <Link to={stat.link}>
                <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary-hover font-medium">
                  Ver detalles →
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Programs Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Distribución por Programa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-red-50 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="font-semibold text-foreground">INSIDECLASSROOM</p>
                <p className="text-sm text-muted-foreground">Grados 4° y 5°</p>
              </div>
              <div className="text-4xl font-bold text-primary">
                {insideClassroomAulas}
              </div>
            </div>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-red-50 rounded-xl border-l-4 border-primary/70 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="font-semibold text-foreground">OUTSIDECLASSROOM</p>
                <p className="text-sm text-muted-foreground">Grados 9° y 10°</p>
              </div>
              <div className="text-4xl font-bold text-primary/80">
                {outsideClassroomAulas}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/configuracion">
              <Button variant="outline" className="w-full justify-start h-12 hover:bg-accent hover:text-primary hover:border-primary transition-all">
                <Calendar className="w-5 h-5 mr-3" />
                Gestionar Calendario y Festivos
              </Button>
            </Link>
            <Link to="/admin/usuarios">
              <Button variant="outline" className="w-full justify-start h-12 hover:bg-accent hover:text-primary hover:border-primary transition-all">
                <Users className="w-5 h-5 mr-3" />
                Administrar Usuarios
              </Button>
            </Link>
            <Link to="/instituciones">
              <Button variant="outline" className="w-full justify-start h-12 hover:bg-accent hover:text-primary hover:border-primary transition-all">
                <Building2 className="w-5 h-5 mr-3" />
                Crear Nueva Institución
              </Button>
            </Link>
            <Link to="/aulas">
              <Button variant="outline" className="w-full justify-start h-12 hover:bg-accent hover:text-primary hover:border-primary transition-all">
                <School className="w-5 h-5 mr-3" />
                Configurar Aulas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="bg-green-50 p-2.5 rounded-lg">
                <GraduationCap className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">12 nuevos estudiantes matriculados</p>
                <p className="text-xs text-muted-foreground mt-1">Hace 2 horas</p>
              </div>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="bg-red-50 p-2.5 rounded-lg">
                <School className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Nueva aula creada: Aula 10A</p>
                <p className="text-xs text-muted-foreground mt-1">Hace 5 horas</p>
              </div>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="bg-red-50 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Nuevo tutor contratado: Diego Torres</p>
                <p className="text-xs text-muted-foreground mt-1">Hace 1 día</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
