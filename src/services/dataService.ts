
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
  
  // Transform the data to match the Room type
  return (data || []).map(room => ({
    id: room.id,
    name: room.name,
    type: room.type,
    capacity: room.capacity,
    floor: room.floor || '',
    building: room.building || '',
    equipment: room.equipment || [],
    available: room.is_available,
    description: '',
    created_at: room.created_at,
    updated_at: room.updated_at
  }));
};

export const getRoomById = async (id: string): Promise<Room | undefined> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  
  if (!data) return undefined;
  
  // Transform to match Room type
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    capacity: data.capacity,
    floor: data.floor || '',
    building: data.building || '',
    equipment: data.equipment || [],
    available: data.is_available,
    description: '',
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const getAvailableRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_available', true);
  
  if (error) throw error;
  
  // Transform the data to match the Room type
  return (data || []).map(room => ({
    id: room.id,
    name: room.name,
    type: room.type,
    capacity: room.capacity,
    floor: room.floor || '',
    building: room.building || '',
    equipment: room.equipment || [],
    available: room.is_available,
    description: '',
    created_at: room.created_at,
    updated_at: room.updated_at
  }));
};

// Room management functions
export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room> => {
  // Convert from Room type to database schema
  const dbUpdates: any = { ...updates };
  if ('available' in updates) {
    dbUpdates.is_available = updates.available;
    delete dbUpdates.available;
  }
  
  const { data, error } = await supabase
    .from('rooms')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform back to Room type
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    capacity: data.capacity,
    floor: data.floor || '',
    building: data.building || '',
    equipment: data.equipment || [],
    available: data.is_available,
    description: '',
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const addRoom = async (room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> => {
  // Convert from Room type to database schema
  const dbRoom = {
    name: room.name,
    type: room.type,
    capacity: room.capacity,
    floor: room.floor,
    building: room.building,
    equipment: room.equipment,
    is_available: room.available
  };
  
  const { data, error } = await supabase
    .from('rooms')
    .insert([dbRoom])
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform back to Room type
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    capacity: data.capacity,
    floor: data.floor || '',
    building: data.building || '',
    equipment: data.equipment || [],
    available: data.is_available,
    description: '',
    created_at: data.created_at,
    updated_at: data.updated_at
  };
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
  
  // Transform to match Equipment type
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    category: item.category || '',
    totalQuantity: item.total_quantity,
    available: item.available_quantity > 0,
    availableQuantity: item.available_quantity,
    location: item.location || '',
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
};

export const getEquipmentById = async (id: string): Promise<Equipment | undefined> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  
  if (!data) return undefined;
  
  // Transform to match Equipment type
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    category: data.category || '',
    totalQuantity: data.total_quantity,
    available: data.available_quantity > 0,
    availableQuantity: data.available_quantity,
    location: data.location || '',
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const getAvailableEquipment = async (): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .gt('available_quantity', 0);
  
  if (error) throw error;
  
  // Transform to match Equipment type
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    category: item.category || '',
    totalQuantity: item.total_quantity,
    available: item.available_quantity > 0,
    availableQuantity: item.available_quantity,
    location: item.location || '',
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
};

// Equipment management functions
export const updateEquipment = async (id: string, updates: Partial<Equipment>): Promise<Equipment> => {
  // Convert from Equipment type to database schema
  const dbUpdates: any = { ...updates };
  if ('totalQuantity' in updates) {
    dbUpdates.total_quantity = updates.totalQuantity;
    delete dbUpdates.totalQuantity;
  }
  if ('availableQuantity' in updates) {
    dbUpdates.available_quantity = updates.availableQuantity;
    delete dbUpdates.availableQuantity;
  }
  delete dbUpdates.available;
  
  const { data, error } = await supabase
    .from('equipment')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform back to Equipment type
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    category: data.category || '',
    totalQuantity: data.total_quantity,
    available: data.available_quantity > 0,
    availableQuantity: data.available_quantity,
    location: data.location || '',
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const addEquipment = async (equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Promise<Equipment> => {
  // Convert from Equipment type to database schema
  const dbEquipment = {
    name: equipment.name,
    description: equipment.description,
    category: equipment.category,
    total_quantity: equipment.totalQuantity,
    available_quantity: equipment.availableQuantity,
    location: equipment.location
  };
  
  const { data, error } = await supabase
    .from('equipment')
    .insert([dbEquipment])
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform back to Equipment type
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    category: data.category || '',
    totalQuantity: data.total_quantity,
    available: data.available_quantity > 0,
    availableQuantity: data.available_quantity,
    location: data.location || '',
    created_at: data.created_at,
    updated_at: data.updated_at
  };
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

// Add missing functions that are imported elsewhere
export const getRequestsByStatus = async (status: RequestStatus): Promise<Request[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      profiles:user_id (full_name),
      rooms:room_id (*),
      equipment:equipment_id (*)
    `)
    .eq('status', status);
  
  if (error) throw error;
  return data?.map(transformReservationToRequest) || [];
};

export const updateRequestStatus = async (id: string, status: RequestStatus, notes?: string): Promise<Request> => {
  const updates: any = { status };
  if (notes) updates.purpose = notes;
  
  const { data, error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      profiles:user_id (full_name),
      rooms:room_id (*),
      equipment:equipment_id (*)
    `)
    .single();
  
  if (error) throw error;
  return transformReservationToRequest(data);
};

export const returnEquipment = async (requestId: string, condition: string): Promise<void> => {
  // Get the request first
  const request = await getRequestById(requestId);
  if (!request || request.type !== 'equipment' || !request.equipmentId) {
    throw new Error('Invalid equipment request');
  }
  
  // Start a transaction to update the request and the equipment
  await Promise.all([
    updateRequestStatus(requestId, 'returned' as RequestStatus, `Returned. Condition: ${condition}`),
    // Update the equipment available quantity
    supabase.rpc('return_equipment', { 
      equipment_id: request.equipmentId,
      quantity: request.equipmentQuantity || 1
    })
  ]);
};

export const getAvailableRoomsByType = async (type: string): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_available', true)
    .eq('type', type);
  
  if (error) throw error;
  
  return (data || []).map(room => ({
    id: room.id,
    name: room.name,
    type: room.type,
    capacity: room.capacity,
    floor: room.floor || '',
    building: room.building || '',
    equipment: room.equipment || [],
    available: room.is_available,
    description: '',
    created_at: room.created_at,
    updated_at: room.updated_at
  }));
};

export const getClasses = async (): Promise<{ id: string; name: string }[]> => {
  // Mock implementation until a classes table is added
  return [
    { id: 'class1', name: 'Classe 1A' },
    { id: 'class2', name: 'Classe 1B' },
    { id: 'class3', name: 'Classe 2A' },
    { id: 'class4', name: 'Classe 2B' },
    { id: 'class5', name: 'Classe 3A' }
  ];
};

export const createRequest = async (request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request> => {
  const isRoomRequest = request.type === 'room';
  
  const reservationData = {
    user_id: request.userId,
    room_id: isRoomRequest ? request.roomId : null,
    equipment_id: !isRoomRequest ? request.equipmentId : null,
    equipment_quantity: !isRoomRequest ? request.equipmentQuantity : null,
    status: request.status || 'pending',
    start_time: request.startTime,
    end_time: request.endTime,
    purpose: request.notes,
    participants: isRoomRequest ? request.participants : null,
    class_id: request.classId,
    class_name: request.className
  };
  
  const { data, error } = await supabase
    .from('reservations')
    .insert([reservationData])
    .select(`
      *,
      profiles:user_id (full_name),
      rooms:room_id (*),
      equipment:equipment_id (*)
    `)
    .single();
  
  if (error) throw error;
  return transformReservationToRequest(data);
};

// Notification services
export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
  // Mock implementation until a notifications table is added
  return [];
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  // Mock implementation until a notifications table is added
  return Promise.resolve();
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  // Mock implementation until a notifications table is added
  return Promise.resolve();
};

export const clearAllNotifications = async (userId: string): Promise<void> => {
  // Mock implementation until a notifications table is added
  return Promise.resolve();
};

// Resource updates tracking
export const createResourceUpdate = async (update: Omit<ResourceUpdate, 'id' | 'timestamp'>): Promise<ResourceUpdate> => {
  // Mock implementation until a resource_updates table is added
  return {
    ...update,
    id: '',
    timestamp: new Date().toISOString()
  };
};

export const getResourceUpdates = async (): Promise<ResourceUpdate[]> => {
  // Mock implementation until a resource_updates table is added
  return [];
};
