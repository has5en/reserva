
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export type UserRole = 'teacher' | 'admin' | 'supervisor' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  classes?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    email: 'teacher@example.com',
    password: 'password',
    name: 'Jean Dupont',
    role: 'teacher' as UserRole,
    department: 'Informatique',
    classes: ['3A', '4B']
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'password',
    name: 'Marie Lambert',
    role: 'admin' as UserRole
  },
  {
    id: '3',
    email: 'supervisor@example.com',
    password: 'password',
    name: 'Philippe Martin',
    role: 'supervisor' as UserRole,
    department: 'Sciences'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Mock authentication
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        toast({
          title: "Connexion réussie",
          description: `Bienvenue, ${userWithoutPassword.name}!`,
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt!",
    });
  };

  const hasRole = (role: UserRole): boolean => {
    return currentUser?.role === role;
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
