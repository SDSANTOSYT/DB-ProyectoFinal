import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ClipboardCheck, FileText, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAulasByTutor,
  getSedeById,
  getInstitucionById,
  getEstudiantesByAula,
} from '../../lib/mockData';

export default function MisAulas() {
  const { user } = useAuth();
  const misAulas = getAulasByTutor(user?.id || '');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Mis Aulas</h1>
        <p className="text-muted-foreground">
          Vista detallada de todas las aulas asignadas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {misAulas.map((aula) => {
          const sede = getSedeById(aula.sedeId);
          const institucion = sede ? getInstitucionById(sede.institucionId) : null;
          const estudiantes = getEstudiantesByAula(aula.id);

          return (
            <Card key={aula.id} className="overflow-hidden">
              <div
                className={`h-2 ${
                  aula.programa === 'INSIDECLASSROOM'
                    ? 'bg-gradient-to-r from-blue-400 to-cyan-400'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
              />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{aula.nombre}</CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {institucion?.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground">{sede?.nombre}</p>
                  </div>
                  <Badge
                    variant={
                      aula.programa === 'INSIDECLASSROOM' ? 'default' : 'secondary'
                    }
                  >
                    Grado {aula.grado}°
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Schedule */}
                <div>
                  <p className="text-sm mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horario de Clases
                  </p>
                  <div className="space-y-1">
                    {aula.horarios.map((horario) => (
                      <div
                        key={horario.id}
                        className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <span>{horario.diaSemana}</span>
                        <span className="text-muted-foreground">
                          {horario.horaInicio} - {horario.horaFin}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Students */}
                <div>
                  <p className="text-sm mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Estudiantes ({estudiantes.length})
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {estudiantes.slice(0, 10).map((estudiante) => {
                      const initials = estudiante.nombre
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);
                      return (
                        <Avatar key={estudiante.id} className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      );
                    })}
                    {estudiantes.length > 10 && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          +{estudiantes.length - 10}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/tutor/asistencia">
                    <Button variant="outline" size="sm" className="w-full">
                      <ClipboardCheck className="w-4 h-4 mr-2" />
                      Asistencia
                    </Button>
                  </Link>
                  <Link to="/tutor/notas">
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Notas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {misAulas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tienes aulas asignadas actualmente</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
