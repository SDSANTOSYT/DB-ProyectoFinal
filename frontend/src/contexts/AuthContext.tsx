import { createContext, useContext, useState, ReactNode } from 'react';
import { resolvePath } from 'react-router-dom';

type Rol = 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TUTOR';

interface User {
  nombre: string;
  correo: string;
  rol: Rol;
  id_persona: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


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
      body: JSON.stringify({ "email": email, "password": password })
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }

    const { access_token: _, token_type: __, ...userWithoutPassword } = await response.json()
    console.log(userWithoutPassword)
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
