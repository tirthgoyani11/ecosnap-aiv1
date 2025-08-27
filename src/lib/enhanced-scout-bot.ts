import { supabase } from '@/integrations/supabase/client';

// --- INTERFACES ---

// This query now expects a File object for the new backend function
interface ProductSearchQuery {
  imageFile: File;
}

// The ScoutResult will now contain the detailed analysis from the new function
interface ScoutResult {
  success: boolean;
  product?: any; // This will be the detailed analysis object
  source: 'gemini_backend_scan' | 'none';
  confidence: number; // The new backend doesn't provide this, so we'll use a default
  reasoning?: string;
}

// --- CLASS DEFINITION ---

export default class EnhancedScoutBot {

  /**
   * Finds a product by sending an image file to our backend Supabase function.
   */
  static async findProductByImage(query: ProductSearchQuery): Promise<ScoutResult> {
    console.log('🤖 Activating backend scout bot with file:', query.imageFile.name);

    if (!query.imageFile) {
      throw new Error("An image file must be provided.");
    }

    const formData = new FormData();
    formData.append('files', query.imageFile);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-bulk-scan', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      // The backend returns results and errors arrays
      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0].error || 'Backend failed to process image.');
      }

      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        return {
          success: true,
          product: firstResult.analysis, // The detailed analysis is the new product object
          source: 'gemini_backend_scan',
          confidence: firstResult.analysis.ecoScore / 100 || 0.8, // Use ecoScore as a proxy
          reasoning: `Successfully analyzed ${firstResult.filename}`,
        };
      } else {
        throw new Error("Backend analysis returned no results.");
      }

    } catch (error) {
      console.error('❌ Backend Scout Bot failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        success: false,
        source: 'none',
        confidence: 0,
        reasoning: errorMessage,
      };
    }
  }

  /**
   * @deprecated Text and barcode search are no longer supported on the client-side.
   * All analysis is now done via image through the backend.
   */
  static async findProduct() {
    throw new Error("This method is deprecated. Use findProductByImage instead.");
  }

  /**
   * @deprecated Quick search is no longer supported.
   */
  static async quickSearch() {
    throw new Error("This method is deprecated.");
  }
}