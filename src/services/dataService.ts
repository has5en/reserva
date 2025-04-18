
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
  getTeachersByClass,
  createUser,
  updateUser,
  deleteUser
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
  addClass,
  deleteClass
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
  getEquipment,
  getEquipmentList,
  getEquipmentById, 
  getEquipmentByCategory,
  getAvailableEquipment,
  updateEquipment, 
  addEquipment, 
  deleteEquipment 
} from './equipment/equipmentService';

// Re-export request services
import { 
  getAllRequests,
  getRequests,
  getRequestsByStatus, 
  getRequestsByUserId, 
  getRequestById,
  getRequest,
  getRequestsByRoomId, 
  getRequestsByEquipmentId, 
  addRoomRequest, 
  addEquipmentRequest, 
  addPrintingRequest,
  createRequest,
  updateRequest,
  updateRequestStatus 
} from './requests/requestService';

// Re-export notification services
import { 
  getNotifications,
  getNotificationsByUserId,
  getUnreadNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  addNotification 
} from './notifications/notificationService';

// Re-export resource update services
import { 
  getResourceUpdates,
  addResourceUpdate
} from './updates/resourceUpdateService';

// Re-export utility functions
import {
  formatDate,
  formatDateTime
} from './utils/dateUtils';

// Re-export everything
export {
  // User services
  getUsers,
  getUserById,
  getTeachers,
  getTeachersByDepartment,
  getTeachersByClass,
  createUser,
  updateUser,
  deleteUser,

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
  deleteClass,

  // Room services
  getRooms,
  getRoomById,
  getAvailableRoomsByType,
  updateRoom,
  addRoom,
  deleteRoom,

  // Equipment services
  getEquipment,
  getEquipmentList,
  getEquipmentById,
  getEquipmentByCategory,
  getAvailableEquipment,
  updateEquipment,
  addEquipment,
  deleteEquipment,

  // Request services
  getAllRequests,
  getRequests,
  getRequestsByStatus,
  getRequestsByUserId,
  getRequestById,
  getRequest,
  getRequestsByRoomId,
  getRequestsByEquipmentId,
  addRoomRequest,
  addEquipmentRequest,
  addPrintingRequest,
  createRequest,
  updateRequest,
  updateRequestStatus,

  // Notification services
  getNotifications,
  getNotificationsByUserId,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  addNotification,

  // Resource update services
  getResourceUpdates,
  addResourceUpdate,

  // Utility functions
  formatDate,
  formatDateTime
};
