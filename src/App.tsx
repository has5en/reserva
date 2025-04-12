
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
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/available-rooms" element={
                <ProtectedRoute requiredRole="teacher">
                  <AvailableRooms />
                </ProtectedRoute>
              } />
              <Route path="/room-reservation" element={
                <ProtectedRoute requiredRole="teacher">
                  <RoomReservation />
                </ProtectedRoute>
              } />
              <Route path="/equipment-request" element={
                <ProtectedRoute requiredRole="teacher">
                  <EquipmentRequest />
                </ProtectedRoute>
              } />
              <Route path="/printing-request" element={
                <ProtectedRoute requiredRole="teacher">
                  <PrintingRequest />
                </ProtectedRoute>
              } />
              <Route path="/request/:id" element={
                <ProtectedRoute>
                  <RequestDetails />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin-stats" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminStats />
                </ProtectedRoute>
              } />
              <Route path="/supervisor" element={
                <ProtectedRoute requiredRole="supervisor">
                  <SupervisorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/supervisor-stats" element={
                <ProtectedRoute requiredRole="supervisor">
                  <SupervisorStats />
                </ProtectedRoute>
              } />
              <Route path="/manage-resources" element={
                <ProtectedRoute requiredRole="admin,supervisor">
                  <ManageResources />
                </ProtectedRoute>
              } />
              <Route path="/user-management" element={
                <ProtectedRoute requiredRole="admin,supervisor">
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
