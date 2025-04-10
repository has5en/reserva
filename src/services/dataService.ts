
import { MOCK_ROOMS, MOCK_CLASSES, MOCK_EQUIPMENT, MOCK_REQUESTS } from '@/data/mockData';
import { Room, Class, Equipment, Request, RequestStatus } from '@/data/models';

// Function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

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
export const getRooms = (): Promise<Room[]> => {
  return Promise.resolve([...MOCK_ROOMS]);
};

export const getRoomById = (id: string): Promise<Room | undefined> => {
  return Promise.resolve(MOCK_ROOMS.find(room => room.id === id));
};

export const getAvailableRooms = (date: string, startTime: string, endTime: string): Promise<Room[]> => {
  // In a real application, this would check against existing reservations
  return Promise.resolve([...MOCK_ROOMS.filter(room => room.available)]);
};

// Class services
export const getClasses = (): Promise<Class[]> => {
  return Promise.resolve([...MOCK_CLASSES]);
};

export const getClassesByDepartment = (department: string): Promise<Class[]> => {
  return Promise.resolve(MOCK_CLASSES.filter(cls => cls.department === department));
};

export const getClassById = (id: string): Promise<Class | undefined> => {
  return Promise.resolve(MOCK_CLASSES.find(cls => cls.id === id));
};

// Equipment services
export const getEquipment = (): Promise<Equipment[]> => {
  return Promise.resolve([...MOCK_EQUIPMENT]);
};

export const getEquipmentById = (id: string): Promise<Equipment | undefined> => {
  return Promise.resolve(MOCK_EQUIPMENT.find(equip => equip.id === id));
};

export const getAvailableEquipment = (): Promise<Equipment[]> => {
  return Promise.resolve(MOCK_EQUIPMENT.filter(equip => equip.available > 0));
};

// Request services
let requests = [...MOCK_REQUESTS];

export const getRequests = (): Promise<Request[]> => {
  return Promise.resolve([...requests]);
};

export const getRequestById = (id: string): Promise<Request | undefined> => {
  return Promise.resolve(requests.find(req => req.id === id));
};

export const getRequestsByUserId = (userId: string): Promise<Request[]> => {
  return Promise.resolve(requests.filter(req => req.userId === userId));
};

export const getRequestsByStatus = (status: RequestStatus): Promise<Request[]> => {
  return Promise.resolve(requests.filter(req => req.status === status));
};

export const createRequest = (request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request> => {
  const now = new Date().toISOString();
  const newRequest: Request = {
    ...request,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
  
  requests.push(newRequest);
  return Promise.resolve(newRequest);
};

export const updateRequestStatus = (
  id: string, 
  status: RequestStatus, 
  approverId: string, 
  approverName: string,
  notes?: string
): Promise<Request> => {
  const now = new Date().toISOString();
  
  const updatedRequests = requests.map(req => {
    if (req.id === id) {
      const updatedRequest: Request = {
        ...req,
        status,
        updatedAt: now
      };
      
      if (status === 'admin_approved') {
        updatedRequest.adminApproval = {
          userId: approverId,
          userName: approverName,
          timestamp: now,
          notes
        };
      } else if (status === 'approved' || status === 'rejected') {
        updatedRequest.supervisorApproval = {
          userId: approverId,
          userName: approverName,
          timestamp: now,
          notes
        };
      }
      
      return updatedRequest;
    }
    return req;
  });
  
  requests = updatedRequests;
  return Promise.resolve(requests.find(req => req.id === id)!);
};
