import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useTourTemplateStore } from '../store/useTourTemplateStore';

/**
 * Hook để preload wizard data khi user vào trang
 * Sẽ tự động fetch và cache tour templates, specialty shops, và tour guides
 */
export const usePreloadWizardData = () => {
  const { token, isAuthenticated } = useAuthStore();
  const { preloadWizardData, templatesCache, shopsCache, guidesCache } = useTourTemplateStore();

  useEffect(() => {
    // Chỉ preload khi user đã authenticated và có token
    if (isAuthenticated && token) {
      console.log('🚀 Starting wizard data preload...');
      
      // Kiểm tra xem có cache nào đã hết hạn không
      const now = Date.now();
      const cacheTimeout = 5 * 60 * 1000; // 5 minutes
      
      const needsTemplates = !templatesCache || (now - templatesCache.timestamp) > cacheTimeout;
      const needsShops = !shopsCache || (now - shopsCache.timestamp) > cacheTimeout;
      const needsGuides = !guidesCache || (now - guidesCache.timestamp) > cacheTimeout;
      
      if (needsTemplates || needsShops || needsGuides) {
        console.log('📦 Cache expired or missing, preloading fresh data...');
        console.log('  - Templates needed:', needsTemplates);
        console.log('  - Shops needed:', needsShops);
        console.log('  - Guides needed:', needsGuides);
        
        preloadWizardData(token).then(() => {
          console.log('✅ Wizard data preload completed');
        }).catch((error) => {
          console.error('❌ Wizard data preload failed:', error);
        });
      } else {
        console.log('✅ Wizard data already cached and fresh');
      }
    }
  }, [isAuthenticated, token, preloadWizardData, templatesCache, shopsCache, guidesCache]);

  return {
    isPreloaded: !!(templatesCache && shopsCache && guidesCache),
    templatesCount: templatesCache?.data?.length || 0,
    shopsCount: shopsCache?.data?.length || 0,
    guidesCount: guidesCache?.data?.length || 0
  };
};
