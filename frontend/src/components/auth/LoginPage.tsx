import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { BookOpen, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('¡Bienvenido a GLOBALENGLISH!');
    } catch (error) {
      toast.error('Credenciales inválidas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    if (role === 'admin') {
      setEmail('admin@globalenglish.com');
      setPassword('admin123');
    } else if (role === 'administrativo') {
      setEmail('admin2@globalenglish.com');
      setPassword('admin123');
    } else if (role === 'tutor') {
      setEmail('tutor@globalenglish.com');
      setPassword('tutor123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">GLOBALENGLISH</CardTitle>
          <CardDescription>
            Sistema de Gestión Educativa
            <br />
            Ingresa tus credenciales para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"

                placeholder="usuario@globalenglish.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Demo - Acceso rápido:
            </p>
            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin('admin')}
              >
                Administrador
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin('administrativo')}
              >
                Administrativo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin('tutor')}
              >
                Tutor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
