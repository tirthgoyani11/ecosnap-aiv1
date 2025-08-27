/**
 * Advanced Product Search Hook - Refactored for Gemini-only Bot
 * 
 * This hook now uses the simplified, Gemini-powered Enhanced Scout Bot and
 * adds functionality to store scan history in Supabase.
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import EnhancedScoutBot from '@/lib/enhanced-scout-bot';
import { supabase } from '@/integrations/supabase'; // Import supabase client

// SearchOptions remains the same for UI compatibility
interface SearchOptions {
  searchType: 'barcode' | 'name' | 'image' | 'voice' | 'category';
  query?: string;
  brand?: string;
  category?: string;
  imageData?: string;
  barcode?: string;
}

interface SearchResult {
  products: any[];
  loading: boolean;
  error: string | null;
  searchMetadata: {
    source: string;
    confidence: number;
    reasoning: string;
    searchTime: number;
  } | null;
}

export const useAdvancedProductSearch = () => {
  const [searchState, setSearchState] = useState<SearchResult>({
    products: [],
    loading: false,
    error: null,
    searchMetadata: null
  });

  const { toast } = useToast();

  // The core search logic is now much simpler
  const searchProducts = useCallback(async (options: SearchOptions): Promise<any[]> => {
    const startTime = Date.now();
    
    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null,
      searchMetadata: null
    }));

    try {
      console.log('🔍 Gemini search started with:', options);

      // The new bot handles all logic internally, so we just pass the query
      const scoutResult = await EnhancedScoutBot.findProduct({
        barcode: options.barcode,
        productName: options.query,
        imageData: options.imageData
      });

      const searchTime = Date.now() - startTime;

      if (scoutResult.success && scoutResult.product) {
        const products = [scoutResult.product];
        
        setSearchState({
          products,
          loading: false,
          error: null,
          searchMetadata: {
            source: scoutResult.source,
            confidence: scoutResult.confidence,
            reasoning: scoutResult.reasoning || 'Product found',
            searchTime
          }
        });

        // --- NEW: Save to Scan History ---
        try {
          // We won't wait for this to complete to keep the UI fast
          supabase.from('scan_history').insert({
            // user_id: supabase.auth.user()?.id, // Uncomment when auth is implemented
            product_data: scoutResult.product,
            source: scoutResult.source,
            confidence: scoutResult.confidence
          }).then(({ error }) => {
            if (error) console.error("Failed to save scan history:", error);
          });
        } catch (e) {
          console.error("Supabase history insert failed:", e);
        }
        // ------------------------------------

        toast({
          title: "AI Analysis Complete! 🤖",
          description: `${scoutResult.product.product_name} - ${scoutResult.reasoning}`,
        });

        return products;
      } else {
        // Use the reasoning from the bot as the error message
        throw new Error(scoutResult.reasoning || 'No products found matching your search criteria');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      console.error('❌ Advanced search error:', error);
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        searchMetadata: {
          source: 'error',
          confidence: 0,
          reasoning: errorMessage,
          searchTime: Date.now() - startTime
        }
      }));

      toast({
        title: "Search Failed ❌",
        description: errorMessage,
        variant: "destructive"
      });

      return [];
    }
  }, [toast]);

  // The individual search functions are kept for compatibility with the SmartScanner component
  const searchByBarcode = useCallback(async (barcode: string) => {
    return await searchProducts({ searchType: 'barcode', barcode });
  }, [searchProducts]);

  const searchByName = useCallback(async (productName: string, brand?: string, category?: string) => {
    return await searchProducts({ 
      searchType: 'name', 
      query: productName, 
      brand, 
      category 
    });
  }, [searchProducts]);

  const searchByImage = useCallback(async (imageData: string) => {
    return await searchProducts({ searchType: 'image', imageData });
  }, [searchProducts]);

  // Refactor quickProductSearch to use the main search logic
  const quickProductSearch = useCallback(async (query: string): Promise<any[]> => {
    return await searchProducts({ searchType: 'name', query });
  }, [searchProducts]);

  const clearSearch = useCallback(() => {
    setSearchState({
      products: [],
      loading: false,
      error: null,
      searchMetadata: null
    });
  }, []);

  return {
    // State
    products: searchState.products,
    loading: searchState.loading,
    error: searchState.error,
    searchMetadata: searchState.searchMetadata,
    
    // Actions
    searchProducts,
    searchByBarcode,
    searchByName,
    searchByImage,
    quickProductSearch, // Keep for compatibility, now aliases searchByName
    clearSearch,
    
    // Utilities
    hasResults: searchState.products.length > 0,
    isSearching: searchState.loading,
    searchCount: searchState.products.length
  };
};
