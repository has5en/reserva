
import { supabase } from '@/integrations/supabase/client';
import { Request, RequestStatus } from '@/data/models';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'dd MMMM yyyy', { locale: fr });
};

export const formatDateTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
};

const convertRequestStatus = (status: RequestStatus): "pending" | "approved" | "rejected" | "cancelled" => {
  switch (status) {
    case 'admin_approved':
      return "pending";
    case 'approved':
      return "approved";
    case 'rejected':
    case 'returned':
      return "rejected";
    case 'cancelled':
      return "cancelled";
    default:
      return "pending";
  }
};

export const getRequest = async (id: string): Promise<Request | null> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      type: 'room',
      status: data.status,
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
      type: 'room',
      status: req.status,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      userId: req.user_id,
      userName: req.user_id,
      roomId: req.room_id,
      roomName: req.room_id,
      equipmentId: req.equipment_id,
      equipmentName: req.equipment_id,
      equipmentQuantity: req.equipment_quantity,
      classId: req.class_id || '',
      className: req.class_name || '',
      startTime: req.start_time,
      endTime: req.end_time,
      date: req.start_time?.split('T')[0] || '',
      notes: req.purpose || '',
      requires_commander_approval: req.requires_commander_approval,
      adminApproval: null,
      supervisorApproval: null,
      returnInfo: null
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
      type: 'room',
      status: req.status,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      userId: req.user_id,
      userName: req.user_id,
      roomId: req.room_id,
      roomName: req.room_id,
      equipmentId: req.equipment_id,
      equipmentName: req.equipment_id,
      equipmentQuantity: req.equipment_quantity,
      classId: req.class_id || '',
      className: req.class_name || '',
      startTime: req.start_time,
      endTime: req.end_time,
      date: req.start_time?.split('T')[0] || '',
      notes: req.purpose || '',
      requires_commander_approval: req.requires_commander_approval,
      adminApproval: null,
      supervisorApproval: null,
      returnInfo: null
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
      type: 'room',
      status: req.status,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      userId: req.user_id,
      userName: req.user_id,
      roomId: req.room_id,
      roomName: req.room_id,
      equipmentId: req.equipment_id,
      equipmentName: req.equipment_id,
      equipmentQuantity: req.equipment_quantity,
      classId: req.class_id || '',
      className: req.class_name || '',
      startTime: req.start_time,
      endTime: req.end_time,
      date: req.start_time?.split('T')[0] || '',
      notes: req.purpose || '',
      requires_commander_approval: req.requires_commander_approval,
      adminApproval: null,
      supervisorApproval: null,
      returnInfo: null
    }));
  } catch (error) {
    console.error(`Error fetching requests with status ${status}:`, error);
    return [];
  }
};

export const createRequest = async (request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request> => {
  try {
    const validStatus = convertRequestStatus(request.status);
    
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
      type: 'room',
      status: data.status,
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
    const validStatus = convertRequestStatus(status);
    
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
      type: 'room',
      status: data.status,
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
