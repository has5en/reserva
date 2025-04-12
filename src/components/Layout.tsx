
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/components/NotificationsProvider';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import { 
  Building2, 
  Calendar, 
  ClipboardList, 
  LogOut, 
  Package, 
  Settings, 
  User,
  Printer,
  BarChart2,
  Users,
  Warehouse
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const { currentUser, logout, hasRole } = useAuth();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const isTeacherOnly = hasRole('teacher') && !hasRole('admin') && !hasRole('supervisor');

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-primary h-full p-4 text-white">
        <div className="flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-xl font-bold">Salle Smart Reserva</h1>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/dashboard" 
                  className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                >
                  <ClipboardList className="mr-2 h-5 w-5" />
                  <span>Tableau de bord</span>
                </Link>
              </li>
              
              {isTeacherOnly && (
                <>
                  <li>
                    <Link 
                      to="/available-rooms" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <Building2 className="mr-2 h-5 w-5" />
                      <span>Salles disponibles</span>
                    </Link>
                  </li>
                  
                  <li>
                    <Link 
                      to="/room-reservation" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>Réserver une salle</span>
                    </Link>
                  </li>
                  
                  <li>
                    <Link 
                      to="/equipment-request" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <Package className="mr-2 h-5 w-5" />
                      <span>Demander du matériel</span>
                    </Link>
                  </li>
                  
                  <li>
                    <Link 
                      to="/printing-request" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <Printer className="mr-2 h-5 w-5" />
                      <span>Demande d'impression</span>
                    </Link>
                  </li>
                </>
              )}
              
              {hasRole('admin') && (
                <>
                  <li>
                    <Link 
                      to="/admin" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>Validation des demandes</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin-stats" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <BarChart2 className="mr-2 h-5 w-5" />
                      <span>Statistiques</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/manage-resources" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <Warehouse className="mr-2 h-5 w-5" />
                      <span>Gestion des ressources</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/user-management" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      <span>Gestion des utilisateurs</span>
                    </Link>
                  </li>
                </>
              )}
              
              {hasRole('supervisor') && (
                <>
                  <li>
                    <Link 
                      to="/supervisor" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>Approbation finale</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/supervisor-stats" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <BarChart2 className="mr-2 h-5 w-5" />
                      <span>Statistiques</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/manage-resources" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <Warehouse className="mr-2 h-5 w-5" />
                      <span>Gestion des ressources</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/user-management" 
                      className="flex items-center p-2 rounded-md hover:bg-primary-foreground hover:text-primary transition"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      <span>Gestion des utilisateurs</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
          
          <div className="mt-auto">
            <Separator className="my-4 bg-white/20" />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-primary-foreground text-primary">
                    {currentUser?.name ? getInitials(currentUser.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{currentUser?.name}</p>
                  <p className="text-xs opacity-70">{currentUser?.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex items-center">
            <NotificationsDropdown
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClearAll={clearAll}
            />
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
