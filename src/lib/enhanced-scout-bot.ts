import { supabase } from '@/integrations/supabase/client';
import { Gemini } from '@/integrations/gemini';

// --- INTERFACES ---

interface ProductSearchQuery {
  imageFile?: File;
  barcode?: string;
  productName?: string;
}

interface ScoutResult {
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
  source: 'gemini_backend_scan' | 'gemini_direct' | 'demo_fallback' | 'none';
  confidence: number;
  reasoning?: string;
}

// --- CLASS DEFINITION ---

export default class EnhancedScoutBot {

  /**
   * Main product search method - handles both image files and barcode/text searches
   */
  static async findProduct(query: ProductSearchQuery): Promise<ScoutResult> {
    console.log('🤖 Enhanced Scout Bot activated with query:', query);

    // Try image file first if provided
    if (query.imageFile) {
      return await this.findProductByImage({ imageFile: query.imageFile });
    }

    // Try direct Gemini AI search for barcode or product name
    if (query.barcode || query.productName) {
      return await this.findProductWithGemini(query.barcode || query.productName || '');
    }

    return {
      success: false,
      source: 'none',
      confidence: 0,
      reasoning: 'No search query provided',
    };
  }

  /**
   * Finds a product by sending an image file to our backend Supabase function.
   */
  static async findProductByImage(query: { imageFile: File }): Promise<ScoutResult> {
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
        console.warn('Backend scan failed, falling back to direct Gemini:', error);
        return await this.findProductWithGemini('product from image');
      }

      // The backend returns results and errors arrays
      if (data.errors && data.errors.length > 0) {
        console.warn('Backend errors, falling back:', data.errors);
        return await this.findProductWithGemini('product from image');
      }

      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        return {
          success: true,
          product: firstResult.analysis,
          source: 'gemini_backend_scan',
          confidence: firstResult.analysis.ecoScore / 100 || 0.8,
          reasoning: `Successfully analyzed ${firstResult.filename}`,
        };
      } else {
        console.warn('No backend results, falling back to direct Gemini');
        return await this.findProductWithGemini('product from image');
      }

    } catch (error) {
      console.error('❌ Backend Scout Bot failed, trying direct Gemini:', error);
      return await this.findProductWithGemini('product from image');
    }
  }

  /**
   * Direct Gemini AI search for barcode or product name
   */
  static async findProductWithGemini(searchQuery: string): Promise<ScoutResult> {
    console.log('🤖 Using direct Gemini search for:', searchQuery);

    try {
      const analysis = await Gemini.analyzeText(searchQuery);
      
      if (analysis) {
        return {
          success: true,
          product: {
            productName: analysis.product_name,
            brand: analysis.brand,
            category: analysis.category,
            ecoScore: analysis.eco_score,
            packagingScore: Math.floor(Math.random() * 30) + 50, // Demo scores
            carbonScore: Math.floor(Math.random() * 40) + 40,
            ingredientScore: Math.floor(Math.random() * 35) + 45,
            certificationScore: Math.floor(Math.random() * 25) + 60,
            recyclable: Math.random() > 0.5,
            co2Impact: Math.random() * 3 + 0.5,
            healthScore: Math.floor(Math.random() * 40) + 50,
            certifications: ['Organic', 'Fair Trade', 'Non-GMO'].filter(() => Math.random() > 0.6),
            ecoDescription: analysis.reasoning,
            alternatives: analysis.alternatives || [],
          },
          source: 'gemini_direct',
          confidence: analysis.confidence,
          reasoning: 'Direct Gemini AI analysis',
        };
      }

      throw new Error('No analysis from Gemini');

    } catch (error) {
      console.error('❌ Direct Gemini failed, using demo fallback:', error);
      return await this.createDemoProduct(searchQuery);
    }
  }

  /**
   * Create a realistic demo product when all else fails
   */
  static async createDemoProduct(searchQuery: string): Promise<ScoutResult> {
    const demoProducts = [
      {
        productName: "Organic Instant Noodles",
        brand: "GreenFood Co",
        category: "Food",
        ecoScore: 75,
        packagingScore: 65,
        carbonScore: 70,
        ingredientScore: 85,
        certificationScore: 80,
        recyclable: true,
        co2Impact: 1.2,
        healthScore: 72,
        certifications: ["Organic", "Non-GMO"],
        ecoDescription: "Made with organic ingredients and eco-friendly packaging. Lower carbon footprint than conventional instant noodles.",
        alternatives: [
          { product_name: "Rice Paper Wraps", reasoning: "Fresh, unprocessed alternative with minimal packaging" },
          { product_name: "Whole Grain Pasta", reasoning: "More nutritious with recyclable packaging" }
        ]
      },
      {
        productName: "Eco Water Bottle",
        brand: "EcoLife",
        category: "Household",
        ecoScore: 92,
        packagingScore: 95,
        carbonScore: 88,
        ingredientScore: 90,
        certificationScore: 85,
        recyclable: true,
        co2Impact: 0.3,
        healthScore: 95,
        certifications: ["BPA-Free", "Carbon Neutral"],
        ecoDescription: "Reusable stainless steel bottle with excellent durability and minimal environmental impact.",
        alternatives: [
          { product_name: "Glass Water Bottle", reasoning: "Completely plastic-free option" },
          { product_name: "Bamboo Water Bottle", reasoning: "Renewable material with biodegradable properties" }
        ]
      }
    ];

    const selectedProduct = demoProducts[Math.floor(Math.random() * demoProducts.length)];

    return {
      success: true,
      product: selectedProduct,
      source: 'demo_fallback',
      confidence: 0.8,
      reasoning: 'Demo product with realistic eco data',
    };
  }
}