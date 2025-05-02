
import { useState, useEffect } from 'react';
import UserManagementTable from './UserManagementTable';
import { TeacherDepartmentSelector } from './TeacherDepartmentSelector';
import { getUsersByDepartment } from '@/services/users/profileService';

interface UserManagementTableWithFiltersProps {
  userRole: 'admin' | 'teacher' | 'supervisor';
  department?: string; // Added department property as optional
}

export const UserManagementTableWithFilters = ({ userRole, department }: UserManagementTableWithFiltersProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>(department || '');
  
  // Update selectedDepartment if department prop changes
  useEffect(() => {
    if (department) {
      setSelectedDepartment(department);
    }
  }, [department]);
  
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
  };
  
  return (
    <div className="space-y-4">
      {userRole === 'teacher' && (
        <div className="max-w-xs">
          <TeacherDepartmentSelector 
            onChange={handleDepartmentChange} 
            label="Filtrer par département" 
            defaultValue={selectedDepartment}
          />
        </div>
      )}
      <UserManagementTable userRole={userRole} department={selectedDepartment} />
    </div>
  );
};

export default UserManagementTableWithFilters;
