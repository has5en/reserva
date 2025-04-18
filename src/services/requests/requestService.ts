import { supabase } from '@/integrations/supabase/client';
import { Request, RequestStatus, RequestType } from '@/data/models';
import { getEquipmentById, updateEquipment } from '../equipment/equipmentService';

export const getAllRequests = async (): Promise<Request[]> => {
  try {
    // This is a mock implementation
    return [
      {
        id: '1',
        type: 'room',
        status: 'pending',
        createdAt: '2023-05-01T10:00:00Z',
        updatedAt: '2023-05-01T10:00:00Z',
        userId: '1',
        userName: 'Teacher 1',
        roomId: '1',
        roomName: 'Room 101',
        date: '2023-05-10',
        startTime: '09:00',
        endTime: '11:00',
        classId: '1',
        className: 'Class A',
        notes: 'Need projector',
        requires_commander_approval: false,
        adminApproval: null,
        supervisorApproval: null,
        returnInfo: null
      }
    ];
  } catch (error) {
    console.error('Error fetching all requests:', error);
    return [];
  }
};

export const getRequestsByStatus = async (status: RequestStatus): Promise<Request[]> => {
  try {
    // This is a mock implementation
    const allRequests = await getAllRequests();
    return allRequests.filter(request => request.status === status);
  } catch (error) {
    console.error(`Error fetching requests by status (${status}):`, error);
    return [];
  }
};

export const getRequestsByUserId = async (userId: string): Promise<Request[]> => {
  try {
    // This is a mock implementation
    const allRequests = await getAllRequests();
    return allRequests.filter(request => request.userId === userId);
  } catch (error) {
    console.error(`Error fetching requests for user ${userId}:`, error);
    return [];
  }
};

export const getRequestById = async (id: string): Promise<Request | null> => {
  try {
    // This is a mock implementation
    const allRequests = await getAllRequests();
    return allRequests.find(request => request.id === id) || null;
  } catch (error) {
    console.error(`Error fetching request ${id}:`, error);
    return null;
  }
};

export const getRequestsByRoomId = async (roomId: string, date: string): Promise<Request[]> => {
  try {
    // This is a mock implementation
    const allRequests = await getAllRequests();
    return allRequests.filter(
      request => 
        request.roomId === roomId && 
        request.date === date && 
        request.status === 'approved'
    );
  } catch (error) {
    console.error(`Error fetching requests for room ${roomId} on ${date}:`, error);
    return [];
  }
};

export const getRequestsByEquipmentId = async (equipmentId: string, date: string): Promise<Request[]> => {
  try {
    // This is a mock implementation
    const allRequests = await getAllRequests();
    return allRequests.filter(
      request => 
        request.equipmentId === equipmentId && 
        request.date === date && 
        request.status === 'approved'
    );
  } catch (error) {
    console.error(`Error fetching requests for equipment ${equipmentId} on ${date}:`, error);
    return [];
  }
};

export const addRoomRequest = async (
  request: Omit<Request, 'id' | 'type' | 'status' | 'createdAt' | 'updatedAt' | 'adminApproval' | 'supervisorApproval' | 'returnInfo' | 'equipmentId' | 'equipmentName' | 'equipmentQuantity' | 'documentName' | 'pageCount' | 'colorPrint' | 'doubleSided' | 'copies' | 'pdfFileName'>
): Promise<Request | null> => {
  try {
    // This is a mock implementation
    return {
      id: Math.random().toString(36).substring(2, 11),
      type: 'room',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminApproval: null,
      supervisorApproval: null,
      returnInfo: null,
      equipmentId: null,
      equipmentName: null,
      equipmentQuantity: null,
      documentName: null,
      pageCount: null,
      colorPrint: null,
      doubleSided: null,
      copies: null,
      pdfFileName: null,
      ...request
    };
  } catch (error) {
    console.error('Error adding room request:', error);
    throw error;
  }
};

export const addEquipmentRequest = async (
  request: Omit<Request, 'id' | 'type' | 'status' | 'createdAt' | 'updatedAt' | 'adminApproval' | 'supervisorApproval' | 'returnInfo' | 'roomId' | 'roomName' | 'documentName' | 'pageCount' | 'colorPrint' | 'doubleSided' | 'copies' | 'pdfFileName'>
): Promise<Request | null> => {
  try {
    // In a real implementation, we would check equipment availability
    const equipment = await getEquipmentById(request.equipmentId);
    
    if (!equipment || equipment.available < request.equipmentQuantity) {
      throw new Error('Equipment not available in requested quantity');
    }

    // This is a mock implementation
    return {
      id: Math.random().toString(36).substring(2, 11),
      type: 'equipment',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminApproval: null,
      supervisorApproval: null,
      returnInfo: null,
      roomId: null,
      roomName: null,
      documentName: null,
      pageCount: null,
      colorPrint: null,
      doubleSided: null,
      copies: null,
      pdfFileName: null,
      ...request
    };
  } catch (error) {
    console.error('Error adding equipment request:', error);
    throw error;
  }
};

export const addPrintingRequest = async (
  request: Omit<Request, 'id' | 'type' | 'status' | 'createdAt' | 'updatedAt' | 'adminApproval' | 'supervisorApproval' | 'returnInfo' | 'roomId' | 'roomName' | 'equipmentId' | 'equipmentName' | 'equipmentQuantity' | 'startTime' | 'endTime'>
): Promise<Request | null> => {
  try {
    // This is a mock implementation
    return {
      id: Math.random().toString(36).substring(2, 11),
      type: 'printing',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminApproval: null,
      supervisorApproval: null,
      returnInfo: null,
      roomId: null,
      roomName: null,
      equipmentId: null,
      equipmentName: null,
      equipmentQuantity: null,
      startTime: null,
      endTime: null,
      ...request
    };
  } catch (error) {
    console.error('Error adding printing request:', error);
    throw error;
  }
};

export const updateRequestStatus = async (
  id: string, 
  status: RequestStatus,
  approverId?: string,
  approverName?: string,
  notes?: string
): Promise<Request | null> => {
  try {
    // This is a mock implementation
    const request = await getRequestById(id);
    
    if (!request) {
      throw new Error(`Request with ID ${id} not found`);
    }
    
    // Handle equipment reservation/return
    if (request.type === 'equipment' && request.equipmentId && request.equipmentQuantity) {
      const equipment = await getEquipmentById(request.equipmentId);
      
      if (equipment) {
        if (status === 'approved') {
          // Reduce available equipment
          await updateEquipment({
            id: equipment.id,
            name: equipment.name,
            category: equipment.category,
            available: Math.max(0, equipment.available - request.equipmentQuantity)
          });
        } else if (request.status === 'approved' && (status === 'rejected' || status === 'returned')) {
          // Return equipment to inventory
          await updateEquipment({
            id: equipment.id,
            name: equipment.name,
            category: equipment.category,
            available: equipment.available + request.equipmentQuantity
          });
        }
      }
    }
    
    const updatedRequest: Request = {
      ...request,
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Add approval information
    if (status === 'admin_approved' && approverId && approverName) {
      updatedRequest.adminApproval = {
        userId: approverId,
        userName: approverName,
        timestamp: new Date().toISOString(),
        notes: notes || ''
      };
    } else if (status === 'approved' && approverId && approverName) {
      updatedRequest.supervisorApproval = {
        userId: approverId,
        userName: approverName,
        timestamp: new Date().toISOString(),
        notes: notes || ''
      };
    } else if (status === 'returned' && approverId && approverName) {
      updatedRequest.returnInfo = {
        userId: approverId,
        userName: approverName,
        timestamp: new Date().toISOString(),
        notes: notes || ''
      };
    }
    
    return updatedRequest;
  } catch (error) {
    console.error(`Error updating request ${id} status to ${status}:`, error);
    throw error;
  }
};
