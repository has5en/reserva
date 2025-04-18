
import { supabase } from '@/integrations/supabase/client';

export const getUsersByRole = async (role: "admin" | "supervisor" | "teacher") => {
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
