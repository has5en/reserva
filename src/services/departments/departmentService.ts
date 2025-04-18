
import { supabase } from '@/integrations/supabase/client';
import { Department } from '@/data/models';

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

export const addDepartment = async (department: { name: string; description?: string }): Promise<Department | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding department:', error);
    throw error;
  }
};

export const updateDepartment = async (department: Partial<Department> & { id: string }): Promise<Department | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .update(department)
      .eq('id', department.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};
