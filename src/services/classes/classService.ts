
import { supabase } from '@/integrations/supabase/client';
import { Class } from '@/data/models';

export const getClasses = async (): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

export const getClassById = async (id: string): Promise<Class | null> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching class ${id}:`, error);
    return null;
  }
};

export const getClassesByDepartment = async (departmentId: string): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('department', departmentId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching classes for department ${departmentId}:`, error);
    return [];
  }
};

export const getClassesByTeacher = async (teacherId: string): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('teacher_classes')
      .select('classes(*)')
      .eq('teacher_id', teacherId);
    
    if (error) throw error;
    return (data || []).map(item => item.classes);
  } catch (error) {
    console.error(`Error fetching classes for teacher ${teacherId}:`, error);
    return [];
  }
};

export const getTeacherClassesForReservation = async (teacherId: string): Promise<Class[]> => {
  // This is a mock implementation
  return getClassesByTeacher(teacherId);
};

export const addClass = async (classData: Omit<Class, 'id'>): Promise<void> => {
  console.log('Adding class:', classData);
};

export const updateClass = async (id: string, classData: Partial<Class>): Promise<void> => {
  console.log(`Updating class ${id}:`, classData);
};

export const removeClass = async (id: string): Promise<void> => {
  console.log(`Removing class ${id}`);
};

export const deleteClass = async (id: string): Promise<void> => {
  console.log(`Deleting class ${id}`);
};

export const addTeacherClass = async (teacherId: string, classId: string): Promise<void> => {
  console.log(`Assigning teacher ${teacherId} to class ${classId}`);
};
