import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { School, ClipboardCheck, FileText, Calendar, Clock } from 'lucide-react';
import { aulas, getSedeById, getInstitucionById, getEstudiantesByAula } from '../../lib/mockData';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';

export default function TutorDashboard() {
  const { user } = useAuth();
  
  // Get tutor's classrooms
  const tutorAulas = aulas.filter((a) => a.tutorId === user?.id);

  // Get today's classes
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
  
  const todayClasses = tutorAulas.filter((aula) =>
    aula.horarios.some((h) => h.diaSemana === todayCapitalized)
  );

  const totalStudents = tutorAulas.reduce((acc, aula) => {
    return acc + getEstudiantesByAula(aula.id).length;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">¡Hola, {user?.nombre}!</h1>
        <p className="text-muted-foreground">
          Aquí está tu resumen del día
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Mis Aulas</CardTitle>
            <School className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">{tutorAulas.length}</div>
            <Link to="/tutor/mis-aulas">
              <Button variant="link" size="sm" className="p-0 h-auto">
                Ver todas →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Estudiantes</CardTitle>
            <ClipboardCheck className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Total en todas tus aulas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Clases Hoy</CardTitle>
            <Clock className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">{todayClasses.length}</div>
            <Link to="/tutor/horario">
              <Button variant="link" size="sm" className="p-0 h-auto">
                Ver horario →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Today's Classes */}
      {todayClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clases de Hoy - {todayCapitalized}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayClasses.map((aula) => {
              const sede = getSedeById(aula.sedeId);
              const institucion = sede ? getInstitucionById(sede.institucionId) : null;
              const todaySchedules = aula.horarios.filter(
                (h) => h.diaSemana === todayCapitalized
              );
              const estudiantesCount = getEstudiantesByAula(aula.id).length;

              return (
                <div
                  key={aula.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p>{aula.nombre}</p>
                      <Badge
                        variant={
                          aula.programa === 'INSIDECLASSROOM'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        Grado {aula.grado}°
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {institucion?.nombre} - {sede?.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {estudiantesCount} estudiantes
                    </p>
                    {todaySchedules.map((schedule) => (
                      <p key={schedule.id} className="text-sm mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {schedule.horaInicio} - {schedule.horaFin}
                      </p>
                    ))}
                  </div>
                  <Link to="/tutor/asistencia">
                    <Button>Tomar Asistencia</Button>
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Link to="/tutor/asistencia">
              <Button variant="outline" className="w-full h-auto py-4 justify-start">
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="w-5 h-5 mt-0.5" />
                  <div className="text-left">
                    <p>Tomar Asistencia</p>
                    <p className="text-xs text-muted-foreground">
                      Registrar asistencia de estudiantes
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/tutor/notas">
              <Button variant="outline" className="w-full h-auto py-4 justify-start">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-0.5" />
                  <div className="text-left">
                    <p>Ingresar Notas</p>
                    <p className="text-xs text-muted-foreground">
                      Calificar estudiantes por periodo
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/tutor/horario">
              <Button variant="outline" className="w-full h-auto py-4 justify-start">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-0.5" />
                  <div className="text-left">
                    <p>Mi Horario</p>
                    <p className="text-xs text-muted-foreground">
                      Ver calendario semanal de clases
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/tutor/reportes">
              <Button variant="outline" className="w-full h-auto py-4 justify-start">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-0.5" />
                  <div className="text-left">
                    <p>Mis Reportes</p>
                    <p className="text-xs text-muted-foreground">
                      Ver progreso y estadísticas
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* My Classrooms Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Aulas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {tutorAulas.map((aula) => {
              const sede = getSedeById(aula.sedeId);
              const institucion = sede ? getInstitucionById(sede.institucionId) : null;
              const estudiantesCount = getEstudiantesByAula(aula.id).length;

              return (
                <div
                  key={aula.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p>{aula.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {institucion?.nombre}
                      </p>
                    </div>
                    <Badge
                      variant={
                        aula.programa === 'INSIDECLASSROOM'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {aula.programa === 'INSIDECLASSROOM'
                        ? 'Inside'
                        : 'Outside'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <p>Grado {aula.grado}°</p>
                    <p>{estudiantesCount} estudiantes</p>
                    <p>{aula.horarios.length} sesiones por semana</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/tutor/asistencia" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Asistencia
                      </Button>
                    </Link>
                    <Link to="/tutor/notas" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Notas
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
