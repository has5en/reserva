
export type RequestStatus = 'pending' | 'admin_approved' | 'approved' | 'rejected';
export type RequestType = 'room' | 'equipment' | 'printing';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
  software?: string[];
  equipment?: string[];
  department?: string;
}

export interface Class {
  id: string;
  name: string;
  studentCount: number;
  department: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  available: number;
  department?: string;
}

export interface Request {
  id: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  roomId?: string;
  roomName?: string;
  equipmentId?: string;
  equipmentName?: string;
  equipmentQuantity?: number;
  classId: string;
  className: string;
  startTime?: string;
  endTime?: string;
  date: string;
  notes?: string;
  signature?: string;
  adminApproval?: {
    userId: string;
    userName: string;
    timestamp: string;
    notes?: string;
  };
  supervisorApproval?: {
    userId: string;
    userName: string;
    timestamp: string;
    notes?: string;
  };
}
