import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import EnhancedScoutBot from '@/lib/enhanced-scout-bot';

// This is the new, detailed product structure from our backend function
interface ProductAnalysis {
  productName: string;
  brand: string;
  category: string;
  ecoScore: number;
  packagingScore: number;
  carbonScore: number;
  ingredientScore: number;
  certificationScore: number;
  recyclable: boolean;
  co2Impact: number;
  healthScore: number;
  certifications: string[];
  ecoDescription: string;
  alternatives?: { product_name: string; reasoning: string; }[];
}

interface SearchResult {
  products: ProductAnalysis[];
  loading: boolean;
  error: string | null;
  searchMetadata: {
    source: string;
    reasoning: string;
    searchTime: number;
  } | null;
}

export const useAdvancedProductSearch = () => {
  const [searchState, setSearchState] = useState<SearchResult>({
    products: [],
    loading: false,
    error: null,
    searchMetadata: null,
  });

  const { toast } = useToast();

  const searchByImageFile = useCallback(async (imageFile: File): Promise<ProductAnalysis[]> => {
    const startTime = Date.now();
    
    setSearchState(prev => ({
      ...prev,
      products: [], // Clear previous results
      loading: true,
      error: null,
      searchMetadata: null,
    }));

    try {
      console.log('🚀 Sending file to backend for analysis:', imageFile.name);

      const scoutResult = await EnhancedScoutBot.findProductByImage({ imageFile });
      const searchTime = Date.now() - startTime;

      if (scoutResult.success && scoutResult.product) {
        const products = [scoutResult.product];
        
        setSearchState({
          products,
          loading: false,
          error: null,
          searchMetadata: {
            source: scoutResult.source,
            reasoning: scoutResult.reasoning || 'Product found',
            searchTime,
          },
        });

        // Log successful scan locally (no Supabase dependency)
        console.log('✅ Scan successful:', {
          product: scoutResult.product,
          source: scoutResult.source,
          confidence: scoutResult.confidence,
        });

        toast({
          title: "Product Analysis Complete! 🤖",
          description: `${scoutResult.product.productName} - Eco Score: ${scoutResult.product.ecoScore}`,
        });

        return products;
      } else {
        throw new Error(scoutResult.reasoning || 'No products found');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      console.error('❌ Search hook error:', error);
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      toast({
        title: "Search Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });

      return [];
    }
  }, [toast]);

  const clearSearch = useCallback(() => {
    setSearchState({
      products: [],
      loading: false,
      error: null,
      searchMetadata: null,
    });
  }, []);

  return {
    // State
    products: searchState.products,
    loading: searchState.loading,
    error: searchState.error,
    searchMetadata: searchState.searchMetadata,
    
    // Actions
    searchByImageFile,
    clearSearch,
    
    // Utilities
    hasResults: searchState.products.length > 0,
  };
};