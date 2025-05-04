
/**
 * Formats a date string to a localized date format.
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Try to parse the date string
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return dateString;
  
  // Format the date based on the user's locale
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formats a date string to a localized date and time format.
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  
  // Try to parse the date string
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return dateString;
  
  // Format the date based on the user's locale
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formats a time string (or date string with time) to a localized time format.
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  // Try to parse the time string
  const date = new Date(timeString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    // If direct parsing fails, it might be just a time string (HH:MM)
    if (timeString.includes(':')) {
      return timeString;
    }
    return '';
  }
  
  // Format the time based on the user's locale
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Checks if a date string represents a date in the past.
 */
export const isDateInPast = (dateString: string): boolean => {
  if (!dateString) return false;
  
  // Try to parse the date string
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return false;
  
  // Set time to beginning of day
  date.setHours(0, 0, 0, 0);
  
  // Get current date with time set to beginning of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if date is before today
  return date < today;
};
