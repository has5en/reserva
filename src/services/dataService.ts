
import { supabase } from '@/integrations/supabase/client';
import { Room, Equipment, Request, ResourceUpdate, Department, Class, TeacherClass, Notification, RoomType, RequestStatus, RequestType } from '@/data/models';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

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

export const addDepartment = async (department: { name: string; description?: string }): Promise<Department | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding department:', error);
    throw error;
  }
};

export const updateDepartment = async (department: Partial<Department> & { id: string }): Promise<Department | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .update(department)
      .eq('id', department.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
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

export const getAvailableRoomsByType = async (type: RoomType, date: string, startTime: string, endTime: string): Promise<Room[]> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('type', type)
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
export const getRequest = async (id: string): Promise<Request | null> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Adapter les champs selon la structure actuelle de la base de données
    return {
      id: data.id,
      type: 'room' as RequestType, // Par défaut pour les réservations
      status: data.status as RequestStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id,
      userName: data.user_id, // Utiliser l'id comme nom temporaire
      roomId: data.room_id,
      roomName: data.room_id, // Utiliser l'id comme nom temporaire
      equipmentId: data.equipment_id,
      equipmentName: data.equipment_id, // Utiliser l'id comme nom temporaire
      equipmentQuantity: data.equipment_quantity,
      classId: data.class_id || '',
      className: data.class_name || '',
      startTime: data.start_time,
      endTime: data.end_time,
      date: data.start_time?.split('T')[0] || '', // Utiliser la date de start_time
      notes: data.purpose || '',
      requires_commander_approval: data.requires_commander_approval,
      adminApproval: null, // Non présent dans la structure actuelle
      supervisorApproval: null, // Non présent dans la structure actuelle
      returnInfo: null // Non présent dans la structure actuelle
    };
  } catch (error) {
    console.error(`Error fetching request ${id}:`, error);
    return null;
  }
};

export const getRequests = async (): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(req => ({
      id: req.id,
      type: 'room' as RequestType, // Par défaut pour les réservations
      status: req.status as RequestStatus,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      userId: req.user_id,
      userName: req.user_id, // Utiliser l'id comme nom temporaire
      roomId: req.room_id,
      roomName: req.room_id, // Utiliser l'id comme nom temporaire
      equipmentId: req.equipment_id,
      equipmentName: req.equipment_id, // Utiliser l'id comme nom temporaire
      equipmentQuantity: req.equipment_quantity,
      classId: req.class_id || '',
      className: req.class_name || '',
      startTime: req.start_time,
      endTime: req.end_time,
      date: req.start_time?.split('T')[0] || '', // Utiliser la date de start_time
      notes: req.purpose || '',
      requires_commander_approval: req.requires_commander_approval,
      adminApproval: null, // Non présent dans la structure actuelle
      supervisorApproval: null, // Non présent dans la structure actuelle
      returnInfo: null // Non présent dans la structure actuelle
    }));
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
};

export const getRequestsByUserId = async (userId: string): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(req => ({
      id: req.id,
      type: 'room' as RequestType, // Par défaut pour les réservations
      status: req.status as RequestStatus,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      userId: req.user_id,
      userName: req.user_id, // Utiliser l'id comme nom temporaire
      roomId: req.room_id,
      roomName: req.room_id, // Utiliser l'id comme nom temporaire
      equipmentId: req.equipment_id,
      equipmentName: req.equipment_id, // Utiliser l'id comme nom temporaire
      equipmentQuantity: req.equipment_quantity,
      classId: req.class_id || '',
      className: req.class_name || '',
      startTime: req.start_time,
      endTime: req.end_time,
      date: req.start_time?.split('T')[0] || '', // Utiliser la date de start_time
      notes: req.purpose || '',
      requires_commander_approval: req.requires_commander_approval,
      adminApproval: null, // Non présent dans la structure actuelle
      supervisorApproval: null, // Non présent dans la structure actuelle
      returnInfo: null // Non présent dans la structure actuelle
    }));
  } catch (error) {
    console.error(`Error fetching requests for user ${userId}:`, error);
    return [];
  }
};

export const getRequestsByStatus = async (status: RequestStatus): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(req => ({
      id: req.id,
      type: 'room' as RequestType, // Par défaut pour les réservations
      status: req.status as RequestStatus,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      userId: req.user_id,
      userName: req.user_id, // Utiliser l'id comme nom temporaire
      roomId: req.room_id,
      roomName: req.room_id, // Utiliser l'id comme nom temporaire
      equipmentId: req.equipment_id,
      equipmentName: req.equipment_id, // Utiliser l'id comme nom temporaire
      equipmentQuantity: req.equipment_quantity,
      classId: req.class_id || '',
      className: req.class_name || '',
      startTime: req.start_time,
      endTime: req.end_time,
      date: req.start_time?.split('T')[0] || '', // Utiliser la date de start_time
      notes: req.purpose || '',
      requires_commander_approval: req.requires_commander_approval,
      adminApproval: null, // Non présent dans la structure actuelle
      supervisorApproval: null, // Non présent dans la structure actuelle
      returnInfo: null // Non présent dans la structure actuelle
    }));
  } catch (error) {
    console.error(`Error fetching requests with status ${status}:`, error);
    return [];
  }
};

export const createRequest = async (request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request> => {
  try {
    // For simplicity, ensure the status is a valid Supabase enum value
    // Changed from 'admin_approved' to 'pending' to match the valid enum values
    const validStatus = request.status === 'admin_approved' ? 'pending' : 
                        request.status === 'returned' ? 'approved' : request.status;
    
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        user_id: request.userId,
        room_id: request.roomId,
        equipment_id: request.equipmentId,
        equipment_quantity: request.equipmentQuantity,
        class_id: request.classId,
        class_name: request.className,
        start_time: request.startTime,
        end_time: request.endTime,
        purpose: request.notes,
        status: validStatus,
        requires_commander_approval: request.requires_commander_approval
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      type: 'room' as RequestType, // Défaut pour les réservations
      status: data.status as RequestStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id,
      userName: data.user_id,
      roomId: data.room_id,
      roomName: data.room_id,
      equipmentId: data.equipment_id,
      equipmentName: data.equipment_id,
      equipmentQuantity: data.equipment_quantity,
      classId: data.class_id || '',
      className: data.class_name || '',
      startTime: data.start_time,
      endTime: data.end_time,
      date: data.start_time?.split('T')[0] || '',
      notes: data.purpose || '',
      requires_commander_approval: data.requires_commander_approval,
      adminApproval: null,
      supervisorApproval: null,
      returnInfo: null
    };
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
    // Convert 'admin_approved' and 'returned' to valid enum values in the database
    const validStatus = status === 'admin_approved' ? 'pending' : 
                       status === 'returned' ? 'approved' : status;
    
    const updatedRequest: Record<string, any> = {
      status: validStatus,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reservations')
      .update(updatedRequest)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      type: 'room' as RequestType,
      status: data.status as RequestStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id,
      userName: data.user_id,
      roomId: data.room_id,
      roomName: data.room_id,
      equipmentId: data.equipment_id,
      equipmentName: data.equipment_id,
      equipmentQuantity: data.equipment_quantity,
      classId: data.class_id || '',
      className: data.class_name || '',
      startTime: data.start_time,
      endTime: data.end_time,
      date: data.start_time?.split('T')[0] || '',
      notes: data.purpose || '',
      requires_commander_approval: data.requires_commander_approval,
      adminApproval: null,
      supervisorApproval: null,
      returnInfo: null
    };
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
    const request = await getRequest(requestId);
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

// Simplified ResourceUpdate mock for now since table doesn't seem to exist
export const getResourceUpdates = async (): Promise<ResourceUpdate[]> => {
  try {
    // Mock data for now
    return [
      {
        id: '1',
        resourceType: 'room',
        resourceId: '1',
        resourceName: 'Classroom A',
        updaterId: '1',
        updaterName: 'Admin',
        timestamp: new Date().toISOString(),
        details: 'Equipment updated',
        previousState: { equipment: ['Computer'] },
        newState: { equipment: ['Computer', 'Projector'] }
      }
    ];
  } catch (error) {
    console.error('Error fetching resource updates:', error);
    return [];
  }
};

// Simplified mock for Notifications
export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
  try {
    // Mock data for now
    return [
      {
        id: '1',
        userId,
        title: 'Notification test',
        message: 'This is a test notification',
        read: false,
        type: 'info',
        timestamp: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error(`Error fetching notifications for user ${userId}:`, error);
    return [];
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  console.log(`Marking notification ${id} as read`);
  // Mock for now
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  console.log(`Marking all notifications as read for user ${userId}`);
  // Mock for now
};

export const clearAllNotifications = async (userId: string): Promise<void> => {
  console.log(`Clearing all notifications for user ${userId}`);
  // Mock for now
};
