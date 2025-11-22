import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import {
  BookOpen,
  Building2,
  Users,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Home,
  UserCog,
  School,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: <Home className="w-5 h-5" />,
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO', 'TUTOR'],
  },
  {
    label: 'Configuración',
    path: '/admin/configuracion',
    icon: <Settings className="w-5 h-5" />,
    roles: ['ADMINISTRADOR'],
  },
  {
    label: 'Gestión de Usuarios',
    path: '/admin/usuarios',
    icon: <UserCog className="w-5 h-5" />,
    roles: ['ADMINISTRADOR'],
  },
  {
    label: 'Instituciones',
    path: '/instituciones',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO'],
  },
  {
    label: 'Aulas',
    path: '/aulas',
    icon: <School className="w-5 h-5" />,
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO'],
  },
  {
    label: 'Personal',
    path: '/personal',
    icon: <Users className="w-5 h-5" />,
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO'],
  },
  {
    label: 'Estudiantes',
    path: '/estudiantes',
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO'],
  },
  {
    label: 'Asistencia y Seguimiento',
    path: '/asistencia-seguimiento',
    icon: <ClipboardCheck className="w-5 h-5" />,
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO'],
  },
  {
    label: 'Mis Aulas',
    path: '/tutor/mis-aulas',
    icon: <School className="w-5 h-5" />,
    roles: ['TUTOR'],
  },
  {
    label: 'Tomar Asistencia',
    path: '/tutor/asistencia',
    icon: <ClipboardCheck className="w-5 h-5" />,
    roles: ['TUTOR'],
  },
  {
    label: 'Ingresar Notas',
    path: '/tutor/notas',
    icon: <FileText className="w-5 h-5" />,
    roles: ['TUTOR'],
  },
  {
    label: 'Mi Horario',
    path: '/tutor/horario',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['TUTOR'],
  },
  {
    label: 'Mis Reportes',
    path: '/tutor/reportes',
    icon: <FileText className="w-5 h-5" />,
    roles: ['TUTOR'],
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.rol || '')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">GLOBALENGLISH</h1>
              <p className="text-sm text-muted-foreground">
                Sistema de Gestión Educativa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p>{user?.nombre}</p>
              <p className="text-sm text-muted-foreground">{user?.rol}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
