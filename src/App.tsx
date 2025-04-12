
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from "./components/NotificationsProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import RoomReservation from "./pages/RoomReservation";
import EquipmentRequest from "./pages/EquipmentRequest";
import PrintingRequest from "./pages/PrintingRequest";
import RequestDetails from "./pages/RequestDetails";
import AdminDashboard from "./pages/AdminDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import ManageResources from "./pages/ManageResources";
import AvailableRooms from "./pages/AvailableRooms";
import AdminStats from "./pages/AdminStats";
import SupervisorStats from "./pages/SupervisorStats";
import UserManagement from "./pages/UserManagement";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/request/:id" element={<RequestDetails />} />
              </Route>
              
              {/* Teacher-specific routes */}
              <Route element={<ProtectedRoute allowedRoles="teacher" />}>
                <Route path="/available-rooms" element={<AvailableRooms />} />
                <Route path="/room-reservation" element={<RoomReservation />} />
                <Route path="/equipment-request" element={<EquipmentRequest />} />
                <Route path="/printing-request" element={<PrintingRequest />} />
              </Route>
              
              {/* Admin-specific routes */}
              <Route element={<ProtectedRoute allowedRoles="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin-stats" element={<AdminStats />} />
              </Route>
              
              {/* Supervisor-specific routes */}
              <Route element={<ProtectedRoute allowedRoles="supervisor" />}>
                <Route path="/supervisor" element={<SupervisorDashboard />} />
                <Route path="/supervisor-stats" element={<SupervisorStats />} />
              </Route>
              
              {/* Admin and supervisor shared routes */}
              <Route element={<ProtectedRoute allowedRoles="admin,supervisor" />}>
                <Route path="/manage-resources" element={<ManageResources />} />
                <Route path="/user-management" element={<UserManagement />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
