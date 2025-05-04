
import { supabase } from '@/integrations/supabase/client';
import { Request, RequestStatus } from '@/data/models';
import { toast } from '@/components/ui/use-toast';

export const getAllRequests = async (): Promise<Request[]> => {
  try {
    console.log('Fetching all requests from database...');
    // Fetch from all tables and combine results
    const [equipmentResult, roomResult, printingResult] = await Promise.all([
      supabase.from('equipment_requests').select('*'),
      supabase.from('room_requests').select('*'),
      supabase.from('printing_requests').select('*')
    ]);
    
    // Handle errors if any
    if (equipmentResult.error) console.error('Error fetching equipment requests:', equipmentResult.error);
    if (roomResult.error) console.error('Error fetching room requests:', roomResult.error);
    if (printingResult.error) console.error('Error fetching printing requests:', printingResult.error);
    
    // Transform and combine data
    const equipmentRequests = equipmentResult.data ? transformEquipmentRequestsData(equipmentResult.data) : [];
    const roomRequests = roomResult.data ? transformRoomRequestsData(roomResult.data) : [];
    const printingRequests = printingResult.data ? transformPrintingRequestsData(printingResult.data) : [];
    
    const allRequests = [...equipmentRequests, ...roomRequests, ...printingRequests];
    console.log('All requests fetched successfully:', allRequests);
    
    return allRequests;
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
    const dbStatus = status;
    console.log(`Fetching requests with status ${status}`);
    
    const [equipmentResult, roomResult, printingResult] = await Promise.all([
      supabase.from('equipment_requests').select('*').eq('status', dbStatus),
      supabase.from('room_requests').select('*').eq('status', dbStatus),
      supabase.from('printing_requests').select('*').eq('status', dbStatus)
    ]);
    
    // Handle errors if any
    if (equipmentResult.error) console.error('Error fetching equipment requests:', equipmentResult.error);
    if (roomResult.error) console.error('Error fetching room requests:', roomResult.error);
    if (printingResult.error) console.error('Error fetching printing requests:', printingResult.error);
    
    // Transform and combine data
    const equipmentRequests = equipmentResult.data ? transformEquipmentRequestsData(equipmentResult.data) : [];
    const roomRequests = roomResult.data ? transformRoomRequestsData(roomResult.data) : [];
    const printingRequests = printingResult.data ? transformPrintingRequestsData(printingResult.data) : [];
    
    const allRequests = [...equipmentRequests, ...roomRequests, ...printingRequests];
    console.log(`Fetched ${allRequests.length} requests with status ${status}`);
    
    return allRequests;
  } catch (error) {
    console.error(`Error fetching requests with status ${status}:`, error);
    return [];
  }
};

export const getRequestsByUserId = async (userId: string): Promise<Request[]> => {
  try {
    console.log(`Fetching requests for user ${userId}`);
    
    const [equipmentResult, roomResult, printingResult] = await Promise.all([
      supabase.from('equipment_requests').select('*').eq('user_id', userId),
      supabase.from('room_requests').select('*').eq('user_id', userId),
      supabase.from('printing_requests').select('*').eq('user_id', userId)
    ]);
    
    // Handle errors if any
    if (equipmentResult.error) console.error('Error fetching equipment requests:', equipmentResult.error);
    if (roomResult.error) console.error('Error fetching room requests:', roomResult.error);
    if (printingResult.error) console.error('Error fetching printing requests:', printingResult.error);
    
    // Transform and combine data
    const equipmentRequests = equipmentResult.data ? transformEquipmentRequestsData(equipmentResult.data) : [];
    const roomRequests = roomResult.data ? transformRoomRequestsData(roomResult.data) : [];
    const printingRequests = printingResult.data ? transformPrintingRequestsData(printingResult.data) : [];
    
    const allRequests = [...equipmentRequests, ...roomRequests, ...printingRequests];
    console.log(`Fetched ${allRequests.length} requests for user ${userId}`);
    
    return allRequests;
  } catch (error) {
    console.error(`Error fetching requests for user ${userId}:`, error);
    return [];
  }
};

export const getRequestById = async (id: string): Promise<Request | null> => {
  try {
    console.log(`Fetching request with ID: ${id}`);
    
    // Try to find the request in each table
    const [equipmentResult, roomResult, printingResult] = await Promise.all([
      supabase.from('equipment_requests').select('*').eq('id', id).maybeSingle(),
      supabase.from('room_requests').select('*').eq('id', id).maybeSingle(),
      supabase.from('printing_requests').select('*').eq('id', id).maybeSingle()
    ]);
    
    // Check which table contained the request
    if (equipmentResult.data) {
      console.log('Equipment request found:', equipmentResult.data);
      return transformEquipmentRequestData(equipmentResult.data);
    }
    
    if (roomResult.data) {
      console.log('Room request found:', roomResult.data);
      return transformRoomRequestData(roomResult.data);
    }
    
    if (printingResult.data) {
      console.log('Printing request found:', printingResult.data);
      return transformPrintingRequestData(printingResult.data);
    }
    
    console.log(`No request found with ID: ${id}`);
    return null;
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
      .from('room_requests')
      .select('*')
      .eq('room_id', roomId);
    
    if (error) throw error;
    
    return transformRoomRequestsData(data || []);
  } catch (error) {
    console.error(`Error fetching requests for room ${roomId}:`, error);
    return [];
  }
};

export const getRequestsByEquipmentId = async (equipmentId: string): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment_requests')
      .select('*')
      .eq('equipment_id', equipmentId);
    
    if (error) throw error;
    
    return transformEquipmentRequestsData(data || []);
  } catch (error) {
    console.error(`Error fetching requests for equipment ${equipmentId}:`, error);
    return [];
  }
};

export const addRoomRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request | null> => {
  console.log('Adding room request:', requestData);
  
  try {
    // Ensure proper date formatting for the database
    let formattedDate = requestData.date;
    if (requestData.date) {
      // Ensure date is in YYYY-MM-DD format
      formattedDate = new Date(requestData.date).toISOString().split('T')[0];
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }
    
    const dbData = {
      user_id: requestData.userId,
      user_name: requestData.userName || 'Unknown User',
      room_id: requestData.roomId,
      room_name: requestData.roomName || '',
      class_id: requestData.classId,
      class_name: requestData.className || '',
      start_time: requestData.startTime || new Date().toISOString(),
      end_time: requestData.endTime || new Date().toISOString(),
      date: formattedDate,
      notes: requestData.notes || '',
      requires_commander_approval: requestData.requires_commander_approval || false,
      status: requestData.status || 'pending'
    };

    console.log('Data prepared for room_requests table:', dbData);
    
    const { error, data } = await supabase
      .from('room_requests')
      .insert(dbData)
      .select();
      
    if (error) {
      console.error('Database error when adding room request:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la soumission",
        description: `Erreur: ${error.message}`
      });
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Room request added successfully:', data[0]);
      return transformRoomRequestData(data[0]);
    } else {
      console.log('Room request added but no data returned');
      return null;
    }
  } catch (error: any) {
    console.error('Error adding room request:', error);
    toast({
      variant: "destructive",
      title: "Erreur lors de la soumission",
      description: `Erreur: ${error.message || "Une erreur inattendue s'est produite"}`
    });
    throw error;
  }
};

export const addEquipmentRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request | null> => {
  console.log('Adding equipment request:', requestData);
  
  try {
    // Ensure proper date formatting for the database
    let formattedDate = requestData.date;
    if (requestData.date) {
      // Ensure date is in YYYY-MM-DD format
      formattedDate = new Date(requestData.date).toISOString().split('T')[0];
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }
    
    const dbData = {
      user_id: requestData.userId,
      user_name: requestData.userName || 'Unknown User',
      equipment_id: requestData.equipmentId,
      equipment_name: requestData.equipmentName || '',
      equipment_quantity: requestData.equipmentQuantity || 1,
      class_id: requestData.classId,
      class_name: requestData.className || '',
      date: formattedDate,
      notes: requestData.notes || '',
      signature: requestData.signature || '',
      status: requestData.status || 'pending'
    };
    
    console.log('Data prepared for equipment_requests table:', dbData);
    
    const { error, data } = await supabase
      .from('equipment_requests')
      .insert(dbData)
      .select();
      
    if (error) {
      console.error('Database error when adding equipment request:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la soumission",
        description: `Erreur: ${error.message}`
      });
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Equipment request added successfully:', data[0]);
      return transformEquipmentRequestData(data[0]);
    } else {
      console.log('Equipment request added but no data returned');
      return null;
    }
  } catch (error: any) {
    console.error('Error adding equipment request:', error);
    toast({
      variant: "destructive",
      title: "Erreur lors de la soumission",
      description: `Erreur: ${error.message || "Une erreur inattendue s'est produite"}`
    });
    throw error;
  }
};

export const addPrintingRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request | null> => {
  console.log('Adding printing request:', requestData);
  
  try {
    // Ensure proper date formatting for the database
    let formattedDate = requestData.date;
    if (requestData.date) {
      // Ensure date is in YYYY-MM-DD format
      formattedDate = new Date(requestData.date).toISOString().split('T')[0];
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }
    
    const dbData = {
      user_id: requestData.userId,
      user_name: requestData.userName || 'Unknown User',
      document_name: requestData.documentName || '',
      page_count: requestData.pageCount || 1,
      color_print: requestData.colorPrint || false,
      double_sided: requestData.doubleSided || false,
      copies: requestData.copies || 1,
      pdf_file_name: requestData.pdfFileName || '',
      class_id: requestData.classId,
      class_name: requestData.className || '',
      date: formattedDate,
      notes: requestData.notes || '',
      signature: requestData.signature || '',
      status: requestData.status || 'pending'
    };
    
    console.log('Data prepared for printing_requests table:', dbData);
    
    const { error, data } = await supabase
      .from('printing_requests')
      .insert(dbData)
      .select();
      
    if (error) {
      console.error('Database error when adding printing request:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la soumission", 
        description: `Erreur: ${error.message}`
      });
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Printing request added successfully:', data[0]);
      return transformPrintingRequestData(data[0]);
    } else {
      console.log('Printing request added but no data returned');
      return null;
    }
  } catch (error: any) {
    console.error('Error adding printing request:', error);
    toast({
      variant: "destructive",
      title: "Erreur lors de la soumission",
      description: `Erreur: ${error.message || "Une erreur inattendue s'est produite"}`
    });
    throw error;
  }
};

export const createRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request | null> => {
  console.log('Creating request:', requestData);
  
  try {
    // Route to the appropriate request creation function based on type
    if (requestData.type === 'room') {
      return await addRoomRequest(requestData);
    } else if (requestData.type === 'equipment') {
      return await addEquipmentRequest(requestData);
    } else if (requestData.type === 'printing') {
      return await addPrintingRequest(requestData);
    }
    
    throw new Error(`Invalid request type: ${requestData.type}`);
  } catch (error) {
    console.error('Error in createRequest:', error);
    throw error; // Re-throw to let calling code handle it
  }
};

export const updateRequestStatus = async (id: string, status: RequestStatus, notes?: string): Promise<void> => {
  console.log(`Updating request ${id} status to ${status}`);
  
  try {
    // First, find which table contains the request
    const request = await getRequestById(id);
    
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    
    const updateData: any = { status };
    if (notes) updateData.notes = notes;
    
    let error;
    
    // Update the appropriate table based on the request type
    if (request.type === 'equipment') {
      const result = await supabase
        .from('equipment_requests')
        .update(updateData)
        .eq('id', id);
      
      error = result.error;
    } else if (request.type === 'room') {
      const result = await supabase
        .from('room_requests')
        .update(updateData)
        .eq('id', id);
      
      error = result.error;
    } else if (request.type === 'printing') {
      const result = await supabase
        .from('printing_requests')
        .update(updateData)
        .eq('id', id);
      
      error = result.error;
    }
    
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
    // First, find which table contains the request
    const request = await getRequestById(id);
    
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    
    // Convert from interface properties to database column names
    const dbUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      // Handle status separately (already handled above)
      if (key === 'status') continue;
      
      // Convert camelCase to snake_case for database fields
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbUpdates[dbKey] = value;
    }
    
    let error;
    
    // Update the appropriate table based on the request type
    if (request.type === 'equipment') {
      const result = await supabase
        .from('equipment_requests')
        .update(dbUpdates)
        .eq('id', id);
      
      error = result.error;
    } else if (request.type === 'room') {
      const result = await supabase
        .from('room_requests')
        .update(dbUpdates)
        .eq('id', id);
      
      error = result.error;
    } else if (request.type === 'printing') {
      const result = await supabase
        .from('printing_requests')
        .update(dbUpdates)
        .eq('id', id);
      
      error = result.error;
    }
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error updating request ${id}:`, error);
    throw error;
  }
};

// Helper functions to transform data from the database tables to our Request interface

function transformEquipmentRequestData(data: any): Request {
  return {
    id: data.id,
    type: 'equipment',
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userId: data.user_id,
    userName: data.user_name,
    equipmentId: data.equipment_id,
    equipmentName: data.equipment_name,
    equipmentQuantity: data.equipment_quantity,
    classId: data.class_id,
    className: data.class_name,
    date: data.date,
    notes: data.notes,
    signature: data.signature,
    requires_commander_approval: false,
    
    // Ajout des informations d'approbation
    adminApproval: data.admin_approval_user_id ? {
      userId: data.admin_approval_user_id,
      userName: data.admin_approval_user_name,
      timestamp: data.admin_approval_timestamp,
      notes: data.admin_approval_notes
    } : undefined,
    
    supervisorApproval: data.supervisor_approval_user_id ? {
      userId: data.supervisor_approval_user_id,
      userName: data.supervisor_approval_user_name,
      timestamp: data.supervisor_approval_timestamp,
      notes: data.supervisor_approval_notes
    } : undefined,
    
    returnInfo: data.return_user_id ? {
      userId: data.return_user_id,
      userName: data.return_user_name,
      timestamp: data.return_timestamp,
      notes: data.return_notes
    } : undefined
  };
}

function transformEquipmentRequestsData(data: any[]): Request[] {
  return data.map(transformEquipmentRequestData);
}

function transformRoomRequestData(data: any): Request {
  return {
    id: data.id,
    type: 'room',
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userId: data.user_id,
    userName: data.user_name,
    roomId: data.room_id,
    roomName: data.room_name,
    classId: data.class_id,
    className: data.class_name,
    startTime: data.start_time,
    endTime: data.end_time,
    date: data.date,
    notes: data.notes,
    requires_commander_approval: data.requires_commander_approval,
    
    // Ajout des informations d'approbation
    adminApproval: data.admin_approval_user_id ? {
      userId: data.admin_approval_user_id,
      userName: data.admin_approval_user_name,
      timestamp: data.admin_approval_timestamp,
      notes: data.admin_approval_notes
    } : undefined,
    
    supervisorApproval: data.supervisor_approval_user_id ? {
      userId: data.supervisor_approval_user_id,
      userName: data.supervisor_approval_user_name,
      timestamp: data.supervisor_approval_timestamp,
      notes: data.supervisor_approval_notes
    } : undefined
  };
}

function transformRoomRequestsData(data: any[]): Request[] {
  return data.map(transformRoomRequestData);
}

function transformPrintingRequestData(data: any): Request {
  return {
    id: data.id,
    type: 'printing',
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userId: data.user_id,
    userName: data.user_name,
    classId: data.class_id,
    className: data.class_name,
    date: data.date,
    notes: data.notes,
    documentName: data.document_name,
    pageCount: data.page_count,
    colorPrint: data.color_print,
    doubleSided: data.double_sided,
    copies: data.copies,
    pdfFileName: data.pdf_file_name,
    signature: data.signature,
    
    // Ajout des informations d'approbation
    adminApproval: data.admin_approval_user_id ? {
      userId: data.admin_approval_user_id,
      userName: data.admin_approval_user_name,
      timestamp: data.admin_approval_timestamp,
      notes: data.admin_approval_notes
    } : undefined,
    
    supervisorApproval: data.supervisor_approval_user_id ? {
      userId: data.supervisor_approval_user_id,
      userName: data.supervisor_approval_user_name,
      timestamp: data.supervisor_approval_timestamp,
      notes: data.supervisor_approval_notes
    } : undefined
  };
}

function transformPrintingRequestsData(data: any[]): Request[] {
  return data.map(transformPrintingRequestData);
}
