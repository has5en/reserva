
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/data/models';

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    return [
      {
        id: '1',
        userId,
        title: 'Notification test',
        message: 'This is a test notification',
        read: false,
        type: 'info',
        timestamp: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error(`Error fetching notifications:`, error);
    return [];
  }
};

export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
  return getNotifications(userId);
};

export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  const notifications = await getNotifications(userId);
  return notifications.filter(notification => !notification.read);
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  console.log(`Marking notification ${id} as read`);
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  console.log(`Marking all notifications as read for user ${userId}`);
};

export const clearAllNotifications = async (userId: string): Promise<void> => {
  console.log(`Clearing all notifications for user ${userId}`);
};

export const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>): Promise<void> => {
  console.log('Adding notification:', notification);
};
