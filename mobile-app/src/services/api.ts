import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ApiResponse, Market, Stall, Rating, User } from '../types';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear it
          await SecureStore.deleteItemAsync('authToken');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(provider: 'google' | 'facebook', token: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post('/auth/login', { provider, token });
    
    if (response.data.token) {
      await SecureStore.setItemAsync('authToken', response.data.token);
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    await SecureStore.deleteItemAsync('authToken');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Market methods
  async getMarkets(params?: { 
    latitude?: number; 
    longitude?: number; 
    radius?: number; 
  }): Promise<ApiResponse<Market[]>> {
    const response = await this.client.get('/markets', { params });
    return response.data;
  }

  async getMarket(id: string): Promise<ApiResponse<Market>> {
    const response = await this.client.get(`/markets/${id}`);
    return response.data;
  }

  async createMarket(market: Partial<Market>): Promise<ApiResponse<Market>> {
    const response = await this.client.post('/markets', market);
    return response.data;
  }

  // Stall methods
  async getStalls(marketId: string): Promise<ApiResponse<Stall[]>> {
    const response = await this.client.get(`/markets/${marketId}/stalls`);
    return response.data;
  }

  async createStall(stall: Partial<Stall>): Promise<ApiResponse<Stall>> {
    const response = await this.client.post('/stalls', stall);
    return response.data;
  }

  async uploadStallPhoto(stallId: string, photoUri: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'stall-photo.jpg',
    } as any);

    const response = await this.client.post(`/stalls/${stallId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Rating methods
  async createRating(rating: Partial<Rating>): Promise<ApiResponse<Rating>> {
    const response = await this.client.post('/ratings', rating);
    return response.data;
  }

  async getStallRatings(stallId: string): Promise<ApiResponse<Rating[]>> {
    const response = await this.client.get(`/stalls/${stallId}/ratings`);
    return response.data;
  }

  // OCR methods
  async recognizeText(imageUri: string): Promise<ApiResponse<{ text: string }>> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'ocr-image.jpg',
    } as any);

    const response = await this.client.post('/ocr/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;