import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/data/models';

export const getUsersByRole = async (role: UserRole) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching users with role ${role}:`, error);
    return [];
  }
};
