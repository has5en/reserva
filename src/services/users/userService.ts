
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/contexts/AuthContext';

export const getUsers = async (role?: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role || 'user');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUserById = async (id: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
};

export const getTeachers = async (): Promise<any[]> => {
  return getUsers('teacher');
};

export const getTeachersByDepartment = async (departmentId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .eq('department', departmentId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching teachers for department ${departmentId}:`, error);
    return [];
  }
};

export const getTeachersByClass = async (classId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('teacher_classes')
      .select('profiles(*)')
      .eq('class_id', classId);
    
    if (error) throw error;
    return (data || []).map(item => item.profiles);
  } catch (error) {
    console.error(`Error fetching teachers for class ${classId}:`, error);
    return [];
  }
};

export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: string;
}): Promise<void> => {
  console.log('Creating user:', userData);
};

export const updateUser = async (userData: {
  id: string;
  email: string;
  name: string;
  role: string;
}): Promise<void> => {
  console.log('Updating user:', userData);
};

export const deleteUser = async (id: string): Promise<void> => {
  console.log('Deleting user:', id);
};
