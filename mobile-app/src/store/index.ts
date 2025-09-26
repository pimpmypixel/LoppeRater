import { create } from 'zustand';
import { User, Market, Stall, Rating } from '../types';
import { apiService } from '../services/api';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  
  // Market state
  markets: Market[];
  selectedMarket: Market | null;
  setMarkets: (markets: Market[]) => void;
  setSelectedMarket: (market: Market | null) => void;
  
  // Stall state
  stalls: Stall[];
  selectedStall: Stall | null;
  setStalls: (stalls: Stall[]) => void;
  setSelectedStall: (stall: Stall | null) => void;
  addStall: (stall: Stall) => void;
  
  // Rating state
  addRating: (rating: Omit<Rating, 'id' | 'createdAt'>) => void;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Location state
  userLocation: { latitude: number; longitude: number } | null;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User state
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  // Market state
  markets: [],
  selectedMarket: null,
  setMarkets: (markets) => set({ markets }),
  setSelectedMarket: (selectedMarket) => set({ selectedMarket }),
  
  // Stall state
  stalls: [],
  selectedStall: null,
  setStalls: (stalls) => set({ stalls }),
  setSelectedStall: (selectedStall) => set({ selectedStall }),
  addStall: (stall) => set((state) => ({ stalls: [...state.stalls, stall] })),
  
  // Rating state
  addRating: async (rating: Omit<Rating, 'id' | 'createdAt'>) => {
    try {
      set({ isLoading: true, error: null });
      
      // Create rating in database
      const createdRating = await apiService.createRating(rating);
      
      // Update local state with the created rating
      set((state) => {
        // Update stalls with new rating
        const updatedStalls = state.stalls.map(stall => {
          if (stall.id === rating.stallId) {
            const updatedRatings = [...stall.ratings, createdRating];
            const averageRatings = {
              selection: updatedRatings.reduce((sum, r) => sum + r.selection, 0) / updatedRatings.length,
              friendliness: updatedRatings.reduce((sum, r) => sum + r.friendliness, 0) / updatedRatings.length,
              creativity: updatedRatings.reduce((sum, r) => sum + r.creativity, 0) / updatedRatings.length,
              overall: updatedRatings.reduce((sum, r) => (r.selection + r.friendliness + r.creativity) / 3, 0) / updatedRatings.length,
            };
            
            return {
              ...stall,
              ratings: updatedRatings,
              averageRatings,
            };
          }
          return stall;
        });
        
        return { stalls: updatedStalls, isLoading: false };
      });
      
      return createdRating;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create rating';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // UI state
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Location state
  userLocation: null,
  setUserLocation: (userLocation) => set({ userLocation }),
}));