import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Download, TrendingUp, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAulasByTutor,
  getSedeById,
  getInstitucionById,
  getEstudiantesByAula,
} from '../../lib/mockData';

export default function MisReportes() {
  const { user } = useAuth();
  const misAulas = getAulasByTutor(user?.id || '');

  // Mock data for reports
  const asistenciaData = {
    clasesPlaneadas: 48,
    clasesDictadas: 45,
    porcentaje: 93.8,
  };

  const notasData = {
    estudiantesTotal: misAulas.reduce(
      (acc, aula) => acc + getEstudiantesByAula(aula.id).length,
      0
    ),
    notasIngresadas: 120,
    notasPendientes: 60,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Mis Reportes</h1>
        <p className="text-muted-foreground">
          Autogestión de asistencia y progreso académico
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Asistencia</CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">{asistenciaData.porcentaje}%</div>
            <p className="text-xs text-muted-foreground">
              {asistenciaData.clasesDictadas} de {asistenciaData.clasesPlaneadas}{' '}
              clases dictadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Notas Ingresadas</CardTitle>
            <FileText className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">{notasData.notasIngresadas}</div>
            <p className="text-xs text-muted-foreground">
              {notasData.notasPendientes} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Promedio General</CardTitle>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">72.5</div>
            <p className="text-xs text-muted-foreground">
              Promedio de todas las aulas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registro de Asistencia</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Descargar Reporte
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p>Clases Dictadas</p>
                <p className="text-sm text-muted-foreground">
                  Últimos 30 días
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl">{asistenciaData.clasesDictadas}</p>
                <Badge className="bg-green-500">
                  {asistenciaData.porcentaje}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p>Clases No Dictadas</p>
                <p className="text-sm text-muted-foreground">
                  Requieren reposición
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl">
                  {asistenciaData.clasesPlaneadas -
                    asistenciaData.clasesDictadas}
                </p>
                <Badge variant="outline">Pendiente</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Progress by Classroom */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Notas por Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {misAulas.map((aula) => {
              const sede = getSedeById(aula.sedeId);
              const institucion = sede
                ? getInstitucionById(sede.institucionId)
                : null;
              const estudiantes = getEstudiantesByAula(aula.id);
              const totalNotas = estudiantes.length * 4; // 4 components
              const notasIngresadas = Math.floor(Math.random() * totalNotas);
              const porcentaje = ((notasIngresadas / totalNotas) * 100).toFixed(0);

              return (
                <div key={aula.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
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
                      Grado {aula.grado}°
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Notas Ingresadas</span>
                      <span>
                        {notasIngresadas} / {totalNotas} ({porcentaje}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="h-auto py-4 justify-start">
              <div className="text-left">
                <p>Reporte de Asistencia Completo</p>
                <p className="text-xs text-muted-foreground">
                  Excel con todas mis clases del mes
                </p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start">
              <div className="text-left">
                <p>Reporte de Notas por Aula</p>
                <p className="text-xs text-muted-foreground">
                  PDF con calificaciones ingresadas
                </p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start">
              <div className="text-left">
                <p>Resumen Mensual</p>
                <p className="text-xs text-muted-foreground">
                  PDF con estadísticas del mes
                </p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start">
              <div className="text-left">
                <p>Reporte de Reposiciones</p>
                <p className="text-xs text-muted-foreground">
                  Clases pendientes por reponer
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
