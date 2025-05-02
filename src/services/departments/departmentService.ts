
import { supabase } from '@/integrations/supabase/client';
import { Department } from '@/data/models';

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

export const getDepartmentById = async (id: string): Promise<Department | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data || null;
  } catch (error) {
    console.error(`Error fetching department ${id}:`, error);
    return null;
  }
};

export const createDepartment = async (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Promise<Department | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();
    
    if (error) throw error;
    
    return data || null;
  } catch (error) {
    console.error('Error creating department:', error);
    return null;
  }
};

export const updateDepartment = async (id: string, updates: Partial<Department>): Promise<Department | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data || null;
  } catch (error) {
    console.error(`Error updating department ${id}:`, error);
    return null;
  }
};

export const deleteDepartment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting department ${id}:`, error);
    return false;
  }
};

// Fonction pour assigner un département à un utilisateur
export const assignDepartmentToUser = async (userId: string, departmentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ department: departmentId })
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error assigning department to user ${userId}:`, error);
    return false;
  }
};

// Fonction pour obtenir les utilisateurs par département
export const getUsersByDepartment = async (departmentId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('department', departmentId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching users for department ${departmentId}:`, error);
    return [];
  }
};
