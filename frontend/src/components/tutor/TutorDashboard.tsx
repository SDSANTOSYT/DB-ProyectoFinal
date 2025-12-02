import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { School, ClipboardCheck, FileText, Calendar, Clock } from 'lucide-react';
import { getSedeById, getInstitucionById, getEstudiantesByAula } from '../../lib/mockData';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import type { Aula, User } from '../../lib/types';


export default function TutorDashboard() {
  const { user } = useAuth();

  const { aulas, setAulas } = useState<Aula[]>([]);

  // Get tutor's classrooms
  const tutorAulas = async (user: User | null): Promise<Aula[]> => {
    let url = `http://127.0.0.1:8000/tutores/by-persona/${user.id_persona}`

    let response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.log(response.statusText)
      return []
    }


    let data = await response.json()
    if (!data.id_tutor) {
      return []
    }

    url = `http://127.0.0.1:8000/tutores/${data.id_tutor}/aulas`

    response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.log(response.statusText)
      return []
    }

    const aulasData = await response.json()
    return aulasData
  }

  useEffect(() => {
    const obtenerAulas = async () => {
      const data = await tutorAulas(user)
      setAulas(data)
    }
    obtenerAulas()
  }, [])

  // Get today's classes
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const todayClasses = 0
  /*const todayClasses = tutorAulas.filter((aula) =>
    aula.horarios.some((h) => h.diaSemana === todayCapitalized)
  );*/

  const totalStudents = 0
  /*const totalStudents = tutorAulas.reduce((acc, aula) => {
    return acc + getEstudiantesByAula(aula.id).length;
  }, 0);*/

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground">
        <span>Inicio</span>
        <span className="mx-2 text-primary">/</span>
        <span className="text-foreground font-medium">Mi Panel</span>
      </div>

      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-4xl font-semibold mb-2 text-foreground">¡Hola, {user?.nombre}!</h1>
        <p className="text-muted-foreground text-lg">
          Aquí está tu resumen del día
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-gray-200 hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Mis Aulas</CardTitle>
            <div className="bg-red-50 p-2.5 rounded-lg">
              <School className="w-6 h-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2 text-foreground">{tutorAulas.length}</div>
            <Link to="/tutor/mis-aulas">
              <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary-hover font-medium">
                Ver todas →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Estudiantes</CardTitle>
            <div className="bg-green-50 p-2.5 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2 text-foreground">{totalStudents}</div>
            <p className="text-sm text-muted-foreground">Total en todas tus aulas</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Clases Hoy</CardTitle>
            <div className="bg-red-50 p-2.5 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2 text-foreground">{todayClasses.length}</div>
            <Link to="/tutor/horario">
              <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary-hover font-medium">
                Ver horario →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Today's Classes */}
      {todayClasses > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Clases de Hoy - {todayCapitalized}</CardTitle>
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
                  className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gradient-to-r from-white to-red-50 hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-foreground">{aula.nombre}</p>
                      <Badge
                        variant="default"
                        className="bg-primary"
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
                      <p key={schedule.id} className="text-sm mt-1 font-medium text-primary">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {schedule.horaInicio} - {schedule.horaFin}
                      </p>
                    ))}
                  </div>
                  <Link to="/tutor/asistencia">
                    <Button className="shadow-md">Tomar Asistencia</Button>
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/tutor/asistencia">
              <Button variant="outline" className="w-full h-auto py-5 justify-start hover:bg-accent hover:text-primary hover:border-primary transition-all">
                <div className="flex items-start gap-4">
                  <ClipboardCheck className="w-6 h-6 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold">Tomar Asistencia</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registrar asistencia de estudiantes
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/tutor/notas">
              <Button variant="outline" className="w-full h-auto py-5 justify-start hover:bg-accent hover:text-primary hover:border-primary transition-all">
                <div className="flex items-start gap-4">
                  <FileText className="w-6 h-6 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold">Ingresar Notas</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Calificar estudiantes por periodo
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/tutor/horario">
              <Button variant="outline" className="w-full h-auto py-5 justify-start hover:bg-accent hover:text-primary hover:border-primary transition-all">
                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold">Mi Horario</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ver calendario semanal de clases
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/tutor/reportes">
              <Button variant="outline" className="w-full h-auto py-5 justify-start hover:bg-accent hover:text-primary hover:border-primary transition-all">
                <div className="flex items-start gap-4">
                  <FileText className="w-6 h-6 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold">Mis Reportes</p>
                    <p className="text-xs text-muted-foreground mt-1">
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
            {/*aulas.map((aula : Aula) => {
              const sede = aula.id_sede;
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
            })*/}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
