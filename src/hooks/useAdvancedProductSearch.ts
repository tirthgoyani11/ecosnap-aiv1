/**
 * Advanced Product Search Hook
 * 
 * Uses the Enhanced Scout Bot for comprehensive product discovery
 * Supports multiple search strategies: barcode, name, image, voice, etc.
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import EnhancedScoutBot from '@/lib/enhanced-scout-bot';

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

  const searchProducts = useCallback(async (options: SearchOptions): Promise<any[]> => {
    const startTime = Date.now();
    
    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null,
      searchMetadata: null
    }));

    try {
      console.log('🔍 Advanced search started with:', options);

      let scoutResult;

      switch (options.searchType) {
        case 'barcode':
          if (!options.barcode) throw new Error('Barcode is required for barcode search');
          scoutResult = await EnhancedScoutBot.findProduct({ barcode: options.barcode });
          break;

        case 'name':
          if (!options.query) throw new Error('Product name is required for name search');
          scoutResult = await EnhancedScoutBot.findProduct({
            productName: options.query,
            brand: options.brand,
            category: options.category
          });
          break;

        case 'image':
          if (!options.imageData) throw new Error('Image data is required for image search');
          scoutResult = await EnhancedScoutBot.findProduct({ imageData: options.imageData });
          break;

        case 'category':
          // For category search, use quick search
          const quickResults = await EnhancedScoutBot.quickSearch(options.category || options.query || '');
          const products = quickResults.map(result => result.product);
          
          const searchTime = Date.now() - startTime;
          
          setSearchState({
            products,
            loading: false,
            error: null,
            searchMetadata: {
              source: 'category_search',
              confidence: quickResults[0]?.confidence || 0,
              reasoning: `Found ${products.length} products in category`,
              searchTime
            }
          });

          toast({
            title: "Category Search Complete! 📦",
            description: `Found ${products.length} products matching your criteria`,
          });

          return products;

        default:
          throw new Error(`Unsupported search type: ${options.searchType}`);
      }

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

        // Show success toast based on search type
        const searchTypeMessages = {
          barcode: "Barcode Scan Complete! 📱",
          name: "Product Search Complete! 🔍", 
          image: "AI Image Analysis Complete! 🤖",
          voice: "Voice Search Complete! 🎤"
        };

        toast({
          title: searchTypeMessages[options.searchType] || "Search Complete!",
          description: `${scoutResult.product.product_name} - ${scoutResult.reasoning}`,
        });

        return products;
      } else {
        throw new Error('No products found matching your search criteria');
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

  const searchByCategory = useCallback(async (category: string) => {
    return await searchProducts({ searchType: 'category', category });
  }, [searchProducts]);

  const quickProductSearch = useCallback(async (query: string): Promise<any[]> => {
    setSearchState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const results = await EnhancedScoutBot.quickSearch(query);
      const products = results.map(result => result.product);
      
      setSearchState({
        products,
        loading: false,
        error: null,
        searchMetadata: {
          source: 'quick_search',
          confidence: results[0]?.confidence || 0,
          reasoning: `Quick search found ${products.length} matches`,
          searchTime: 0
        }
      });

      return products;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Quick search failed';
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        searchMetadata: null
      }));

      return [];
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState({
      products: [],
      loading: false,
      error: null,
      searchMetadata: null
    });
  }, []);

  const retryLastSearch = useCallback(async (lastOptions: SearchOptions) => {
    return await searchProducts(lastOptions);
  }, [searchProducts]);

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
    searchByCategory,
    quickProductSearch,
    clearSearch,
    retryLastSearch,
    
    // Utilities
    hasResults: searchState.products.length > 0,
    isSearching: searchState.loading,
    searchCount: searchState.products.length
  };
};
