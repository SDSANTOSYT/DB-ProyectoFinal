import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { GraduationCap, Loader2, UserCog, Settings, School } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(45deg, #DC2626 25%, transparent 25%), linear-gradient(-45deg, #DC2626 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #DC2626 75%), linear-gradient(-45deg, transparent 75%, #DC2626 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-gray-200 relative z-10">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <div className="bg-primary p-5 rounded-2xl shadow-lg">
              <GraduationCap className="w-14 h-14 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-semibold tracking-tight">GLOBALENGLISH</CardTitle>
            <CardDescription className="text-base">
              Sistema de Gestión Educativa
            </CardDescription>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full mt-4"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@globalenglish.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'INICIAR SESIÓN'
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-muted-foreground text-center mb-4 font-medium">
              Acceso rápido para demostración:
            </p>
            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin('admin')}
                className="justify-start hover:bg-accent hover:text-primary hover:border-primary"
              >
                <UserCog className="w-4 h-4 mr-2" />
                Administrador
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin('administrativo')}
                className="justify-start hover:bg-accent hover:text-primary hover:border-primary"
              >
                <Settings className="w-4 h-4 mr-2" />
                Administrativo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin('tutor')}
                className="justify-start hover:bg-accent hover:text-primary hover:border-primary"
              >
                <School className="w-4 h-4 mr-2" />
                Tutor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
