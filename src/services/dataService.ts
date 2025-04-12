
import { MOCK_ROOMS, MOCK_CLASSES, MOCK_EQUIPMENT, MOCK_REQUESTS } from '@/data/mockData';
import { Room, Class, Equipment, Request, RequestStatus, Notification } from '@/data/models';

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

export const getAvailableRoomsByType = (date: string, startTime: string, endTime: string, roomType?: string): Promise<Room[]> => {
  let rooms = [...MOCK_ROOMS.filter(room => room.available)];
  
  if (roomType) {
    rooms = rooms.filter(room => room.type === roomType);
  }
  
  return Promise.resolve(rooms);
};

// Room management functions
export const updateRoom = (id: string, updates: Partial<Room>): Promise<Room> => {
  const roomIndex = MOCK_ROOMS.findIndex(room => room.id === id);
  if (roomIndex === -1) {
    return Promise.reject(new Error('Room not found'));
  }
  
  MOCK_ROOMS[roomIndex] = {
    ...MOCK_ROOMS[roomIndex],
    ...updates
  };
  
  return Promise.resolve(MOCK_ROOMS[roomIndex]);
};

export const addRoom = (room: Omit<Room, 'id'>): Promise<Room> => {
  const newRoom: Room = {
    ...room,
    id: generateId()
  };
  
  MOCK_ROOMS.push(newRoom);
  return Promise.resolve(newRoom);
};

export const deleteRoom = (id: string): Promise<void> => {
  const roomIndex = MOCK_ROOMS.findIndex(room => room.id === id);
  if (roomIndex === -1) {
    return Promise.reject(new Error('Room not found'));
  }
  
  MOCK_ROOMS.splice(roomIndex, 1);
  return Promise.resolve();
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

// Equipment management functions
export const updateEquipment = (id: string, updates: Partial<Equipment>): Promise<Equipment> => {
  const equipmentIndex = MOCK_EQUIPMENT.findIndex(equip => equip.id === id);
  if (equipmentIndex === -1) {
    return Promise.reject(new Error('Equipment not found'));
  }
  
  MOCK_EQUIPMENT[equipmentIndex] = {
    ...MOCK_EQUIPMENT[equipmentIndex],
    ...updates
  };
  
  return Promise.resolve(MOCK_EQUIPMENT[equipmentIndex]);
};

export const addEquipment = (equipment: Omit<Equipment, 'id'>): Promise<Equipment> => {
  const newEquipment: Equipment = {
    ...equipment,
    id: generateId()
  };
  
  MOCK_EQUIPMENT.push(newEquipment);
  return Promise.resolve(newEquipment);
};

export const deleteEquipment = (id: string): Promise<void> => {
  const equipmentIndex = MOCK_EQUIPMENT.findIndex(equip => equip.id === id);
  if (equipmentIndex === -1) {
    return Promise.reject(new Error('Equipment not found'));
  }
  
  MOCK_EQUIPMENT.splice(equipmentIndex, 1);
  return Promise.resolve();
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

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: 'teacher1',
    title: 'Demande approuvée',
    message: 'Votre demande de réservation de la salle A101 a été approuvée.',
    read: false,
    type: 'success',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    relatedRequestId: 'req1'
  },
  {
    id: '2',
    userId: 'teacher1',
    title: 'Demande rejetée',
    message: 'Votre demande de matériel a été rejetée. Veuillez consulter les détails.',
    read: true,
    type: 'error',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    relatedRequestId: 'req2'
  },
  {
    id: '3',
    userId: 'teacher2',
    title: 'Nouveau système',
    message: 'Bienvenue dans le nouveau système de gestion des ressources.',
    read: false,
    type: 'info',
    timestamp: new Date(Date.now() - 172800000).toISOString()
  }
];

let notifications = [...MOCK_NOTIFICATIONS];

// Notification services
export const getNotificationsByUserId = (userId: string): Promise<Notification[]> => {
  return Promise.resolve(notifications.filter(n => n.userId === userId));
};

export const markNotificationAsRead = (id: string): Promise<void> => {
  const notificationIndex = notifications.findIndex(n => n.id === id);
  if (notificationIndex === -1) {
    return Promise.reject(new Error('Notification not found'));
  }
  
  notifications[notificationIndex] = {
    ...notifications[notificationIndex],
    read: true
  };
  
  return Promise.resolve();
};

export const markAllNotificationsAsRead = (userId: string): Promise<void> => {
  notifications = notifications.map(n => 
    n.userId === userId ? { ...n, read: true } : n
  );
  
  return Promise.resolve();
};

export const clearAllNotifications = (userId: string): Promise<void> => {
  notifications = notifications.filter(n => n.userId !== userId);
  return Promise.resolve();
};

export const createNotification = (notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> => {
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    timestamp: new Date().toISOString()
  };
  
  notifications.push(newNotification);
  return Promise.resolve(newNotification);
};
