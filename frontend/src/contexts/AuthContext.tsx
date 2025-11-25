import { createContext, useContext, useState, ReactNode } from 'react';

type Rol = 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TUTOR';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  documento: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users para demostración
const mockUsers: Record<string, User & { password: string }> = {
  'admin@globalenglish.com': {
    id: '1',
    nombre: 'Admin Principal',
    email: 'admin@globalenglish.com',
    rol: 'ADMINISTRADOR',
    documento: '1234567890',
    password: 'admin123',
  },
  'admin2@globalenglish.com': {
    id: '2',
    nombre: 'María González',
    email: 'admin2@globalenglish.com',
    rol: 'ADMINISTRATIVO',
    documento: '0987654321',
    password: 'admin123',
  },
  'tutor@globalenglish.com': {
    id: '3',
    nombre: 'Carlos Rodríguez',
    email: 'tutor@globalenglish.com',
    rol: 'TUTOR',
    documento: '1122334455',
    password: 'tutor123',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('globalenglish_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    const url = `http://127.0.0.1:8000/auth/login`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "username": email, "password": password })
    });

    const mockUser = mockUsers[email];
    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }

    const { password: _, ...userWithoutPassword } = mockUser;
    setUser(userWithoutPassword);
    localStorage.setItem('globalenglish_user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('globalenglish_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
