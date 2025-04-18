import { supabase } from '@/integrations/supabase/client';
import { Class } from '@/data/models';
import { toast } from '@/components/ui/use-toast';

export const getClasses = async (): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*');
    
    if (error) {
      console.error('Error fetching classes:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement des classes",
        description: error.message
      });
      throw error;
    }
    
    // Transform the data to match the Class interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      studentCount: item.student_count,
      departmentId: item.department_id,
      department: undefined, // We don't have this field in the database response
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
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    // Transform the data to match the Class interface
    return {
      id: data.id,
      name: data.name,
      studentCount: data.student_count,
      departmentId: data.department_id,
      department: undefined, // We don't have this field in the database response
      unit: data.unit,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error(`Error fetching class ${id}:`, error);
    return null;
  }
};

export const getClassesByDepartment = async (departmentId: string): Promise<Class[]> => {
  try {
    if (departmentId === 'all') {
      return getClasses();
    }
    
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('department_id', departmentId);
    
    if (error) {
      console.error(`Error fetching classes for department ${departmentId}:`, error);
      toast({
        variant: "destructive",
        title: "Erreur lors du chargement des classes",
        description: error.message
      });
      throw error;
    }
    
    // Transform the data to match the Class interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      studentCount: item.student_count,
      departmentId: item.department_id,
      department: undefined, // We don't have this field in the database response
      unit: item.unit,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error(`Error fetching classes for department ${departmentId}:`, error);
    return [];
  }
};

export const getClassesByTeacher = async (teacherId: string): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('teacher_classes')
      .select('classes(*)')
      .eq('teacher_id', teacherId);
    
    if (error) throw error;
    
    // Extract and transform the classes data
    return (data || []).map(item => {
      const cls = item.classes;
      return {
        id: cls.id,
        name: cls.name,
        studentCount: cls.student_count,
        departmentId: cls.department_id,
        department: undefined, // We don't have this field in the database response
        unit: cls.unit,
        created_at: cls.created_at,
        updated_at: cls.updated_at
      };
    });
  } catch (error) {
    console.error(`Error fetching classes for teacher ${teacherId}:`, error);
    return [];
  }
};

export const getTeacherClassesForReservation = async (teacherId: string): Promise<Class[]> => {
  return getClassesByTeacher(teacherId);
};

export const addClass = async (classData: Omit<Class, 'id'>): Promise<Class | null> => {
  console.log('Adding class:', classData);
  
  // Transform the data to match the database schema
  const dbData = {
    name: classData.name,
    department_id: classData.departmentId,
    student_count: classData.studentCount,
    unit: classData.unit
  };
  
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert(dbData)
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
    
    // Transform the data to match the Class interface
    return {
      id: data.id,
      name: data.name,
      studentCount: data.student_count,
      departmentId: data.department_id,
      unit: data.unit,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error adding class:', error);
    throw error;
  }
};

export const updateClass = async (classData: Partial<Class> & { id: string }): Promise<Class | null> => {
  console.log(`Updating class ${classData.id}:`, classData);
  
  // Transform the data to match the database schema
  const dbData: any = {};
  if (classData.name) dbData.name = classData.name;
  if (classData.departmentId) dbData.department_id = classData.departmentId;
  if (classData.studentCount !== undefined) dbData.student_count = classData.studentCount;
  if (classData.unit) dbData.unit = classData.unit;
  
  try {
    const { data, error } = await supabase
      .from('classes')
      .update(dbData)
      .eq('id', classData.id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating class ${classData.id}:`, error);
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
    
    // Transform the data to match the Class interface
    return {
      id: data.id,
      name: data.name,
      studentCount: data.student_count,
      departmentId: data.department_id,
      unit: data.unit,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error(`Error updating class ${classData.id}:`, error);
    throw error;
  }
};

export const removeClass = async (id: string): Promise<void> => {
  console.log(`Removing class ${id}`);
  // This is likely an alias for deleteClass, kept for backward compatibility
  return deleteClass(id);
};

export const deleteClass = async (id: string): Promise<void> => {
  console.log(`Deleting class ${id}`);
  
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting class ${id}:`, error);
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
    console.error(`Error deleting class ${id}:`, error);
    throw error;
  }
};

export const addTeacherClass = async (teacherId: string, classId: string): Promise<void> => {
  console.log(`Assigning teacher ${teacherId} to class ${classId}`);
  
  try {
    const { error } = await supabase
      .from('teacher_classes')
      .insert({
        teacher_id: teacherId,
        class_id: classId
      });
      
    if (error) throw error;
  } catch (error) {
    console.error(`Error assigning teacher ${teacherId} to class ${classId}:`, error);
    throw error;
  }
};
