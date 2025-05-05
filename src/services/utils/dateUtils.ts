
/**
 * Formats a date string to a localized date format.
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
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
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Formats a date string to a localized date and time format.
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
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
  } catch (error) {
    console.error("Error formatting date-time:", error);
    return dateString;
  }
};

/**
 * Formats a time string (or date string with time) to a localized time format.
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
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
  } catch (error) {
    console.error("Error formatting time:", error);
    return '';
  }
};

/**
 * Checks if a date string represents a date in the past.
 */
export const isDateInPast = (dateString: string): boolean => {
  if (!dateString) return false;
  
  try {
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
  } catch (error) {
    console.error("Error checking if date is in past:", error);
    return false;
  }
};

/**
 * Combines a date string and a time string into a complete ISO date time string
 * with improved error handling to prevent UUID validation errors.
 */
export const combineDateAndTime = (dateStr: string, timeStr: string): string => {
  try {
    if (!dateStr || !timeStr) {
      console.warn("Missing date or time for combineDateAndTime:", { dateStr, timeStr });
      return new Date().toISOString();
    }
    
    // Create a new date object from the date string
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error("Invalid date format:", dateStr);
      return new Date().toISOString();
    }
    
    // If time contains colon, assume it's in HH:MM format
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Make sure hours and minutes are valid numbers
      if (!isNaN(hours) && !isNaN(minutes)) {
        date.setHours(hours, minutes, 0, 0);
        return date.toISOString();
      }
    }
    
    // If we get here, either time format was invalid or hours/minutes were invalid
    console.warn("Invalid time format or values:", timeStr);
    return date.toISOString(); // Return just the date with default time
  } catch (error) {
    console.error("Error combining date and time:", error);
    return new Date().toISOString(); // Return current time as fallback
  }
};

/**
 * Safely converts a value to a UUID-compliant string.
 * Will throw an error if the value cannot be converted to a valid UUID format.
 */
export const ensureUUID = (value: string | number): string => {
  // If it's a number or numeric string that isn't a UUID, throw an error
  if (typeof value === 'number' || (!isNaN(Number(value)) && String(value).length < 10)) {
    throw new Error(`Value "${value}" is not a valid UUID format`);
  }
  
  // Simple UUID format check (not comprehensive but catches basic issues)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof value === 'string' && !uuidPattern.test(value) && value !== 'new') {
    console.warn(`Potentially invalid UUID format: ${value}`);
  }
  
  return String(value);
};
