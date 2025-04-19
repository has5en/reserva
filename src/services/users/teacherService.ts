
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { TeacherClass } from '@/data/models';

// Récupérer les classes d'un enseignant
export const getTeacherClasses = async (teacherId: string): Promise<TeacherClass[]> => {
  try {
    const { data, error } = await supabase
      .from('teacher_classes')
      .select(`
        id,
        teacher_id,
        class_id,
        classes (
          name
        ),
        created_at
      `)
      .eq('teacher_id', teacherId);
    
    if (error) {
      console.error('Error fetching teacher classes:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement des classes",
        description: error.message
      });
      return [];
    }
    
    // Formater les données pour correspondre au modèle TeacherClass
    return (data || []).map(item => ({
      id: item.id,
      teacherId: item.teacher_id,
      classId: item.class_id,
      className: item.classes?.name || '',
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return [];
  }
};

// Assigner des classes à un enseignant
export const assignClassesToTeacher = async (teacherId: string, classIds: string[]): Promise<boolean> => {
  try {
    // Supprimer d'abord toutes les relations existantes pour cet enseignant
    const { error: deleteError } = await supabase
      .from('teacher_classes')
      .delete()
      .eq('teacher_id', teacherId);
    
    if (deleteError) {
      console.error('Error deleting existing teacher classes:', deleteError);
      toast({
        variant: "destructive",
        title: "Erreur lors de la mise à jour des classes",
        description: deleteError.message
      });
      return false;
    }
    
    // Si aucune classe n'est sélectionnée, on s'arrête ici
    if (classIds.length === 0) {
      return true;
    }
    
    // Créer les nouvelles relations
    const teacherClassesData = classIds.map(classId => ({
      teacher_id: teacherId,
      class_id: classId
    }));
    
    const { error: insertError } = await supabase
      .from('teacher_classes')
      .insert(teacherClassesData);
    
    if (insertError) {
      console.error('Error assigning classes to teacher:', insertError);
      toast({
        variant: "destructive",
        title: "Erreur lors de l'assignation des classes",
        description: insertError.message
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error assigning classes to teacher:', error);
    return false;
  }
};
