import { supabase } from '@/integrations/supabase/client';
import { Room, Equipment, Class, Department, TeacherClass, RequestStatus, RoomType } from '@/data/models';
import { MOCK_ROOMS, MOCK_EQUIPMENT, MOCK_CLASSES } from '@/data/mockData';
import { Tables } from '@/integrations/supabase/types';

// Rooms
export const getRooms = async (): Promise<Room[]> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*');

    if (error) throw error;

    return data.map(room => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      available: room.is_available ?? true,
      type: room.type,
      equipment: room.equipment,
      floor: room.floor,
      building: room.building
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return MOCK_ROOMS;
  }
};

export const getRoomTypes = (): RoomType[] => {
  return ['classroom', 'training_room', 'weapons_room', 'tactical_room'];
};

export const populateRooms = async (): Promise<void> => {
  try {
    for (const room of MOCK_ROOMS) {
      const { error } = await supabase
        .from('rooms')
        .insert({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          is_available: room.available,
          type: room.type,
          equipment: room.equipment,
          floor: room.floor,
          building: room.building
        });

      if (error) {
        console.error('Error populating rooms:', error);
        throw error;
      }
    }
    console.log('Rooms populated successfully');
  } catch (error) {
    console.error('Error populating rooms:', error);
  }
};

// Equipment
export const getEquipment = async (): Promise<Equipment[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*');

    if (error) throw error;

    return data.map(eq => ({
      id: eq.id,
      name: eq.name,
      category: eq.category || '',
      available: eq.available_quantity,
      availableQuantity: eq.available_quantity,
      totalQuantity: eq.total_quantity,
      description: eq.description,
      location: eq.location,
      requires_clearance: eq.requires_clearance
    }));
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return MOCK_EQUIPMENT;
  }
};

export const addEquipment = async (equipment: Omit<Equipment, 'id'>): Promise<Equipment> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .insert({
        name: equipment.name,
        category: equipment.category,
        available_quantity: equipment.available,
        total_quantity: equipment.totalQuantity || equipment.available,
        description: equipment.description || '',
        location: equipment.location || '',
        requires_clearance: equipment.requires_clearance || false
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      category: data.category || '',
      available: data.available_quantity,
      availableQuantity: data.available_quantity,
      totalQuantity: data.total_quantity,
      description: data.description,
      location: data.location,
      requires_clearance: data.requires_clearance
    };
  } catch (error) {
    console.error('Error adding equipment:', error);
    throw error;
  }
};

// Classes
export const getClasses = async (): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*');

    if (error) throw error;

    return data.map(cls => ({
      id: cls.id,
      name: cls.name,
      studentCount: cls.student_count,
      department: '', // You might need to fetch the department name separately
      departmentId: cls.department_id,
      unit: cls.unit
    }));
  } catch (error) {
    console.error('Error fetching classes:', error);
    return MOCK_CLASSES;
  }
};

// Departments
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*');

    if (error) throw error;

    return data.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description
    }));
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

// Teacher Classes
export const getTeacherClasses = async (teacherId: string): Promise<TeacherClass[]> => {
  try {
    const { data, error } = await supabase
      .from('teacher_classes')
      .select(`
        id,
        teacher_id,
        class_id,
        classes (
          name,
          department_id
        ),
        departments (
          name
        )
      `)
      .eq('teacher_id', teacherId);

    if (error) throw error;

    return data.map(tc => ({
      id: tc.id,
      teacherId: tc.teacher_id,
      classId: tc.class_id,
      className: (tc.classes as any)?.name,
      departmentName: (tc.departments as any)?.name
    }));
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return [];
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

// Requests
export const updateRequestStatus = async (requestId: string, status: RequestStatus, notes?: string): Promise<void> => {
  try {
    // Si le statut Supabase est différent, faites le mappage
    const supabaseStatus = 
      status === 'admin_approved' ? 'pending' : 
      status === 'returned' ? 'rejected' : 
      status;

    const { error } = await supabase
      .from('reservations')
      .update({
        status: supabaseStatus,
        // Incluez d'autres champs si nécessaire
      })
      .eq('id', requestId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

export const createReservation = async (reservationData: any): Promise<any> => {
  try {
    const { error } = await supabase
      .from('reservations')
      .insert({
        user_id: reservationData.userId,
        room_id: reservationData.roomId,
        start_time: reservationData.startTime,
        end_time: reservationData.endTime,
        class_id: reservationData.classId,
        class_name: reservationData.className,
        purpose: reservationData.notes || '',
        requires_commander_approval: reservationData.requires_commander_approval || false,
        status: 'pending',
        participants: reservationData.participants || null
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};
