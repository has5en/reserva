import { supabase } from '@/integrations/supabase/client';
import { Class } from '@/data/models';
import { toast } from '@/components/ui/use-toast';

export const getClasses = async (): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching classes:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement des classes",
        description: error.message
      });
      throw error;
    }
    
    // Format data to match Class model
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      departmentId: '', // Maintenu pour compatibilité
      studentCount: item.student_count,
      unit: item.unit,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

export const getClassById = async (id: string): Promise<Class | null> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching class by ID:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement de la classe",
        description: error.message
      });
      throw error;
    }
    
    if (!data) return null;
    
    // Format data to match Class model
    return {
      id: data.id,
      name: data.name,
      departmentId: '', // Maintenu pour compatibilité
      studentCount: data.student_count,
      unit: data.unit,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching class by ID:', error);
    return null;
  }
};

export const getClassesByDepartment = async (departmentId: string): Promise<Class[]> => {
  // Comme nous avons supprimé les départements, cette fonction retourne toutes les classes
  return getClasses();
};

export const getClassesByTeacher = async (teacherId: string): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('teacher_classes')
      .select(`
        classes (*)
      `)
      .eq('teacher_id', teacherId);
    
    if (error) {
      console.error('Error fetching classes by teacher:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement des classes",
        description: error.message
      });
      throw error;
    }
    
    // Format data to match Class model
    return (data || []).map(item => ({
      id: item.classes.id,
      name: item.classes.name,
      departmentId: '', // Maintenu pour compatibilité
      studentCount: item.classes.student_count,
      unit: item.classes.unit,
      created_at: item.classes.created_at,
      updated_at: item.classes.updated_at
    }));
  } catch (error) {
    console.error('Error fetching classes by teacher:', error);
    return [];
  }
};

export const getTeacherClassesForReservation = async (teacherId: string): Promise<Class[]> => {
  // Cette fonction réutilise getClassesByTeacher pour la compatibilité
  return getClassesByTeacher(teacherId);
};

export const addTeacherClass = async (teacherId: string, classId: string): Promise<boolean> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Authentication error:', sessionError);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette action."
      });
      return false;
    }
    
    const { error } = await supabase
      .from('teacher_classes')
      .insert({
        teacher_id: teacherId,
        class_id: classId
      });
    
    if (error) {
      console.error('Error adding teacher class:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de l'ajout de la classe",
        description: error.message
      });
      throw error;
    }
    
    toast({
      title: "Classe assignée",
      description: "La classe a été assignée à l'enseignant avec succès."
    });
    
    return true;
  } catch (error) {
    console.error('Error adding teacher class:', error);
    return false;
  }
};

export const removeClass = async (teacherId: string, classId: string): Promise<boolean> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Authentication error:', sessionError);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette action."
      });
      return false;
    }
    
    const { error } = await supabase
      .from('teacher_classes')
      .delete()
      .eq('teacher_id', teacherId)
      .eq('class_id', classId);
    
    if (error) {
      console.error('Error removing class from teacher:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la suppression de la classe",
        description: error.message
      });
      throw error;
    }
    
    toast({
      title: "Classe retirée",
      description: "La classe a été retirée de l'enseignant avec succès."
    });
    
    return true;
  } catch (error) {
    console.error('Error removing class from teacher:', error);
    return false;
  }
};

export const addClass = async (classData: { name: string; studentCount: number; unit?: string }): Promise<Class | null> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Authentication error:', sessionError);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette action."
      });
      return null;
    }
    
    // Formatage des données pour correspondre à la structure de la table
    const formattedData = {
      name: classData.name,
      student_count: classData.studentCount,
      unit: classData.unit
    };
    
    const { data, error } = await supabase
      .from('classes')
      .insert(formattedData)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding class:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de l'ajout de la classe",
        description: error.message
      });
      throw error;
    }
    
    toast({
      title: "Classe ajoutée",
      description: `${classData.name} a été ajoutée avec succès.`
    });
    
    // Format response to match Class model
    return {
      id: data.id,
      name: data.name,
      departmentId: '', // Maintenu pour compatibilité
      studentCount: data.student_count,
      unit: data.unit,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error adding class:', error);
    throw error;
  }
};

export const updateClass = async (classData: { id: string; name: string; studentCount: number; unit?: string }): Promise<Class | null> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Authentication error:', sessionError);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette action."
      });
      return null;
    }
    
    // Formatage des données pour correspondre à la structure de la table
    const formattedData = {
      name: classData.name,
      student_count: classData.studentCount,
      unit: classData.unit
    };
    
    const { data, error } = await supabase
      .from('classes')
      .update(formattedData)
      .eq('id', classData.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating class:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la mise à jour de la classe",
        description: error.message
      });
      throw error;
    }
    
    toast({
      title: "Classe mise à jour",
      description: `${classData.name} a été mise à jour avec succès.`
    });
    
    // Format response to match Class model
    return {
      id: data.id,
      name: data.name,
      departmentId: '', // Maintenu pour compatibilité
      studentCount: data.student_count,
      unit: data.unit,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error updating class:', error);
    throw error;
  }
};

export const deleteClass = async (id: string): Promise<void> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Authentication error:', sessionError);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette action."
      });
      return;
    }
    
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting class:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la suppression de la classe",
        description: error.message
      });
      throw error;
    }
    
    toast({
      title: "Classe supprimée",
      description: "La classe a été supprimée avec succès."
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};
