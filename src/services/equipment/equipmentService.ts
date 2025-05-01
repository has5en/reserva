
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/data/models';
import { toast } from '@/components/ui/use-toast';

export const getEquipment = async (): Promise<Equipment[]> => {
  try {
    console.log('Fetching equipment from database...');
    const { data, error } = await supabase
      .from('equipment')
      .select('*');
    
    if (error) {
      console.error('Error fetching equipment:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement du matériel",
        description: error.message
      });
      throw error;
    }
    
    console.log('Equipment fetched successfully:', data);
    
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
    console.log(`Fetching equipment with ID: ${id}`);
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching equipment ${id}:`, error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement du matériel",
        description: error.message
      });
      throw error;
    }
    
    if (!data) {
      console.log(`No equipment found with ID: ${id}`);
      return null;
    }
    
    console.log('Equipment fetched successfully:', data);
    
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
    console.log(`Fetching equipment by category: ${category}`);
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('category', category);
    
    if (error) {
      console.error(`Error fetching equipment by category ${category}:`, error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement du matériel",
        description: error.message
      });
      throw error;
    }
    
    console.log('Equipment by category fetched successfully:', data);
    
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
    console.log('Fetching available equipment...');
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .gt('available_quantity', 0);
    
    if (error) {
      console.error('Error fetching available equipment:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement du matériel disponible",
        description: error.message
      });
      throw error;
    }
    
    console.log('Available equipment fetched successfully:', data);
    
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
      
    if (error) {
      console.error(`Error updating equipment ${equipment.id}:`, error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la mise à jour du matériel",
        description: error.message
      });
      throw error;
    }
    
    console.log('Equipment updated successfully');
    toast({
      title: "Matériel mis à jour",
      description: `${equipment.name} a été mis à jour avec succès.`
    });
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
      
    if (error) {
      console.error('Error adding equipment:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de l'ajout du matériel",
        description: error.message
      });
      throw error;
    }
    
    console.log('Equipment added successfully');
    toast({
      title: "Matériel ajouté",
      description: `${equipment.name} a été ajouté avec succès.`
    });
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
      
    if (error) {
      console.error(`Error deleting equipment ${id}:`, error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la suppression du matériel",
        description: error.message
      });
      throw error;
    }
    
    console.log('Equipment deleted successfully');
    toast({
      title: "Matériel supprimé",
      description: "Le matériel a été supprimé avec succès."
    });
  } catch (error) {
    console.error(`Error deleting equipment ${id}:`, error);
    throw error;
  }
};
