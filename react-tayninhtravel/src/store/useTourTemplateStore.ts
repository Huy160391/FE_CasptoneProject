import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TourTemplate, SpecialtyShop, TourGuide, GetTourTemplatesParams } from '../types/tour';
import { getTourTemplates, getSpecialtyShops, getTourGuides } from '../services/tourcompanyService';

interface TourTemplateCache {
  data: TourTemplate[];
  timestamp: number;
  params: GetTourTemplatesParams;
}

interface SpecialtyShopCache {
  data: SpecialtyShop[];
  timestamp: number;
  includeInactive: boolean;
}

interface TourGuideCache {
  data: TourGuide[];
  timestamp: number;
  includeInactive: boolean;
}

interface TourTemplateState {
  // Cache data
  templatesCache: TourTemplateCache | null;
  shopsCache: SpecialtyShopCache | null;
  guidesCache: TourGuideCache | null;
  
  // Loading states
  templatesLoading: boolean;
  shopsLoading: boolean;
  guidesLoading: boolean;
  
  // Cache settings
  cacheTimeout: number; // milliseconds
  
  // Actions
  getTemplates: (params?: GetTourTemplatesParams, token?: string, forceRefresh?: boolean) => Promise<TourTemplate[]>;
  getShops: (includeInactive?: boolean, token?: string, forceRefresh?: boolean) => Promise<SpecialtyShop[]>;
  getGuides: (includeInactive?: boolean, token?: string, forceRefresh?: boolean) => Promise<TourGuide[]>;
  
  // Cache management
  clearCache: () => void;
  clearTemplatesCache: () => void;
  clearShopsCache: () => void;
  clearGuidesCache: () => void;
  
  // Preload data
  preloadWizardData: (token?: string) => Promise<void>;
}

const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const isCacheValid = (timestamp: number, timeout: number): boolean => {
  return Date.now() - timestamp < timeout;
};

const paramsEqual = (params1: GetTourTemplatesParams, params2: GetTourTemplatesParams): boolean => {
  return JSON.stringify(params1) === JSON.stringify(params2);
};

export const useTourTemplateStore = create<TourTemplateState>()(
  persist(
    (set, get) => ({
      // Initial state
      templatesCache: null,
      shopsCache: null,
      guidesCache: null,
      templatesLoading: false,
      shopsLoading: false,
      guidesLoading: false,
      cacheTimeout: CACHE_TIMEOUT,

      // Get templates with caching
      getTemplates: async (params = { pageIndex: 0, pageSize: 100, includeInactive: false }, token, forceRefresh = false) => {
        const state = get();
        
        // Check cache validity
        if (!forceRefresh && 
            state.templatesCache && 
            isCacheValid(state.templatesCache.timestamp, state.cacheTimeout) &&
            paramsEqual(state.templatesCache.params, params)) {
          console.log('🎯 Using cached templates:', state.templatesCache.data.length);
          return state.templatesCache.data;
        }

        // Prevent duplicate requests
        if (state.templatesLoading) {
          console.log('⏳ Templates already loading, waiting...');
          // Wait for current request to complete
          while (get().templatesLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          const updatedState = get();
          return updatedState.templatesCache?.data || [];
        }

        try {
          set({ templatesLoading: true });
          console.log('🔄 Fetching fresh templates from API...');
          
          const response = await getTourTemplates(params, token);
          
          if (response && response.statusCode === 200 && response.data) {
            const templates = response.data;
            
            // Update cache
            set({
              templatesCache: {
                data: templates,
                timestamp: Date.now(),
                params: { ...params }
              }
            });
            
            console.log('✅ Templates cached successfully:', templates.length);
            return templates;
          } else {
            console.log('❌ Invalid templates response:', response);
            return [];
          }
        } catch (error) {
          console.error('❌ Error fetching templates:', error);
          return [];
        } finally {
          set({ templatesLoading: false });
        }
      },

      // Get specialty shops with caching
      getShops: async (includeInactive = false, token, forceRefresh = false) => {
        const state = get();
        
        // Check cache validity
        if (!forceRefresh && 
            state.shopsCache && 
            isCacheValid(state.shopsCache.timestamp, state.cacheTimeout) &&
            state.shopsCache.includeInactive === includeInactive) {
          console.log('🎯 Using cached shops:', state.shopsCache.data.length);
          return state.shopsCache.data;
        }

        // Prevent duplicate requests
        if (state.shopsLoading) {
          console.log('⏳ Shops already loading, waiting...');
          while (get().shopsLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          const updatedState = get();
          return updatedState.shopsCache?.data || [];
        }

        try {
          set({ shopsLoading: true });
          console.log('🔄 Fetching fresh shops from API...');
          
          const response = await getSpecialtyShops(includeInactive, token);
          
          if (response && response.statusCode === 200 && response.data) {
            const shops = response.data;
            
            // Update cache
            set({
              shopsCache: {
                data: shops,
                timestamp: Date.now(),
                includeInactive
              }
            });
            
            console.log('✅ Shops cached successfully:', shops.length);
            return shops;
          } else {
            console.log('❌ Invalid shops response:', response);
            return [];
          }
        } catch (error) {
          console.error('❌ Error fetching shops:', error);
          return [];
        } finally {
          set({ shopsLoading: false });
        }
      },

      // Get tour guides with caching
      getGuides: async (includeInactive = false, token, forceRefresh = false) => {
        const state = get();
        
        // Check cache validity
        if (!forceRefresh && 
            state.guidesCache && 
            isCacheValid(state.guidesCache.timestamp, state.cacheTimeout) &&
            state.guidesCache.includeInactive === includeInactive) {
          console.log('🎯 Using cached guides:', state.guidesCache.data.length);
          return state.guidesCache.data;
        }

        // Prevent duplicate requests
        if (state.guidesLoading) {
          console.log('⏳ Guides already loading, waiting...');
          while (get().guidesLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          const updatedState = get();
          return updatedState.guidesCache?.data || [];
        }

        try {
          set({ guidesLoading: true });
          console.log('🔄 Fetching fresh guides from API...');
          
          const response = await getTourGuides(includeInactive, token);
          
          if (Array.isArray(response)) {
            const guides = response;
            
            // Update cache
            set({
              guidesCache: {
                data: guides,
                timestamp: Date.now(),
                includeInactive
              }
            });
            
            console.log('✅ Guides cached successfully:', guides.length);
            return guides;
          } else {
            console.log('❌ Invalid guides response:', response);
            return [];
          }
        } catch (error) {
          console.error('❌ Error fetching guides:', error);
          return [];
        } finally {
          set({ guidesLoading: false });
        }
      },

      // Preload all wizard data
      preloadWizardData: async (token) => {
        console.log('🚀 Preloading wizard data...');
        const state = get();
        
        try {
          // Preload all data in parallel
          await Promise.all([
            state.getTemplates({ pageIndex: 0, pageSize: 100, includeInactive: false }, token),
            state.getShops(false, token),
            state.getGuides(false, token)
          ]);
          
          console.log('✅ Wizard data preloaded successfully');
        } catch (error) {
          console.error('❌ Error preloading wizard data:', error);
        }
      },

      // Cache management
      clearCache: () => {
        set({
          templatesCache: null,
          shopsCache: null,
          guidesCache: null
        });
        console.log('🗑️ All cache cleared');
      },

      clearTemplatesCache: () => {
        set({ templatesCache: null });
        console.log('🗑️ Templates cache cleared');
      },

      clearShopsCache: () => {
        set({ shopsCache: null });
        console.log('🗑️ Shops cache cleared');
      },

      clearGuidesCache: () => {
        set({ guidesCache: null });
        console.log('🗑️ Guides cache cleared');
      }
    }),
    {
      name: 'tour-template-cache',
      // Only persist cache data, not loading states
      partialize: (state) => ({
        templatesCache: state.templatesCache,
        shopsCache: state.shopsCache,
        guidesCache: state.guidesCache,
        cacheTimeout: state.cacheTimeout
      }),
    }
  )
);
