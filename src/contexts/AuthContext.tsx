import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export type UserRole = 'admin' | 'supervisor' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
}

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
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else if (rememberedEmail) {
      // If email is remembered but not logged in, we don't set the user
      // but we could pre-fill the email field in the login form
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    setLoading(true);
    
    try {
      // Mock authentication
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        // Handle remember me functionality
        if (remember) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Reset login attempts on successful login
        setLoginAttempts(0);
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue, ${userWithoutPassword.name}!`,
        });
      } else {
        // Increment login attempts
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
    // We don't remove rememberedEmail on logout
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

  // User management functions
  const getUsers = (role: UserRole): User[] => {
    return users.filter(user => user.role === role);
  };

  const addUser = (userData: Omit<User, 'id'>): void => {
    const newUser: User = {
      ...userData,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    
    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
      throw new Error('Email already exists');
    }
    
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>): void => {
    // Check if email already exists and it's not the current user's email
    if (userData.email && users.some(user => user.email === userData.email && user.id !== id)) {
      throw new Error('Email already exists');
    }
    
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === id 
          ? { ...user, ...userData, password: userData.password || user.password }
          : user
      )
    );
    
    // If the updated user is the current user, update the current user and localStorage
    if (currentUser && currentUser.id === id) {
      const updatedUser = { ...currentUser, ...userData };
      const { password: _, ...userWithoutPassword } = updatedUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    }
  };

  const deleteUser = (id: string): void => {
    // Prevent deleting the current user
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
    // User management functions
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
