
import { supabase } from '@/integrations/supabase/client';
import { Room, Equipment, Request, ResourceUpdate, Department, Class, TeacherClass, Notification } from '@/data/models';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

// Utility functions
export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'dd MMMM yyyy', { locale: fr });
};

export const formatDateTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
};

// Departments
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

// Classes
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

// Teacher classes
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

export const getTeacherClassesForReservation = async (teacherId: string): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('teacher_classes')
      .select(`
        classes(
          id, 
          name, 
          student_count,
          department_id,
          departments(name)
        )
      `)
      .eq('teacher_id', teacherId);
    
    if (error) throw error;
    
    return data.map(tc => ({
      id: tc.classes.id,
      name: tc.classes.name,
      studentCount: tc.classes.student_count || 0,
      departmentId: tc.classes.department_id,
      department: tc.classes.departments?.name || ""
    })) || [];
  } catch (error) {
    console.error('Error fetching teacher classes for reservation:', error);
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

// Rooms
export const getRooms = async (): Promise<Room[]> => {
  try {
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) throw error;
    return data.map(room => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      available: room.is_available || false,
      type: room.type,
      equipment: room.equipment,
      floor: room.floor,
      building: room.building
    })) || [];
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

export const getRoomById = async (id: string): Promise<Room | null> => {
  try {
    const { data, error } = await supabase.from('rooms').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      capacity: data.capacity,
      available: data.is_available || false,
      type: data.type,
      equipment: data.equipment,
      floor: data.floor,
      building: data.building
    };
  } catch (error) {
    console.error(`Error fetching room ${id}:`, error);
    return null;
  }
};

export const getAvailableRoomsByType = async (type: string, date: string, startTime: string, endTime: string): Promise<Room[]> => {
  // Cette fonction devrait vérifier les disponibilités des salles selon les réservations existantes
  // Pour l'instant, on renvoie simplement toutes les salles du type spécifié
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('type', type as RoomType)
      .eq('is_available', true);
    
    if (error) throw error;
    
    return data.map(room => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      available: room.is_available || false,
      type: room.type,
      equipment: room.equipment,
      floor: room.floor,
      building: room.building
    })) || [];
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    return [];
  }
};

export const updateRoom = async (room: Room): Promise<void> => {
  try {
    const dbRoom = {
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      is_available: room.available,
      type: room.type,
      equipment: room.equipment,
      floor: room.floor,
      building: room.building
    };
    
    const { error } = await supabase.from('rooms').update(dbRoom).eq('id', room.id);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

export const addRoom = async (room: Omit<Room, 'id'>): Promise<Room> => {
  try {
    const dbRoom = {
      name: room.name,
      capacity: room.capacity,
      is_available: room.available,
      type: room.type,
      equipment: room.equipment,
      floor: room.floor,
      building: room.building
    };
    
    const { data, error } = await supabase.from('rooms').insert(dbRoom).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      capacity: data.capacity,
      available: data.is_available || false,
      type: data.type,
      equipment: data.equipment,
      floor: data.floor,
      building: data.building
    };
  } catch (error) {
    console.error('Error adding room:', error);
    throw error;
  }
};

export const deleteRoom = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

// Equipment
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

// Requests
export const getRequests = async (): Promise<Request[]> => {
  try {
    const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
};

export const getRequestById = async (id: string): Promise<Request | null> => {
  try {
    const { data, error } = await supabase.from('requests').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching request ${id}:`, error);
    return null;
  }
};

export const getRequestsByUserId = async (userId: string): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching requests for user ${userId}:`, error);
    return [];
  }
};

export const getRequestsByStatus = async (status: string): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching requests with status ${status}:`, error);
    return [];
  }
};

export const createRequest = async (request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .insert({
        ...request,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

export const updateRequest = async (
  id: string, 
  status: RequestStatus, 
  userId: string, 
  userName: string, 
  notes?: string
): Promise<Request> => {
  try {
    const updatedRequest: Record<string, any> = {
      status: status,
      updated_at: new Date().toISOString()
    };

    // Ajouter les informations d'approbation ou de retour selon le statut
    if (status === 'admin_approved') {
      updatedRequest.admin_approval = {
        userId: userId,
        userName: userName,
        timestamp: new Date().toISOString(),
        notes: notes || ''
      };
    } else if (status === 'approved') {
      updatedRequest.supervisor_approval = {
        userId: userId,
        userName: userName,
        timestamp: new Date().toISOString(),
        notes: notes || ''
      };
    } else if (status === 'returned') {
      updatedRequest.return_info = {
        userId: userId,
        userName: userName,
        timestamp: new Date().toISOString(),
        notes: notes || ''
      };
    }

    const { data, error } = await supabase
      .from('requests')
      .update(updatedRequest)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating request ${id}:`, error);
    throw error;
  }
};

export const returnEquipment = async (
  requestId: string, 
  userId: string, 
  userName: string, 
  notes?: string
): Promise<void> => {
  try {
    await updateRequest(requestId, 'returned', userId, userName, notes);
    
    // Mettre à jour les stocks d'équipement ici si nécessaire
    const request = await getRequestById(requestId);
    if (request?.equipmentId && request.equipmentQuantity) {
      const equipment = await getEquipmentById(request.equipmentId);
      if (equipment) {
        await updateEquipment({
          ...equipment,
          available: equipment.available + request.equipmentQuantity
        });
      }
    }
  } catch (error) {
    console.error(`Error returning equipment for request ${requestId}:`, error);
    throw error;
  }
};

// Resource updates
export const getResourceUpdates = async (): Promise<ResourceUpdate[]> => {
  try {
    const { data, error } = await supabase
      .from('resource_updates')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching resource updates:', error);
    return [];
  }
};

// Notifications
export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching notifications for user ${userId}:`, error);
    return [];
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error marking all notifications as read for user ${userId}:`, error);
    throw error;
  }
};

export const clearAllNotifications = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error clearing all notifications for user ${userId}:`, error);
    throw error;
  }
};
