
/**
 * Enhanced Scout Bot - Gemini Powered
 * 
 * This bot uses the Gemini API as its sole engine for product discovery,
 * providing a powerful, unified analysis for images, text, and barcodes.
 */

import { Gemini } from '@/integrations/gemini';

// --- INTERFACES ---

interface ProductSearchQuery {
  barcode?: string;
  productName?: string;
  imageData?: string; // Base64 encoded image
}

interface ScoutResult {
  success: boolean;
  product?: any;
  source: 'gemini_vision' | 'gemini_text' | 'none';
  confidence: number;
  reasoning?: string;
}

// --- CLASS DEFINITION ---

export default class EnhancedScoutBot {

  /**
   * Main entry point for finding a product using the Gemini API.
   * It intelligently decides whether to use vision or text analysis.
   */
  static async findProduct(query: ProductSearchQuery): Promise<ScoutResult> {
    console.log('🤖 Gemini Scout Bot activated with query:', query);

    try {
      let analysisResult = null;
      let source: 'gemini_vision' | 'gemini_text' = 'gemini_text';

      // 1. Image Analysis (Highest Priority)
      if (query.imageData) {
        source = 'gemini_vision';
        analysisResult = await Gemini.analyzeImage(query.imageData);
      } 
      // 2. Text/Barcode Analysis
      else if (query.productName || query.barcode) {
        source = 'gemini_text';
        const textQuery = query.productName || query.barcode!;
        analysisResult = await Gemini.analyzeText(textQuery);
      } 
      // No valid query
      else {
        throw new Error("No valid query provided. Please supply an image, product name, or barcode.");
      }

      if (analysisResult) {
        return {
          success: true,
          product: {
            // Ensure the product object has all the fields the UI expects
            ...analysisResult,
            product_name: analysisResult.product_name || 'Unknown Product',
            eco_score: analysisResult.eco_score || 50,
          },
          source: source,
          confidence: analysisResult.confidence || 0.5,
          reasoning: analysisResult.reasoning || 'Analysis complete.'
        };
      } else {
        throw new Error("Gemini analysis returned no result.");
      }

    } catch (error) {
      console.error('❌ Gemini Scout Bot failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        success: false,
        source: 'none',
        confidence: 0,
        reasoning: errorMessage
      };
    }
  }

  /**
   * Performs a quick search for multiple products based on a query.
   * This can be used for category browsing or finding alternatives.
   */
  static async quickSearch(query: string): Promise<ScoutResult[]> {
    console.log(`🤖 Gemini Quick Search for: ${query}`);
    
    // This is a simplified implementation. For a real multi-product search,
    // the Gemini prompt would need to be adjusted to return an array of products.
    // For now, we will just do a single text search and return it as an array.
    
    const result = await this.findProduct({ productName: query });

    if (result.success && result.product) {
      // The UI expects an array, so we wrap the single result
      return [result];
    }

    return [];
  }
}
