export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  authProvider: 'google' | 'github';
  role: string;
}

export interface Market {
  id: string;
  name: string;
  description?: string;
  location: Location;
  startDate: string;
  endDate: string;
  isActive: boolean;
  stalls?: Stall[];
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
  name: string;
  description?: string;
  phone?: string;
  marketId: string;
  vendorId: string;
  photos: string[];
  ratings: Rating[];
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

export interface Photo {
  id: string;
  fileId: string;
  filename: string;
  mimeType: string;
  size: number;
  bucketId: string;
  userId: string;
  stallId?: string;
  uploadedAt: string;
  caption?: string;
  url?: string; // For display purposes
  // Photo processing fields
  rawFileId?: string;
  processedFileId?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  facesDetected?: number;
  processingStartedAt?: string;
  processingCompletedAt?: string;
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