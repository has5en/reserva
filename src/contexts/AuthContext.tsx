import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { User, UserRole } from '@/data/models';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  loginAttempts: number;
  resetLoginAttempts: () => void;
  // User management functions
  getUsers: (role: UserRole) => User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Extend the User interface to include password for mock data
interface MockUser extends User {
  password: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    email: 'teacher@example.com',
    password: 'password',
    name: 'Jean Dupont',
    role: 'teacher',
    department: 'Informatique',
    unit: 'Formation',
    rank: 'Enseignant'
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'password',
    name: 'Marie Lambert',
    role: 'admin',
    department: 'Administration',
    unit: 'Direction',
    rank: 'Administrateur'
  },
  {
    id: '3',
    email: 'supervisor@example.com',
    password: 'password',
    name: 'Philippe Martin',
    role: 'supervisor',
    department: 'Sciences',
    unit: 'Supervision',
    rank: 'Superviseur'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else if (rememberedEmail) {
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    setLoading(true);
    
    try {
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        if (remember) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        setLoginAttempts(0);
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue, ${userWithoutPassword.name}!`,
        });
      } else {
        setLoginAttempts(prev => prev + 1);
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

  const resetLoginAttempts = () => {
    setLoginAttempts(0);
  };

  const getUsers = (role: UserRole): User[] => {
    return users.filter(user => user.role === role);
  };

  const addUser = (userData: Omit<User, 'id'>): void => {
    const newUser: User = {
      ...userData,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    
    if (users.some(user => user.email === userData.email)) {
      throw new Error('Email already exists');
    }
    
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>): void => {
    if (userData.email && users.some(user => user.email === userData.email && user.id !== id)) {
      throw new Error('Email already exists');
    }
    
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === id 
          ? { ...user, ...userData }
          : user
      )
    );
    
    if (currentUser && currentUser.id === id) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (id: string): void => {
    if (currentUser && currentUser.id === id) {
      throw new Error('Cannot delete current user');
    }
    
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
    hasRole,
    loginAttempts,
    resetLoginAttempts,
    getUsers,
    addUser,
    updateUser,
    deleteUser
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
