// Validate Danish phone number (8 digits, starting with 2-9)
export const validateDanishPhoneNumber = (phoneNumber: string): boolean => {
  const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/\+45/, '');
  const danishPhoneRegex = /^[2-9]\d{7}$/;
  return danishPhoneRegex.test(cleanNumber);
};

// Format Danish phone number for display
export const formatDanishPhoneNumber = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/\+45/, '');
  if (cleanNumber.length === 8) {
    return cleanNumber.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }
  return phoneNumber;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};

// Calculate average rating
export const calculateAverageRating = (ratings: { selection: number; friendliness: number; creativity: number }[]): number => {
  if (ratings.length === 0) return 0;
  
  const totalRating = ratings.reduce((sum, rating) => {
    return sum + rating.selection + rating.friendliness + rating.creativity;
  }, 0);
  
  return Math.round((totalRating / (ratings.length * 3)) * 100) / 100;
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// Check if a string contains a valid MobilePay number
export const extractMobilePayNumber = (text: string): string | null => {
  const phoneRegex = /[2-9]\d{7}/g;
  const matches = text.match(phoneRegex);
  
  if (matches && matches.length > 0) {
    for (const match of matches) {
      if (validateDanishPhoneNumber(match)) {
        return match;
      }
    }
  }
  
  return null;
};

// Generate encouragement messages
export const getEncouragementMessage = (ratings: { selection: number; friendliness: number; creativity: number }): string => {
  const { selection, friendliness, creativity } = ratings;
  const average = (selection + friendliness + creativity) / 3;
  
  if (average >= 8) {
    return "Fantastisk bod! Rigtig flot arbejde 🌟";
  } else if (average >= 6) {
    return "God bod med potentiale for at blive endnu bedre! 👍";
  } else if (average >= 4) {
    return "Din bod har potentiale - prøv at fokusere på færre, mere unikke ting 💡";
  } else {
    return "Tak for at deltage! Små justeringer kan gøre en stor forskel 🌱";
  }
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};