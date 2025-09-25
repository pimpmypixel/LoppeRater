export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  authProvider: 'google' | 'facebook';
  roles: UserRole[];
}

export type UserRole = 'buyer' | 'seller' | 'organizer';

export interface Market {
  id: string;
  name: string;
  description?: string;
  location: Location;
  startDate: string;
  endDate: string;
  organizer?: User;
  stalls?: Stall[];
  isActive: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  postalCode?: string;
}

export interface Stall {
  id: string;
  marketId: string;
  sellerId?: string;
  location: Location;
  mobilePayNumber: string;
  photos: string[];
  ratings: Rating[];
  averageRatings: {
    selection: number;
    friendliness: number;
    creativity: number;
    overall: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  stallId: string;
  userId: string;
  selection: number; // 0-10
  friendliness: number; // 0-10
  creativity: number; // 0-10
  comment?: string;
  createdAt: string;
}

export interface NavigationParamList extends Record<string, object | undefined> {
  Welcome: undefined;
  Main: undefined;
  Markets: undefined;
  MarketDetail: { marketId: string };
  CreateStall: { marketId: string };
  CameraScreen: { type: 'stall-photo' | 'mobilepay-ocr' };
  RateStall: { stallId: string };
  Settings: undefined;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}