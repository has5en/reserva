
import { supabase } from '@/integrations/supabase/client';
import { Class, TeacherClass } from '@/data/models';

export const getClasses = async (): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        departments(name)
      `)
      .order('name');
    
    if (error) throw error;
    
    return data.map(cls => ({
      id: cls.id,
      name: cls.name,
      studentCount: cls.student_count || 0,
      departmentId: cls.department_id,
      department: cls.departments?.name || "",
      unit: cls.unit || "",
      created_at: cls.created_at,
      updated_at: cls.updated_at
    })) || [];
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

export const getTeacherClasses = async (teacherId: string): Promise<TeacherClass[]> => {
  try {
    const { data, error } = await supabase
      .from('teacher_classes')
      .select(`
        *,
        classes(
          id, 
          name, 
          department_id,
          departments(name)
        )
      `)
      .eq('teacher_id', teacherId);
    
    if (error) throw error;
    
    return data.map(tc => ({
      id: tc.id,
      teacherId: tc.teacher_id,
      classId: tc.classes.id,
      className: tc.classes.name,
      departmentName: tc.classes.departments?.name || "",
      created_at: tc.created_at
    })) || [];
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return [];
  }
};

export const getClassesByDepartment = async (departmentId: string): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        departments(name)
      `)
      .eq('department_id', departmentId)
      .order('name');
    
    if (error) throw error;
    
    return data.map(cls => ({
      id: cls.id,
      name: cls.name,
      studentCount: cls.student_count || 0,
      departmentId: cls.department_id,
      department: cls.departments?.name || "",
      unit: cls.unit || "",
      created_at: cls.created_at,
      updated_at: cls.updated_at
    })) || [];
  } catch (error) {
    console.error('Error fetching classes by department:', error);
    return [];
  }
};

export const addClass = async (cls: Omit<Class, 'id' | 'created_at' | 'updated_at' | 'department'>): Promise<Class | null> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name: cls.name,
        department_id: cls.departmentId,
        student_count: cls.studentCount,
        unit: cls.unit
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      studentCount: data.student_count || 0,
      departmentId: data.department_id,
      unit: data.unit || "",
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error adding class:', error);
    throw error;
  }
};

export const updateClass = async (cls: Partial<Class> & { id: string }): Promise<Class | null> => {
  try {
    const updateData: any = {
      id: cls.id
    };
    
    if (cls.name !== undefined) updateData.name = cls.name;
    if (cls.departmentId !== undefined) updateData.department_id = cls.departmentId;
    if (cls.studentCount !== undefined) updateData.student_count = cls.studentCount;
    if (cls.unit !== undefined) updateData.unit = cls.unit;
    
    const { data, error } = await supabase
      .from('classes')
      .update(updateData)
      .eq('id', cls.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      studentCount: data.student_count || 0,
      departmentId: data.department_id,
      unit: data.unit || "",
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
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};

export const assignClassToTeacher = async (teacherId: string, classId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('teacher_classes')
      .insert({ teacher_id: teacherId, class_id: classId });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error assigning class to teacher:', error);
    throw error;
  }
};

export const removeClassFromTeacher = async (teacherClassId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('teacher_classes')
      .delete()
      .eq('id', teacherClassId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error removing class from teacher:', error);
    throw error;
  }
};
