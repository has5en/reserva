
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Shield, User, Lock, Info } from 'lucide-react';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const { login, loginAttempts, resetLoginAttempts } = useAuth();
  const navigate = useNavigate();

  // Check if there's a remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle lockout countdown
  useEffect(() => {
    let timer: number;
    
    if (lockoutTime) {
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, lockoutTime - now);
        
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          clearInterval(timer);
          setLockoutTime(null);
          resetLoginAttempts();
        }
      };
      
      // Update immediately and then every second
      updateTimer();
      timer = window.setInterval(updateTimer, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutTime, resetLoginAttempts]);
  
  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    
    // Check if account is locked
    if (lockoutTime && Date.now() < lockoutTime) {
      setError(`Trop de tentatives échouées. Veuillez réessayer dans ${formatTimeRemaining(timeRemaining)}.`);
      return;
    }
    
    // Check if we need to lock the account
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      setLockoutTime(Date.now() + LOCKOUT_TIME);
      setError(`Trop de tentatives échouées. Compte temporairement verrouillé pour ${formatTimeRemaining(LOCKOUT_TIME)}.`);
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError('Impossible de se connecter. Vérifiez vos identifiants.');
      
      // If attempts are at max, lock the account
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS - 1) {
        setLockoutTime(Date.now() + LOCKOUT_TIME);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Shield className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {loginAttempts > 0 && loginAttempts < MAX_LOGIN_ATTEMPTS && !lockoutTime && (
              <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {`Tentative échouée (${loginAttempts}/${MAX_LOGIN_ATTEMPTS}). 
                  Après ${MAX_LOGIN_ATTEMPTS} tentatives, votre compte sera temporairement verrouillé.`}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="votre.email@exemple.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={!!lockoutTime}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={!!lockoutTime}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => {
                      setRememberMe(checked === true);
                    }}
                    disabled={!!lockoutTime}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Se souvenir de moi
                  </label>
                </div>
              </div>
              <Button 
                className="w-full mt-6" 
                type="submit" 
                disabled={loading || !!lockoutTime}
              >
                {loading ? 'Connexion en cours...' : 
                 lockoutTime ? `Verrouillé (${formatTimeRemaining(timeRemaining)})` : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              <p>Comptes de test:</p>
              <p>Enseignant: teacher@example.com</p>
              <p>Admin: admin@example.com</p>
              <p>Responsable: supervisor@example.com</p>
              <p>Mot de passe: password</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
