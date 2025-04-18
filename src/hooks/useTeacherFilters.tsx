
import { useState, useCallback } from 'react';
import { getTeachersByDepartment, getTeachersByClass } from '@/services/dataService';

export const useTeacherFilters = () => {
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filterByDepartment = useCallback(async (departmentId: string) => {
    try {
      setIsLoading(true);
      const teachers = await getTeachersByDepartment(departmentId);
      setFilteredTeachers(teachers);
    } catch (error) {
      console.error('Error filtering teachers by department:', error);
      setFilteredTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterByClass = useCallback(async (classId: string) => {
    try {
      setIsLoading(true);
      const teachers = await getTeachersByClass(classId);
      setFilteredTeachers(teachers);
    } catch (error) {
      console.error('Error filtering teachers by class:', error);
      setFilteredTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setFilteredTeachers([]);
  }, []);

  return {
    filteredTeachers,
    isLoading,
    filterByDepartment,
    filterByClass,
    clearFilters
  };
};
