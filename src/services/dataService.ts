
/**
 * COMPATIBILITY FILE
 * 
 * This file re-exports functions from their new service files to maintain backward compatibility
 * with existing imports throughout the application. New code should import directly from 
 * the appropriate service file.
 */

// Re-export user services
import { 
  getUsers, 
  getUserById, 
  getTeachers, 
  getTeachersByDepartment, 
  getTeachersByClass 
} from './users/userService';

// Re-export department services
import { 
  getDepartments, 
  addDepartment, 
  updateDepartment, 
  deleteDepartment 
} from './departments/departmentService';

// Re-export class services
import { 
  getClasses, 
  getClassById, 
  getClassesByDepartment, 
  getClassesByTeacher, 
  getTeacherClassesForReservation, 
  addTeacherClass, 
  removeClass, 
  updateClass, 
  addClass 
} from './classes/classService';

// Re-export room services
import { 
  getRooms, 
  getRoomById, 
  getAvailableRoomsByType, 
  updateRoom, 
  addRoom, 
  deleteRoom 
} from './rooms/roomService';

// Re-export equipment services
import { 
  getEquipmentList, 
  getEquipmentById, 
  getEquipmentByCategory, 
  updateEquipment, 
  addEquipment, 
  deleteEquipment 
} from './equipment/equipmentService';

// Re-export request services
import { 
  getAllRequests, 
  getRequestsByStatus, 
  getRequestsByUserId, 
  getRequestById, 
  getRequestsByRoomId, 
  getRequestsByEquipmentId, 
  addRoomRequest, 
  addEquipmentRequest, 
  addPrintingRequest, 
  updateRequestStatus 
} from './requests/requestService';

// Re-export notification services
import { 
  getNotifications, 
  getUnreadNotifications, 
  markNotificationAsRead, 
  addNotification 
} from './notifications/notificationService';

// Re-export resource update services
import { 
  getResourceUpdates, 
  addResourceUpdate 
} from './updates/resourceUpdateService';

// Re-export everything
export {
  // User services
  getUsers,
  getUserById,
  getTeachers,
  getTeachersByDepartment,
  getTeachersByClass,

  // Department services
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,

  // Class services
  getClasses,
  getClassById,
  getClassesByDepartment,
  getClassesByTeacher,
  getTeacherClassesForReservation,
  addTeacherClass,
  addClass,
  removeClass,
  updateClass,

  // Room services
  getRooms,
  getRoomById,
  getAvailableRoomsByType,
  updateRoom,
  addRoom,
  deleteRoom,

  // Equipment services
  getEquipmentList,
  getEquipmentById,
  getEquipmentByCategory,
  updateEquipment,
  addEquipment,
  deleteEquipment,

  // Request services
  getAllRequests,
  getRequestsByStatus,
  getRequestsByUserId,
  getRequestById,
  getRequestsByRoomId,
  getRequestsByEquipmentId,
  addRoomRequest,
  addEquipmentRequest,
  addPrintingRequest,
  updateRequestStatus,

  // Notification services
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  addNotification,

  // Resource update services
  getResourceUpdates,
  addResourceUpdate
};
