
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/data/models';

export const getEquipment = async (): Promise<Equipment[]> => {
  try {
    const { data, error } = await supabase.from('equipment').select('*');
    if (error) throw error;
    return data.map(eq => ({
      id: eq.id,
      name: eq.name,
      category: eq.category || '',
      available: eq.available_quantity,
      availableQuantity: eq.available_quantity,
      totalQuantity: eq.total_quantity,
      location: eq.location,
      description: eq.description,
      requires_clearance: eq.requires_clearance
    })) || [];
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }
};

export const getEquipmentById = async (id: string): Promise<Equipment | null> => {
  try {
    const { data, error } = await supabase.from('equipment').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      category: data.category || '',
      available: data.available_quantity,
      availableQuantity: data.available_quantity,
      totalQuantity: data.total_quantity,
      location: data.location,
      description: data.description,
      requires_clearance: data.requires_clearance
    };
  } catch (error) {
    console.error(`Error fetching equipment ${id}:`, error);
    return null;
  }
};

export const getAvailableEquipment = async (): Promise<Equipment[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .gt('available_quantity', 0);
    
    if (error) throw error;
    
    return data.map(eq => ({
      id: eq.id,
      name: eq.name,
      category: eq.category || '',
      available: eq.available_quantity,
      availableQuantity: eq.available_quantity,
      totalQuantity: eq.total_quantity,
      location: eq.location,
      description: eq.description,
      requires_clearance: eq.requires_clearance
    })) || [];
  } catch (error) {
    console.error('Error fetching available equipment:', error);
    return [];
  }
};

export const updateEquipment = async (equipment: Equipment): Promise<void> => {
  try {
    const dbEquipment = {
      id: equipment.id,
      name: equipment.name,
      category: equipment.category,
      available_quantity: equipment.available,
      total_quantity: equipment.totalQuantity || equipment.available,
      location: equipment.location,
      description: equipment.description,
      requires_clearance: equipment.requires_clearance
    };
    
    const { error } = await supabase.from('equipment').update(dbEquipment).eq('id', equipment.id);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating equipment:', error);
    throw error;
  }
};

export const addEquipment = async (equipment: Omit<Equipment, 'id'>): Promise<Equipment> => {
  try {
    const dbEquipment = {
      name: equipment.name,
      category: equipment.category,
      available_quantity: equipment.available,
      total_quantity: equipment.totalQuantity || equipment.available,
      location: equipment.location,
      description: equipment.description,
      requires_clearance: equipment.requires_clearance
    };
    
    const { data, error } = await supabase.from('equipment').insert(dbEquipment).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      category: data.category || '',
      available: data.available_quantity,
      availableQuantity: data.available_quantity,
      totalQuantity: data.total_quantity,
      location: data.location,
      description: data.description,
      requires_clearance: data.requires_clearance
    };
  } catch (error) {
    console.error('Error adding equipment:', error);
    throw error;
  }
};

export const deleteEquipment = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting equipment:', error);
    throw error;
  }
};
