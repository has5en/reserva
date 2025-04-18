
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/data/models';

export const getEquipment = async (): Promise<Equipment[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }
};

// Alias for backwards compatibility
export const getEquipmentList = getEquipment;

export const getEquipmentById = async (id: string): Promise<Equipment | null> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching equipment ${id}:`, error);
    return null;
  }
};

export const getEquipmentByCategory = async (category: string): Promise<Equipment[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('category', category);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching equipment by category ${category}:`, error);
    return [];
  }
};

export const getAvailableEquipment = async (): Promise<Equipment[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .gt('available', 0);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching available equipment:', error);
    return [];
  }
};

export const updateEquipment = async (equipment: Equipment): Promise<void> => {
  console.log('Updating equipment:', equipment);
};

export const addEquipment = async (equipment: Omit<Equipment, 'id'>): Promise<void> => {
  console.log('Adding equipment:', equipment);
};

export const deleteEquipment = async (id: string): Promise<void> => {
  console.log(`Deleting equipment ${id}`);
};
