
import { supabase } from '@/integrations/supabase/client';
import { Room, Equipment, Request, RequestStatus, Notification, ResourceUpdate } from '@/data/models';

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Format datetime for display
export const formatDateTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Room services
export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const getRoomById = async (id: string): Promise<Room | undefined> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const getAvailableRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_available', true);
  
  if (error) throw error;
  return data || [];
};

// Room management functions
export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room> => {
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const addRoom = async (room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([room])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteRoom = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Equipment services
export const getEquipment = async (): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const getEquipmentById = async (id: string): Promise<Equipment | undefined> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const getAvailableEquipment = async (): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .gt('available_quantity', 0);
  
  if (error) throw error;
  return data || [];
};

// Equipment management functions
export const updateEquipment = async (id: string, updates: Partial<Equipment>): Promise<Equipment> => {
  const { data, error } = await supabase
    .from('equipment')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const addEquipment = async (equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Promise<Equipment> => {
  const { data, error } = await supabase
    .from('equipment')
    .insert([equipment])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Request services
export const getRequests = async (): Promise<Request[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      profiles:user_id (full_name),
      rooms:room_id (*),
      equipment:equipment_id (*)
    `);
  
  if (error) throw error;
  return data?.map(transformReservationToRequest) || [];
};

export const getRequestById = async (id: string): Promise<Request | undefined> => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      profiles:user_id (full_name),
      rooms:room_id (*),
      equipment:equipment_id (*)
    `)
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data ? transformReservationToRequest(data) : undefined;
};

export const getRequestsByUserId = async (userId: string): Promise<Request[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      profiles:user_id (full_name),
      rooms:room_id (*),
      equipment:equipment_id (*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data?.map(transformReservationToRequest) || [];
};

// Helper function to transform reservation data to Request type
const transformReservationToRequest = (reservation: any): Request => {
  return {
    id: reservation.id,
    type: reservation.room_id ? 'room' : 'equipment',
    status: reservation.status,
    userId: reservation.user_id,
    userName: reservation.profiles?.full_name || 'Unknown',
    roomId: reservation.room_id,
    roomName: reservation.rooms?.name,
    equipmentId: reservation.equipment_id,
    equipmentName: reservation.equipment?.name,
    equipmentQuantity: reservation.equipment_quantity,
    classId: reservation.class_id || '',
    className: reservation.class_name || '',
    startTime: reservation.start_time,
    endTime: reservation.end_time,
    date: new Date(reservation.start_time).toISOString().split('T')[0],
    notes: reservation.purpose,
    createdAt: reservation.created_at,
    updatedAt: reservation.updated_at
  };
};

// Notification services
export const getNotificationsByUserId = (userId: string): Promise<Notification[]> => {
  // TODO: Implement notifications table in future update
  return Promise.resolve([]);
};

export const markNotificationAsRead = (id: string): Promise<void> => {
  // TODO: Implement notifications table in future update
  return Promise.resolve();
};

// Resource updates tracking
export const createResourceUpdate = (update: Omit<ResourceUpdate, 'id' | 'timestamp'>): Promise<ResourceUpdate> => {
  // TODO: Implement resource updates table in future update
  return Promise.resolve({
    ...update,
    id: '',
    timestamp: new Date().toISOString()
  });
};
