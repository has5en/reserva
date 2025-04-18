
import { supabase } from '@/integrations/supabase/client';
import { Request } from '@/data/models';

export const getAllRequests = async (): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all requests:', error);
    return [];
  }
};

// Alias for backwards compatibility
export const getRequests = getAllRequests;

export const getRequestsByStatus = async (status: string): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', status);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching requests with status ${status}:`, error);
    return [];
  }
};

export const getRequestsByUserId = async (userId: string): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('userId', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching requests for user ${userId}:`, error);
    return [];
  }
};

export const getRequestById = async (id: string): Promise<Request | null> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching request ${id}:`, error);
    return null;
  }
};

// Alias for backwards compatibility
export const getRequest = getRequestById;

export const getRequestsByRoomId = async (roomId: string): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('roomId', roomId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching requests for room ${roomId}:`, error);
    return [];
  }
};

export const getRequestsByEquipmentId = async (equipmentId: string): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('equipmentId', equipmentId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching requests for equipment ${equipmentId}:`, error);
    return [];
  }
};

export const addRoomRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  console.log('Adding room request:', requestData);
};

export const addEquipmentRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  console.log('Adding equipment request:', requestData);
};

export const addPrintingRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  console.log('Adding printing request:', requestData);
};

export const createRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  console.log('Creating request:', requestData);
  
  // Route to the appropriate request creation function based on type
  if (requestData.type === 'room') {
    return addRoomRequest(requestData);
  } else if (requestData.type === 'equipment') {
    return addEquipmentRequest(requestData);
  } else if (requestData.type === 'printing') {
    return addPrintingRequest(requestData);
  }
};

export const updateRequestStatus = async (id: string, status: string, notes?: string): Promise<void> => {
  console.log(`Updating request ${id} status to ${status}`);
};

// Alias for backwards compatibility
export const updateRequest = async (id: string, updates: Partial<Request>): Promise<void> => {
  console.log(`Updating request ${id}:`, updates);
  if (updates.status) {
    return updateRequestStatus(id, updates.status, updates.notes);
  }
};
