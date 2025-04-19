
import { supabase } from '@/integrations/supabase/client';
import { Department } from '@/data/models';
import { toast } from '@/components/ui/use-toast';

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching departments:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement des départements",
        description: error.message
      });
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

export const addDepartment = async (department: { name: string; description?: string }): Promise<Department | null> => {
  try {
    // Récupérer la session utilisateur actuelle avec l'API correcte
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette action."
      });
      return null;
    }
    
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding department:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de l'ajout du département",
        description: error.message
      });
      throw error;
    }
    
    toast({
      title: "Département ajouté",
      description: `${department.name} a été ajouté avec succès.`
    });
    
    return data;
  } catch (error) {
    console.error('Error adding department:', error);
    throw error;
  }
};

export const updateDepartment = async (department: Partial<Department> & { id: string }): Promise<Department | null> => {
  try {
    // Récupérer la session utilisateur actuelle avec l'API correcte
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette action."
      });
      return null;
    }
    
    const { data, error } = await supabase
      .from('departments')
      .update(department)
      .eq('id', department.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating department:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la mise à jour du département",
        description: error.message
      });
      throw error;
    }
    
    toast({
      title: "Département mis à jour",
      description: `${department.name} a été mis à jour avec succès.`
    });
    
    return data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    // Récupérer la session utilisateur actuelle avec l'API correcte
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette action."
      });
      return;
    }
    
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting department:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la suppression du département",
        description: error.message
      });
      throw error;
    }
    
    toast({
      title: "Département supprimé",
      description: "Le département a été supprimé avec succès."
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};
