import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdministrativoDashboard from './components/administrativo/AdministrativoDashboard';
import TutorDashboard from './components/tutor/TutorDashboard';
import GestionInstituciones from './components/administrativo/GestionInstituciones';
import GestionAulas from './components/administrativo/GestionAulas';
import GestionPersonal from './components/administrativo/GestionPersonal';
import GestionEstudiantes from './components/administrativo/GestionEstudiantes';
import AsistenciaSeguimiento from './components/administrativo/AsistenciaSeguimiento';
import MisAulas from './components/tutor/MisAulas';
import TomarAsistencia from './components/tutor/TomarAsistencia';
import IngresarNotas from './components/tutor/IngresarNotas';
import MiHorario from './components/tutor/MiHorario';
import MisReportes from './components/tutor/MisReportes';
import ConfiguracionSistema from './components/admin/ConfiguracionSistema';
import GestionUsuarios from './components/admin/GestionUsuarios';
import { Toaster } from './components/ui/sonner';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        {/* Administrador */}
        <Route
          path="/"
          element={
            user.rol === 'ADMINISTRADOR' ? (
              <AdminDashboard />
            ) : user.rol === 'ADMINISTRATIVO' ? (
              <AdministrativoDashboard />
            ) : (
              <TutorDashboard />
            )
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin/configuracion"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <ConfiguracionSistema />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <GestionUsuarios />
            </ProtectedRoute>
          }
        />

        {/* Administrativo Routes */}
        <Route
          path="/instituciones"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMINISTRATIVO']}>
              <GestionInstituciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aulas"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMINISTRATIVO']}>
              <GestionAulas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/personal"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMINISTRATIVO']}>
              <GestionPersonal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estudiantes"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMINISTRATIVO']}>
              <GestionEstudiantes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/asistencia-seguimiento"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMINISTRATIVO']}>
              <AsistenciaSeguimiento />
            </ProtectedRoute>
          }
        />

        {/* Tutor Routes */}
        <Route
          path="/tutor/mis-aulas"
          element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <MisAulas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/asistencia"
          element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <TomarAsistencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/notas"
          element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <IngresarNotas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/horario"
          element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <MiHorario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/reportes"
          element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <MisReportes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </Router>
  );
}
