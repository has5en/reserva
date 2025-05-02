
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import DepartmentManagementTable from '@/components/DepartmentManagementTable';
import { Department } from '@/data/models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagementTableWithFilters } from '@/components/UserManagementTableWithFilters';

const DepartmentManagement = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const canManageDepartments = hasRole('admin') || hasRole('supervisor');

  const handleDepartmentChange = (newDepartments: Department[]) => {
    setDepartments(newDepartments);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!canManageDepartments) {
    return (
      <Layout title="Gestion des départements">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestion des départements">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="departments">Départements</TabsTrigger>
          <TabsTrigger value="teachers">Enseignants par département</TabsTrigger>
        </TabsList>
        
        <TabsContent value="departments">
          <DepartmentManagementTable onDepartmentChange={handleDepartmentChange} />
        </TabsContent>
        
        <TabsContent value="teachers">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-4">Enseignants par département</h2>
            <UserManagementTableWithFilters userRole="teacher" />
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default DepartmentManagement;
