import { Client, TablesDB, Account, Storage, ID, Query, Functions } from 'appwrite';
import { ApiResponse, Market, Stall, Rating, User, Photo } from '../types';

class ApiService {
  private client: Client;
  private tablesDB: TablesDB;
  private account: Account;
  private storage: Storage;
  private functions: Functions;
  private databaseId: string;

  constructor() {
    this.databaseId = 'lopperater'; // Same as in setup script

    this.client = new Client()
      .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '');

    this.tablesDB = new TablesDB(this.client);
    this.account = new Account(this.client);
    this.storage = new Storage(this.client);
    this.functions = new Functions(this.client);
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
    const response = await this.tablesDB.listRows(
      this.databaseId,
      'markets',
      queries
    );
    return response.rows.map((row: any) => ({
      id: row.$id,
      name: row.name,
      location: {
        latitude: row.latitude || 0,
        longitude: row.longitude || 0,
        address: row.location,
        city: '',
        postalCode: ''
      },
      description: row.description,
      startDate: '', // Not in DB, default
      endDate: '',
      isActive: true,
      stalls: row.stalls || []
    }));
  }

  async getMarket(id: string): Promise<Market> {
    const row = await this.tablesDB.getRow(this.databaseId, 'markets', id);
    return {
      id: row.$id,
      name: row.name,
      location: {
        latitude: row.latitude || 0,
        longitude: row.longitude || 0,
        address: row.location,
        city: '',
        postalCode: ''
      },
      description: row.description,
      startDate: '',
      endDate: '',
      isActive: true,
      stalls: row.stalls || []
    };
  }

  async createMarket(market: Partial<Market>): Promise<Market> {
    const row = await this.tablesDB.createRow(
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
      id: row.$id,
      name: row.name,
      location: {
        latitude: row.latitude || 0,
        longitude: row.longitude || 0,
        address: row.location,
        city: '',
        postalCode: ''
      },
      description: row.description,
      startDate: '',
      endDate: '',
      isActive: true,
      stalls: []
    };
  }




  // Stall methods
  async getStalls(marketId: string): Promise<Stall[]> {
    const response = await this.tablesDB.listRows(
      this.databaseId,
      'stalls',
      [Query.equal('marketId', marketId)]
    );
    return response.rows.map((row: any) => ({
      id: row.$id,
      name: row.name,
      description: row.description,
      phone: row.phone,
      marketId: row.marketId,
      vendorId: row.vendorId,
      photos: row.photos || [],
      ratings: row.ratings || []
    }));
  }

  async createStall(stall: Partial<Stall>): Promise<Stall> {
    const row = await this.tablesDB.createRow(
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
      id: row.$id,
      name: row.name,
      description: row.description,
      phone: row.phone,
      marketId: row.marketId,
      vendorId: row.vendorId,
      photos: [],
      ratings: []
    };
  }





  // Rating methods
  async createRating(rating: Partial<Rating>): Promise<Rating> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const row = await this.tablesDB.createRow(
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
      id: row.$id,
      selection: row.selection,
      friendliness: row.friendliness,
      creativity: row.creativity,
      comment: row.comment,
      stallId: row.stallId,
      userId: row.userId,
      createdAt: row.createdAt
    };
  }

  async getStallRatings(stallId: string): Promise<Rating[]> {
    const response = await this.tablesDB.listRows(
      this.databaseId,
      'ratings',
      [Query.equal('stallId', stallId)]
    );
    return response.rows.map((row: any) => ({
      id: row.$id,
      selection: row.selection,
      friendliness: row.friendliness,
      creativity: row.creativity,
      comment: row.comment,
      stallId: row.stallId,
      userId: row.userId,
      createdAt: row.createdAt
    }));
  }




  // Photo methods
  async uploadPhoto(imageUri: string, stallId?: string, caption?: string): Promise<Photo> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Convert image URI to blob/file for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create a File object from blob
      const rawFileName = `raw_photo_${Date.now()}.jpg`;
      const file = new File([blob], rawFileName, { type: 'image/jpeg' });

      // Upload raw photo to single photos bucket
      const rawFile = await this.storage.createFile(
        'photos', // Single bucket for both raw and processed photos
        ID.unique(),
        file
      );

      // Create photo record in database with processing status
      const photoDoc = await this.tablesDB.createRow(
        this.databaseId,
        'photos',
        ID.unique(),
        {
          fileId: rawFile.$id,
          filename: rawFileName,
          mimeType: file.type,
          size: file.size,
          bucketId: 'photos', // Single bucket
          userId: user.id,
          stallId: stallId || null,
          uploadedAt: new Date().toISOString(),
          caption: caption || null,
          rawFileId: rawFile.$id, // Track raw file ID
          processingStatus: 'pending'
        }
      );

      // Call faceBlur function to process the photo
      try {
        const functionResponse = await this.functions.createExecution(
          'faceBlur', // Function ID
          JSON.stringify({
            rawFileId: rawFile.$id,
            stallId: stallId,
            userId: user.id,
            photoRecordId: photoDoc.$id
          })
        );

        // Parse the function response
        let result;
        try {
          result = JSON.parse((functionResponse as any).responseBody || (functionResponse as any).response || '{}');
        } catch (parseError) {
          console.error('Failed to parse function response:', functionResponse);
          result = {};
        }

        if (result.success) {
          // Update photo record with processed information
          await this.tablesDB.updateRow(
            this.databaseId,
            'photos',
            photoDoc.$id,
            {
              processingStatus: 'completed',
              processedFileId: result.processedFileId,
              facesDetected: result.facesDetected,
              processingCompletedAt: new Date().toISOString(),
              fileId: result.processedFileId // Update to point to processed file
            }
          );

          // Return processed photo info
          return {
            id: photoDoc.$id,
            fileId: result.processedFileId,
            filename: `processed_${rawFile.$id}.jpg`,
            mimeType: file.type,
            size: file.size,
            bucketId: 'photos', // Single bucket
            userId: user.id,
            stallId: stallId,
            uploadedAt: photoDoc.uploadedAt,
            caption: photoDoc.caption,
            url: result.processedPhotoUrl,
            rawFileId: rawFile.$id, // Original raw file ID
            processedFileId: result.processedFileId, // Processed file ID
            processingStatus: 'completed',
            facesDetected: result.facesDetected,
            processingCompletedAt: new Date().toISOString()
          };
        } else {
          // Processing failed - keep raw photo
          await this.tablesDB.updateRow(
            this.databaseId,
            'photos',
            photoDoc.$id,
            {
              processingStatus: 'failed'
            }
          );

          // Return raw photo as fallback
          const rawUrl = this.storage.getFileView('photos', rawFile.$id);
          return {
            id: photoDoc.$id,
            fileId: rawFile.$id,
            filename: rawFileName,
            mimeType: file.type,
            size: file.size,
            bucketId: 'photos', // Single bucket
            userId: user.id,
            stallId: stallId,
            uploadedAt: photoDoc.uploadedAt,
            caption: photoDoc.caption,
            url: rawUrl.toString(),
            rawFileId: rawFile.$id,
            processingStatus: 'failed'
          };
        }
      } catch (functionError) {
        console.error('Face blur function error:', functionError);

        // Update status to failed and return raw photo
        await this.tablesDB.updateRow(
          this.databaseId,
          'photos',
          photoDoc.$id,
          {
            processingStatus: 'failed'
          }
        );

        const rawUrl = this.storage.getFileView('photos', rawFile.$id);
        return {
          id: photoDoc.$id,
          fileId: rawFile.$id,
          filename: rawFileName,
          mimeType: file.type,
          size: file.size,
          bucketId: 'photos', // Single bucket
          userId: user.id,
          stallId: stallId,
          uploadedAt: photoDoc.uploadedAt,
          caption: photoDoc.caption,
          url: rawUrl.toString(),
          rawFileId: rawFile.$id,
          processingStatus: 'failed'
        };
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  }

  async getStallPhotos(stallId: string): Promise<Photo[]> {
    const response = await this.tablesDB.listRows(
      this.databaseId,
      'photos',
      [Query.equal('stallId', stallId)]
    );

    return response.rows.map((row: any) => ({
      id: row.$id,
      fileId: row.fileId,
      filename: row.filename,
      mimeType: row.mimeType,
      size: row.size,
      bucketId: row.bucketId,
      userId: row.userId,
      stallId: row.stallId,
      uploadedAt: row.uploadedAt,
      caption: row.caption,
      url: this.storage.getFileView(row.bucketId, row.fileId).toString(),
      rawFileId: row.rawFileId,
      processedFileId: row.processedFileId,
      processingStatus: row.processingStatus,
      facesDetected: row.facesDetected,
      processingStartedAt: row.processingStartedAt,
      processingCompletedAt: row.processingCompletedAt
    }));
  }

  async getUserPhotos(userId: string): Promise<Photo[]> {
    const response = await this.tablesDB.listRows(
      this.databaseId,
      'photos',
      [Query.equal('userId', userId)]
    );

    return response.rows.map((row: any) => ({
      id: row.$id,
      fileId: row.fileId,
      filename: row.filename,
      mimeType: row.mimeType,
      size: row.size,
      bucketId: row.bucketId,
      userId: row.userId,
      stallId: row.stallId,
      uploadedAt: row.uploadedAt,
      caption: row.caption,
      url: this.storage.getFileView(row.bucketId, row.fileId).toString(),
      rawFileId: row.rawFileId,
      processedFileId: row.processedFileId,
      processingStatus: row.processingStatus,
      facesDetected: row.facesDetected,
      processingStartedAt: row.processingStartedAt,
      processingCompletedAt: row.processingCompletedAt
    }));
  }

  async deletePhoto(photoId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get photo record to verify ownership and get file info
    const photoDoc = await this.tablesDB.getRow(this.databaseId, 'photos', photoId);

    if (photoDoc.userId !== user.id) {
      throw new Error('Unauthorized to delete this photo');
    }

    // Delete files from single photos bucket
    await this.storage.deleteFile('photos', photoDoc.rawFileId);
    if (photoDoc.processedFileId && photoDoc.processedFileId !== photoDoc.rawFileId) {
      await this.storage.deleteFile('photos', photoDoc.processedFileId);
    }

    // Delete from database
    await this.tablesDB.deleteRow(this.databaseId, 'photos', photoId);
  }

  // Helper methods for accessing photo URLs
  getRawPhotoUrl(fileId: string): string {
    return this.storage.getFileView('photos', fileId).toString();
  }

  getProcessedPhotoUrl(fileId: string): string {
    return this.storage.getFileView('photos', fileId).toString();
  }

  // Get both raw and processed URLs for a photo record
  getPhotoUrls(photo: Photo): { rawUrl?: string; processedUrl?: string; displayUrl: string } {
    const rawUrl = photo.rawFileId ? this.getRawPhotoUrl(photo.rawFileId) : undefined;
    const processedUrl = photo.processedFileId ? this.getProcessedPhotoUrl(photo.processedFileId) : undefined;

    // Use processed URL if available and completed, otherwise use raw URL
    const displayUrl = (photo.processingStatus === 'completed' && processedUrl) ? processedUrl : (rawUrl || photo.url || '');

    return {
      rawUrl,
      processedUrl,
      displayUrl
    };
  }
}

export const apiService = new ApiService();
export default apiService;