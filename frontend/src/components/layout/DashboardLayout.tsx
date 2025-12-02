import type { ReactNode } from 'react';
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
  Database,
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
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO'],
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
    label: 'Seguimiento y Reportes',
    path: '/asistencia-seguimiento',
    icon: <Database className="w-5 h-5" />,
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
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO', 'TUTOR'],
  },
  {
    label: 'Ingresar Notas',
    path: '/tutor/notas',
    icon: <FileText className="w-5 h-5" />,
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO', 'TUTOR'],
  },
  {
    label: 'Mi Horario',
    path: '/tutor/horario',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO', 'TUTOR'],
  },
  {
    label: 'Mis Reportes',
    path: '/tutor/reportes',
    icon: <FileText className="w-5 h-5" />,
    roles: ['ADMINISTRADOR', 'ADMINISTRATIVO', 'TUTOR'],
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.rol || '')
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Institutional Red Band */}
      <header className="bg-primary sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">GLOBALENGLISH</h1>
              <p className="text-sm text-white/90">
                Sistema de Gestión Educativa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <p className="text-white font-medium">{user?.nombre}</p>
              <p className="text-xs text-white/80">{user?.rol}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-white hover:bg-white/10 border-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Elegant Navigation */}
        <aside className="w-72 bg-gray-50 border-r border-gray-200 min-h-[calc(100vh-80px)] sticky top-[80px]">
          <nav className="p-4 space-y-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Panel Principal
            </div>
            {filteredNavItems.slice(0, 1).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start h-11 ${
                      isActive 
                        ? 'bg-primary text-white hover:bg-primary-hover shadow-sm' 
                        : 'hover:bg-accent hover:text-primary'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {filteredNavItems.some((item) => 
              ['Configuración', 'Gestión de Usuarios', 'Instituciones', 'Aulas', 'Personal', 'Estudiantes', 'Seguimiento y Reportes'].includes(item.label)
            ) && (
              <>
                <div className="h-px bg-gray-200 my-3"></div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Gestión
                </div>
                {filteredNavItems.filter((item) => 
                  ['Configuración', 'Gestión de Usuarios', 'Instituciones', 'Aulas', 'Personal', 'Estudiantes', 'Seguimiento y Reportes'].includes(item.label)
                ).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={`w-full justify-start h-11 ${
                          isActive 
                            ? 'bg-primary text-white hover:bg-primary-hover shadow-sm' 
                            : 'hover:bg-accent hover:text-primary'
                        }`}
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </>
            )}

            {filteredNavItems.some((item) => 
              ['Mis Aulas', 'Tomar Asistencia', 'Ingresar Notas', 'Mi Horario', 'Mis Reportes'].includes(item.label)
            ) && (
              <>
                <div className="h-px bg-gray-200 my-3"></div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Académico
                </div>
                {filteredNavItems.filter((item) => 
                  ['Mis Aulas', 'Tomar Asistencia', 'Ingresar Notas', 'Mi Horario', 'Mis Reportes'].includes(item.label)
                ).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={`w-full justify-start h-11 ${
                          isActive 
                            ? 'bg-primary text-white hover:bg-primary-hover shadow-sm' 
                            : 'hover:bg-accent hover:text-primary'
                        }`}
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-background">{children}</main>
      </div>
    </div>
  );
}
