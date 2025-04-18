
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/data/models';

export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        role: userData.role,
      },
    },
  });

  if (error) throw error;
  return data.user;
};

export const updateUser = async (userData: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}) => {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: userData.name, role: userData.role })
    .eq('id', userData.id);

  if (error) throw error;
};

export const deleteUser = async (userId: string) => {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
};

export const getUsers = async (role: UserRole) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role);

  if (error) throw error;
  return data;
};
