
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagementTable from '@/components/UserManagementTable';
import { toast } from '@/components/ui/use-toast';

const UserManagement = () => {
  const { currentUser, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('teachers');

  // Determine which tabs to show based on user role
  const showTeachersTab = hasRole('admin') || hasRole('supervisor');
  const showAdminsTab = hasRole('supervisor');

  useEffect(() => {
    // Set default active tab
    if (showTeachersTab) {
      setActiveTab('teachers');
    } else if (showAdminsTab) {
      setActiveTab('admins');
    }
  }, [showTeachersTab, showAdminsTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!showTeachersTab && !showAdminsTab) {
    return (
      <Layout title="Gestion des utilisateurs">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestion des utilisateurs">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          {showTeachersTab && <TabsTrigger value="teachers">Enseignants</TabsTrigger>}
          {showAdminsTab && <TabsTrigger value="admins">Administrateurs</TabsTrigger>}
        </TabsList>
        
        {showTeachersTab && (
          <TabsContent value="teachers">
            <UserManagementTable userRole="teacher" />
          </TabsContent>
        )}
        
        {showAdminsTab && (
          <TabsContent value="admins">
            <UserManagementTable userRole="admin" />
          </TabsContent>
        )}
      </Tabs>
    </Layout>
  );
};

export default UserManagement;
