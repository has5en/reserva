
/**
 * COMPATIBILITY FILE
 * 
 * This file re-exports functions from their new service files to maintain backward compatibility
 * with existing imports throughout the application. New code should import directly from 
 * the appropriate service file.
 */

// Re-export user services 
import { 
  getUsersByRole
} from './users/userService';

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

// Define replacement functions for backward compatibility
const getUsers = (role?: string) => getUsersByRole(role as "admin" | "supervisor" | "teacher");
const getUserById = (id: string) => {
  console.log('getUserById is deprecated. Use getUserProfile instead.');
  return null;
};
const getTeachers = () => getUsersByRole('teacher');
const getTeachersByDepartment = (departmentId: string) => {
  console.log('getTeachersByDepartment is deprecated');
  return [];
};
const getTeachersByClass = (classId: string) => {
  console.log('getTeachersByClass is deprecated');
  return [];
};
const createUser = (userData: any) => {
  console.log('Creating user:', userData);
  return Promise.resolve();
};
const updateUser = (userData: any) => {
  console.log('Updating user:', userData);
  return Promise.resolve();
};
const deleteUser = (id: string) => {
  console.log('Deleting user:', id);
  return Promise.resolve();
};

// Fonctions pour les départements (maintenues pour compatibilité mais vides)
const getDepartments = () => {
  console.log('getDepartments is deprecated. Departments feature has been removed.');
  return Promise.resolve([]);
};
const addDepartment = (department: any) => {
  console.log('addDepartment is deprecated. Departments feature has been removed.');
  return Promise.resolve(null);
};
const updateDepartment = (department: any) => {
  console.log('updateDepartment is deprecated. Departments feature has been removed.');
  return Promise.resolve(null);
};
const deleteDepartment = (id: string) => {
  console.log('deleteDepartment is deprecated. Departments feature has been removed.');
  return Promise.resolve();
};

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
  getUsersByRole,

  // Department services (maintenues pour compatibilité mais vides)
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
