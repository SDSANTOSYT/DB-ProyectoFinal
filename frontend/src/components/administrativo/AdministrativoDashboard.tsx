import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Building2,
  Users,
  GraduationCap,
  School,
  ClipboardCheck,
} from 'lucide-react';
import { instituciones, aulas, estudiantes, tutores } from '../../lib/mockData';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export default function AdministrativoDashboard() {
  const stats = [
    {
      title: 'Instituciones',
      value: instituciones.length,
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      link: '/instituciones',
    },
    {
      title: 'Aulas Activas',
      value: aulas.length,
      icon: <School className="w-8 h-8 text-purple-600" />,
      link: '/aulas',
    },
    {
      title: 'Estudiantes',
      value: estudiantes.length,
      icon: <GraduationCap className="w-8 h-8 text-green-600" />,
      link: '/estudiantes',
    },
    {
      title: 'Tutores',
      value: tutores.length,
      icon: <Users className="w-8 h-8 text-orange-600" />,
      link: '/personal',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Panel Administrativo</h1>
        <p className="text-muted-foreground">
          Control y gestión de instituciones, aulas y personal
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
              <Link to={stat.link}>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Gestionar →
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Control Center - Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/instituciones">
              <Button variant="outline" className="w-full h-auto py-4 justify-start">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 mt-0.5" />
                  <div className="text-left">
                    <p>Gestión de Instituciones</p>
                    <p className="text-xs text-muted-foreground">
                      Administrar instituciones y sedes
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/aulas">
              <Button variant="outline" className="w-full h-auto py-4 justify-start">
                <div className="flex items-start gap-3">
                  <School className="w-5 h-5 mt-0.5" />
                  <div className="text-left">
                    <p>Gestión de Aulas</p>
                    <p className="text-xs text-muted-foreground">
                      Crear y configurar aulas, asignar tutores
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/personal">
              <Button variant="outline" className="w-full h-auto py-4 justify-start">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 mt-0.5" />
                  <div className="text-left">
                    <p>Gestión de Personal</p>
                    <p className="text-xs text-muted-foreground">
                      Contratar y asignar tutores
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/estudiantes">
              <Button variant="outline" className="w-full h-auto py-4 justify-start">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 mt-0.5" />
                  <div className="text-left">
                    <p>Gestión de Estudiantes</p>
                    <p className="text-xs text-muted-foreground">
                      Matricular y gestionar estudiantes
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/asistencia-seguimiento">
              <Button variant="outline" className="w-full h-auto py-4 justify-start md:col-span-2">
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="w-5 h-5 mt-0.5" />
                  <div className="text-left">
                    <p>Asistencia y Seguimiento</p>
                    <p className="text-xs text-muted-foreground">
                      Monitorear asistencia de tutores y estudiantes
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Institutions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Vista General de Instituciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {instituciones.slice(0, 3).map((inst) => {
              const sedesCount = inst.id === 'inst-1' ? 2 : inst.id === 'inst-3' ? 2 : 1;
              const aulasCount = aulas.filter((a) => {
                const sede = a.sedeId;
                return (
                  (inst.id === 'inst-1' && (sede === 'sede-1' || sede === 'sede-2')) ||
                  (inst.id === 'inst-2' && sede === 'sede-3') ||
                  (inst.id === 'inst-3' && (sede === 'sede-4' || sede === 'sede-5'))
                );
              }).length;

              return (
                <div
                  key={inst.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p>{inst.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {sedesCount} sedes • {aulasCount} aulas
                    </p>
                  </div>
                  <Link to="/instituciones">
                    <Button variant="ghost" size="sm">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
