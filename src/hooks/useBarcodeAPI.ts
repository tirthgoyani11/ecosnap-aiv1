import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import EnhancedScoutBot from '@/lib/enhanced-scout-bot';

interface BarcodeResult {
  success: boolean;
  product?: {
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
    alternatives: { product_name: string; reasoning: string; }[];
  };
  error?: string;
}

export const useBarcodeAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const lookupBarcode = useCallback(async (barcode: string): Promise<BarcodeResult> => {
    if (!barcode) {
      return { success: false, error: 'No barcode provided' };
    }

    setIsLoading(true);
    
    try {
      console.log('🔍 Looking up barcode:', barcode);
      
      const scoutResult = await EnhancedScoutBot.findProduct({ barcode });
      
      if (scoutResult.success && scoutResult.product) {
        toast({
          title: "Product Found! ✅",
          description: `${scoutResult.product.productName} - Eco Score: ${scoutResult.product.ecoScore}`,
        });

        return {
          success: true,
          product: scoutResult.product,
        };
      } else {
        throw new Error(scoutResult.reasoning || 'Product not found');
      }

    } catch (error) {
      console.error('❌ Barcode lookup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lookup failed';
      
      toast({
        title: "Lookup Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage,
      };

    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const lookupProductName = useCallback(async (productName: string): Promise<BarcodeResult> => {
    if (!productName) {
      return { success: false, error: 'No product name provided' };
    }

    setIsLoading(true);
    
    try {
      console.log('🔍 Looking up product:', productName);
      
      const scoutResult = await EnhancedScoutBot.findProduct({ productName });
      
      if (scoutResult.success && scoutResult.product) {
        toast({
          title: "Product Found! ✅",
          description: `${scoutResult.product.productName} - Eco Score: ${scoutResult.product.ecoScore}`,
        });

        return {
          success: true,
          product: scoutResult.product,
        };
      } else {
        throw new Error(scoutResult.reasoning || 'Product not found');
      }

    } catch (error) {
      console.error('❌ Product lookup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lookup failed';
      
      toast({
        title: "Lookup Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage,
      };

    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    lookupBarcode,
    lookupProductName,
    isLoading,
  };
};
