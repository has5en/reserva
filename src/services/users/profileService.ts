
import { supabase } from '@/integrations/supabase/client';

// Récupérer les infos de département pour les utilisateurs
export const getUserDepartments = async () => {
  try {
    // Get distinct departments
    const { data, error } = await supabase
      .from('profiles')
      .select('department')
      .not('department', 'is', null)
      .order('department');
    
    if (error) throw error;
    
    // Filter out duplicates and nulls
    const departments = data
      .map(item => item.department)
      .filter((dept, index, self) => dept && self.indexOf(dept) === index);
      
    return departments;
  } catch (error) {
    console.error('Error fetching user departments:', error);
    return [];
  }
};

// Mise à jour du département d'un utilisateur
export const updateUserDepartment = async (userId: string, department: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ department })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating user department:', error);
    throw error;
  }
};

// Récupérer les utilisateurs par département
export const getUsersByDepartment = async (department: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('department', department)
      .order('full_name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching users by department:', error);
    return [];
  }
};
