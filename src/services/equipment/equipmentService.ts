
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/data/models';

export const getEquipment = async (): Promise<Equipment[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*');
    
    if (error) throw error;
    
    // Transform the data to match the Equipment interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      available: item.available_quantity,
      requires_clearance: item.requires_clearance,
      description: item.description,
      location: item.location,
      totalQuantity: item.total_quantity,
      availableQuantity: item.available_quantity
    }));
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
    
    if (!data) return null;
    
    // Transform the data to match the Equipment interface
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      available: data.available_quantity,
      requires_clearance: data.requires_clearance,
      description: data.description,
      location: data.location,
      totalQuantity: data.total_quantity,
      availableQuantity: data.available_quantity
    };
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
    
    // Transform the data to match the Equipment interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      available: item.available_quantity,
      requires_clearance: item.requires_clearance,
      description: item.description,
      location: item.location,
      totalQuantity: item.total_quantity,
      availableQuantity: item.available_quantity
    }));
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
      .gt('available_quantity', 0);
    
    if (error) throw error;
    
    // Transform the data to match the Equipment interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      available: item.available_quantity,
      requires_clearance: item.requires_clearance,
      description: item.description,
      location: item.location,
      totalQuantity: item.total_quantity,
      availableQuantity: item.available_quantity
    }));
  } catch (error) {
    console.error('Error fetching available equipment:', error);
    return [];
  }
};

export const updateEquipment = async (equipment: Equipment): Promise<void> => {
  console.log('Updating equipment:', equipment);
  
  try {
    const { error } = await supabase
      .from('equipment')
      .update({
        name: equipment.name,
        category: equipment.category,
        available_quantity: equipment.available,
        requires_clearance: equipment.requires_clearance,
        description: equipment.description,
        location: equipment.location,
        total_quantity: equipment.totalQuantity
      })
      .eq('id', equipment.id);
      
    if (error) throw error;
  } catch (error) {
    console.error(`Error updating equipment ${equipment.id}:`, error);
    throw error;
  }
};

export const addEquipment = async (equipment: Omit<Equipment, 'id'>): Promise<void> => {
  console.log('Adding equipment:', equipment);
  
  try {
    const { error } = await supabase
      .from('equipment')
      .insert({
        name: equipment.name,
        category: equipment.category,
        available_quantity: equipment.available,
        requires_clearance: equipment.requires_clearance,
        description: equipment.description,
        location: equipment.location,
        total_quantity: equipment.totalQuantity
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error adding equipment:', error);
    throw error;
  }
};

export const deleteEquipment = async (id: string): Promise<void> => {
  console.log(`Deleting equipment ${id}`);
  
  try {
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting equipment ${id}:`, error);
    throw error;
  }
};
