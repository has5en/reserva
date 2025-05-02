
export type RequestStatus = 'pending' | 'admin_approved' | 'approved' | 'rejected' | 'returned';
export type RequestType = 'room' | 'equipment' | 'printing';
export type RoomType = 'classroom' | 'training_room' | 'weapons_room' | 'tactical_room';
export type UserRole = 'admin' | 'supervisor' | 'teacher';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
  type: RoomType;
  software?: string[];
  equipment?: string[];
  description?: string;
  floor?: string;
  building?: string;
}

export interface Class {
  id: string;
  name: string;
  studentCount: number;
  unit?: string;
  departmentId: string; // Maintenu pour compatibilité mais ne sera plus utilisé
  created_at?: string;
  updated_at?: string;
}

export interface TeacherClass {
  id: string;
  teacherId: string;
  classId: string;
  className?: string;
  created_at?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  available: number;
  requires_clearance?: boolean;
  description?: string;
  location?: string;
  totalQuantity?: number;
  availableQuantity?: number;
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
  requires_commander_approval?: boolean;
  signature?: string;
  documentName?: string;
  pageCount?: number;
  colorPrint?: boolean;
  doubleSided?: boolean;
  copies?: number;
  pdfFileName?: string;
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
  returnInfo?: {
    userId: string;
    userName: string;
    timestamp: string;
    notes?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  relatedRequestId?: string;
}

export interface ResourceUpdate {
  id: string;
  resourceType: 'room' | 'equipment';
  resourceId: string;
  resourceName: string;
  updaterId: string;
  updaterName: string;
  timestamp: string;
  details: string;
  previousState: Record<string, any>;
  newState: Record<string, any>;
}

export interface User {
  id: string;
  name?: string; // Made optional
  email?: string; // Made optional
  role: UserRole;
  avatar_url?: string | null;
  unit?: string | null;
  rank?: string | null;
  telephone?: string | null;
  password?: string; // Added for MockUser compatibility
  // Add fields from the profiles table
  full_name?: string | null;
  department?: string | null;
  clearance_level?: string | null;
  created_at?: string;
  updated_at?: string;
}
