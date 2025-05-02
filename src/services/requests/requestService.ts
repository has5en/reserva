
import { supabase } from '@/integrations/supabase/client';
import { Request, RequestStatus } from '@/data/models';

export const getAllRequests = async (): Promise<Request[]> => {
  try {
    // Change 'requests' to 'reservations' to match the actual table name
    const { data, error } = await supabase
      .from('reservations')
      .select('*');
    
    if (error) throw error;
    
    // Transform database rows to match the Request interface
    return transformRequestsData(data || []);
  } catch (error) {
    console.error('Error fetching all requests:', error);
    return [];
  }
};

// Alias for backwards compatibility
export const getRequests = getAllRequests;

export const getRequestsByStatus = async (status: RequestStatus): Promise<Request[]> => {
  try {
    // Convert our application's status to database status
    const dbStatus = convertRequestStatusToDb(status);
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('status', dbStatus);
    
    if (error) throw error;
    
    return transformRequestsData(data || []);
  } catch (error) {
    console.error(`Error fetching requests with status ${status}:`, error);
    return [];
  }
};

export const getRequestsByUserId = async (userId: string): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return transformRequestsData(data || []);
  } catch (error) {
    console.error(`Error fetching requests for user ${userId}:`, error);
    return [];
  }
};

export const getRequestById = async (id: string): Promise<Request | null> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return transformRequestData(data);
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
      .from('reservations')
      .select('*')
      .eq('room_id', roomId);
    
    if (error) throw error;
    
    return transformRequestsData(data || []);
  } catch (error) {
    console.error(`Error fetching requests for room ${roomId}:`, error);
    return [];
  }
};

export const getRequestsByEquipmentId = async (equipmentId: string): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('equipment_id', equipmentId);
    
    if (error) throw error;
    
    return transformRequestsData(data || []);
  } catch (error) {
    console.error(`Error fetching requests for equipment ${equipmentId}:`, error);
    return [];
  }
};

export const addRoomRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  console.log('Adding room request:', requestData);
  
  try {
    // Transform to database schema and convert status to DB format
    const dbStatus = convertRequestStatusToDb(requestData.status);
    
    // Format de date ISO pour la base de données
    const formattedDate = requestData.date ? new Date(requestData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    const dbData = {
      type: requestData.type,
      status: dbStatus,
      user_id: requestData.userId,
      user_name: requestData.userName,
      room_id: requestData.roomId,
      room_name: requestData.roomName,
      class_id: requestData.classId,
      class_name: requestData.className,
      start_time: requestData.startTime,
      end_time: requestData.endTime,
      date: formattedDate,
      notes: requestData.notes,
      purpose: requestData.notes, // Map notes to purpose as it seems to be the equivalent field
      requires_commander_approval: requestData.requires_commander_approval || false
    };

    console.log('Data prepared for submission to database:', dbData);
    
    const { error, data } = await supabase
      .from('reservations')
      .insert(dbData)
      .select();
      
    if (error) {
      console.error('Database error when adding room request:', error);
      throw error;
    }
    
    console.log('Room request added successfully:', data);
  } catch (error) {
    console.error('Error adding room request:', error);
    throw error;
  }
};

export const addEquipmentRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  console.log('Adding equipment request:', requestData);
  
  try {
    // Transform to database schema and convert status to DB format
    const dbStatus = convertRequestStatusToDb(requestData.status);
    
    // Format de date ISO pour la base de données
    const formattedDate = requestData.date ? new Date(requestData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    const dbData = {
      type: requestData.type,
      status: dbStatus,
      user_id: requestData.userId,
      user_name: requestData.userName,
      equipment_id: requestData.equipmentId,
      equipment_name: requestData.equipmentName,
      equipment_quantity: requestData.equipmentQuantity || 1,
      class_id: requestData.classId,
      class_name: requestData.className,
      start_time: requestData.startTime || new Date().toISOString(), // Provide default value if missing
      end_time: requestData.endTime || new Date().toISOString(), // Provide default value if missing
      date: formattedDate,
      notes: requestData.notes,
      purpose: requestData.notes, // Map notes to purpose as it seems to be the equivalent field
      requires_commander_approval: requestData.requires_commander_approval || false
    };
    
    console.log('Data prepared for submission to database:', dbData);
    
    const { error, data } = await supabase
      .from('reservations')
      .insert(dbData)
      .select();
      
    if (error) {
      console.error('Database error when adding equipment request:', error);
      throw error;
    }
    
    console.log('Equipment request added successfully:', data);
  } catch (error) {
    console.error('Error adding equipment request:', error);
    throw error;
  }
};

export const addPrintingRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  console.log('Adding printing request:', requestData);
  
  try {
    // Transform to database schema and convert status to DB format
    const dbStatus = convertRequestStatusToDb(requestData.status);
    
    // Format de date ISO pour la base de données
    const formattedDate = requestData.date ? new Date(requestData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    const dbData = {
      type: requestData.type,
      status: dbStatus,
      user_id: requestData.userId,
      user_name: requestData.userName,
      class_id: requestData.classId,
      class_name: requestData.className,
      start_time: new Date().toISOString(), // Provide default value for required field
      end_time: new Date().toISOString(), // Provide default value for required field
      date: formattedDate,
      notes: requestData.notes,
      purpose: requestData.notes, // Map notes to purpose as it seems to be the equivalent field
      document_name: requestData.documentName,
      page_count: requestData.pageCount,
      color_print: requestData.colorPrint,
      double_sided: requestData.doubleSided,
      copies: requestData.copies,
      pdf_file_name: requestData.pdfFileName,
      requires_commander_approval: requestData.requires_commander_approval || false,
      signature: requestData.signature
    };
    
    console.log('Data prepared for submission to database:', dbData);
    
    const { error, data } = await supabase
      .from('reservations')
      .insert(dbData)
      .select();
      
    if (error) {
      console.error('Database error when adding printing request:', error);
      throw error;
    }
    
    console.log('Printing request added successfully:', data);
  } catch (error) {
    console.error('Error adding printing request:', error);
    throw error;
  }
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

export const updateRequestStatus = async (id: string, status: RequestStatus, notes?: string): Promise<void> => {
  console.log(`Updating request ${id} status to ${status}`);
  
  try {
    // Convert our application's status to database status
    const dbStatus = convertRequestStatusToDb(status);
    
    const updateData: any = { status: dbStatus };
    if (notes) updateData.notes = notes;
    
    const { error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error(`Error updating request status for ${id}:`, error);
    throw error;
  }
};

// Alias for backwards compatibility
export const updateRequest = async (id: string, updates: Partial<Request>): Promise<void> => {
  console.log(`Updating request ${id}:`, updates);
  
  if (updates.status) {
    return updateRequestStatus(id, updates.status, updates.notes);
  }
  
  try {
    // Convert from interface properties to database column names
    const dbUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      // Handle status separately
      if (key === 'status' && value) {
        dbUpdates.status = convertRequestStatusToDb(value as RequestStatus);
        continue;
      }
      
      // Convert camelCase to snake_case for database fields
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbUpdates[dbKey] = value;
    }
    
    const { error } = await supabase
      .from('reservations')
      .update(dbUpdates)
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error(`Error updating request ${id}:`, error);
    throw error;
  }
};

// Helper function to convert our application's status to database status
const convertRequestStatusToDb = (status: RequestStatus): "pending" | "approved" | "rejected" | "cancelled" => {
  switch (status) {
    case 'admin_approved':
      return 'pending'; // Map to pending in the database as it's not supported
    case 'pending':
      return 'pending';
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'returned':
      return 'cancelled'; // Map to cancelled in the database
    default:
      return 'pending';
  }
};

// Helper function to convert database status to our application's status
const convertDbStatusToRequest = (dbStatus: string): RequestStatus => {
  switch (dbStatus) {
    case 'pending':
      return 'pending';
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'cancelled':
      return 'returned'; // Map cancelled to returned in our application
    default:
      return 'pending';
  }
};

// Helper function to transform a single database row to Request interface
function transformRequestData(data: any): Request {
  return {
    id: data.id,
    type: data.type || 'room',
    status: convertDbStatusToRequest(data.status),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userId: data.user_id,
    userName: data.user_name,
    roomId: data.room_id,
    roomName: data.room_name,
    equipmentId: data.equipment_id,
    equipmentName: data.equipment_name,
    equipmentQuantity: data.equipment_quantity,
    classId: data.class_id,
    className: data.class_name,
    startTime: data.start_time,
    endTime: data.end_time,
    date: data.date,
    notes: data.notes || data.purpose, // Map purpose to notes if notes is not available
    requires_commander_approval: data.requires_commander_approval,
    signature: data.signature,
    documentName: data.document_name,
    pageCount: data.page_count,
    colorPrint: data.color_print,
    doubleSided: data.double_sided,
    copies: data.copies,
    pdfFileName: data.pdf_file_name,
    adminApproval: data.admin_approval,
    supervisorApproval: data.supervisor_approval,
    returnInfo: data.return_info
  };
}

// Helper function to transform multiple database rows to Request interface array
function transformRequestsData(data: any[]): Request[] {
  return data.map(transformRequestData);
}
