import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAulasByTutor,
  getSedeById,
  getInstitucionById,
} from '../../lib/mockData';

import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createViewWeek } from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill';

export default function MiHorario() {
  const { user } = useAuth();
  const misAulas = getAulasByTutor(user?.id || '');

  // Build schedule map
  const scheduleMap: Record<
    string,
    Array<{
      aula: string;
      horario: string;
      institucion: string;
      sede: string;
      programa: string;
      grado: string;
    }>
  > = {};

  misAulas.forEach((aula) => {
    const sede = getSedeById(aula.sedeId);
    const institucion = sede ? getInstitucionById(sede.institucionId) : null;

    aula.horarios.forEach((horario) => {
      const key = `${horario.diaSemana}-${horario.horaInicio}`;
      if (!scheduleMap[key]) {
        scheduleMap[key] = [];
      }
      scheduleMap[key].push({
        aula: aula.nombre,
        horario: `${horario.horaInicio} - ${horario.horaFin}`,
        institucion: institucion?.nombre || '',
        sede: sede?.nombre || '',
        programa: aula.programa,
        grado: aula.grado,
      });
    });
  });

  // Get total hours per week
  const totalClases = misAulas.reduce((acc, aula) => {
    return acc + aula.horarios.length;
  }, 0);


  const calendar = useCalendarApp({
    views: [createViewWeek()],
    events: [],
    weekOptions: {
      gridHeight: 1200,
    },
    dayBoundaries: {
      start: "05:00",
      end: "21:00"
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Mi Horario</h1>
        <p className="text-muted-foreground">
          Calendario semanal de clases asignadas
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Aulas Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{misAulas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Clases por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{totalClases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Horas Semanales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{totalClases * 1.5}</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="scale-90 origin-top-left">
            <ScheduleXCalendar calendarApp={calendar} />
          </div>
        </CardContent>
      </Card>

      {/* List View */}
      <Card>
        <CardHeader>
          <CardTitle>Vista de Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {misAulas.map((aula) => {
              const sede = getSedeById(aula.sedeId);
              const institucion = sede
                ? getInstitucionById(sede.institucionId)
                : null;

              return (
                <div
                  key={aula.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p>{aula.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {institucion?.nombre} - {sede?.nombre}
                      </p>
                    </div>
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
                  <div className="grid gap-2 md:grid-cols-2">
                    {aula.horarios.map((horario) => (
                      <div
                        key={horario.id}
                        className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{horario.diaSemana}</span>
                        <span className="text-muted-foreground">
                          {horario.horaInicio} - {horario.horaFin}
                        </span>
                      </div>
                    ))}
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
