import { Client, Databases, Account, Storage, ID, Query } from 'appwrite';
import { ApiResponse, Market, Stall, Rating, User } from '../types';

class ApiService {
  private client: Client;
  private databases: Databases;
  private account: Account;
  private storage: Storage;
  private databaseId: string;

  constructor() {
    this.databaseId = 'lopperater'; // Same as in setup script

    this.client = new Client()
      .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '');

    this.databases = new Databases(this.client);
    this.account = new Account(this.client);
    this.storage = new Storage(this.client);
  }

  // Auth methods
  async login(provider: 'google' | 'github'): Promise<User> {
    try {
      await this.account.createOAuth2Session(
        provider as any,
        'lopperater://', // Redirect URL
        'lopperater://' // Failure URL
      );
      const user = await this.account.get();
      return {
        id: user.$id,
        email: user.email,
        name: user.name,
        profileImage: user.prefs?.avatar || null,
        authProvider: provider,
        role: user.prefs?.role || 'user'
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.account.deleteSession('current');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.account.get();
      return {
        id: user.$id,
        email: user.email,
        name: user.name,
        profileImage: user.prefs?.avatar || null,
        authProvider: 'google', // default
        role: user.prefs?.role || 'user'
      };
    } catch {
      return null;
    }
  }

  // Market methods
  async getMarkets(params?: { 
    latitude?: number; 
    longitude?: number; 
    radius?: number; 
  }): Promise<Market[]> {
    const queries: any[] = [];
    if (params?.latitude && params?.longitude && params?.radius) {
      // Note: Appwrite doesn't have geo queries built-in, might need custom logic
    }
    const response = await this.databases.listDocuments(
      this.databaseId,
      'markets',
      queries
    );
    return response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      location: {
        latitude: doc.latitude || 0,
        longitude: doc.longitude || 0,
        address: doc.location,
        city: '',
        postalCode: ''
      },
      description: doc.description,
      startDate: '', // Not in DB, default
      endDate: '',
      isActive: true,
      stalls: doc.stalls || []
    }));
  }

  async getMarket(id: string): Promise<Market> {
    const doc = await this.databases.getDocument(this.databaseId, 'markets', id);
    return {
      id: doc.$id,
      name: doc.name,
      location: {
        latitude: doc.latitude || 0,
        longitude: doc.longitude || 0,
        address: doc.location,
        city: '',
        postalCode: ''
      },
      description: doc.description,
      startDate: '',
      endDate: '',
      isActive: true,
      stalls: doc.stalls || []
    };
  }

  async createMarket(market: Partial<Market>): Promise<Market> {
    const doc = await this.databases.createDocument(
      this.databaseId,
      'markets',
      ID.unique(),
      {
        name: market.name,
        location: market.location?.address,
        description: market.description,
        latitude: market.location?.latitude,
        longitude: market.location?.longitude
      }
    );
    return {
      id: doc.$id,
      name: doc.name,
      location: {
        latitude: doc.latitude || 0,
        longitude: doc.longitude || 0,
        address: doc.location,
        city: '',
        postalCode: ''
      },
      description: doc.description,
      startDate: '',
      endDate: '',
      isActive: true,
      stalls: []
    };
  }

  // Stall methods
  async getStalls(marketId: string): Promise<Stall[]> {
    const response = await this.databases.listDocuments(
      this.databaseId,
      'stalls',
      [Query.equal('marketId', marketId)]
    );
    return response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      description: doc.description,
      phone: doc.phone,
      marketId: doc.marketId,
      vendorId: doc.vendorId,
      photos: doc.photos || [],
      ratings: doc.ratings || []
    }));
  }

  async createStall(stall: Partial<Stall>): Promise<Stall> {
    const doc = await this.databases.createDocument(
      this.databaseId,
      'stalls',
      ID.unique(),
      {
        name: stall.name,
        description: stall.description,
        phone: stall.phone,
        marketId: stall.marketId,
        vendorId: stall.vendorId
      }
    );
    return {
      id: doc.$id,
      name: doc.name,
      description: doc.description,
      phone: doc.phone,
      marketId: doc.marketId,
      vendorId: doc.vendorId,
      photos: [],
      ratings: []
    };
  }

  // Rating methods
  async createRating(rating: Partial<Rating>): Promise<Rating> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const doc = await this.databases.createDocument(
      this.databaseId,
      'ratings',
      ID.unique(),
      {
        selection: rating.selection,
        friendliness: rating.friendliness,
        creativity: rating.creativity,
        comment: rating.comment,
        stallId: rating.stallId,
        userId: user.id,
        createdAt: new Date().toISOString()
      }
    );
    return {
      id: doc.$id,
      selection: doc.selection,
      friendliness: doc.friendliness,
      creativity: doc.creativity,
      comment: doc.comment,
      stallId: doc.stallId,
      userId: doc.userId,
      createdAt: doc.createdAt
    };
  }

  async getStallRatings(stallId: string): Promise<Rating[]> {
    const response = await this.databases.listDocuments(
      this.databaseId,
      'ratings',
      [Query.equal('stallId', stallId)]
    );
    return response.documents.map(doc => ({
      id: doc.$id,
      selection: doc.selection,
      friendliness: doc.friendliness,
      creativity: doc.creativity,
      comment: doc.comment,
      stallId: doc.stallId,
      userId: doc.userId,
      createdAt: doc.createdAt
    }));
  }

  // OCR methods - keeping simple, could use Appwrite Functions for actual OCR
  async recognizeText(imageUri: string): Promise<{ text: string }> {
    // Mock OCR for now, replace with actual implementation
    return { text: 'Mock OCR result: +45 12 34 56 78' };
  }
}

export const apiService = new ApiService();
export default apiService;