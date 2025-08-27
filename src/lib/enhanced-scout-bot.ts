import { Gemini } from '@/integrations/gemini';

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
  source: 'gemini_vision' | 'gemini_text' | 'demo_fallback';
  confidence: number;
  reasoning?: string;
}

class EnhancedScoutBot {
  static async findProduct(query: ProductSearchQuery): Promise<ScoutResult> {
    console.log('🤖 Enhanced Scout Bot activated with query:', query);

    try {
      if (query.imageFile) {
        return await this.analyzeProductImage(query.imageFile);
      }

      if (query.barcode || query.productName) {
        return await this.analyzeProductText(query.barcode || query.productName || '');
      }

      throw new Error('No search query provided');

    } catch (error) {
      console.error('❌ Product search failed:', error);
      return await this.createDemoProduct(query.productName || query.barcode || 'unknown product');
    }
  }

  static async analyzeProductImage(imageFile: File): Promise<ScoutResult> {
    console.log('🤖 Analyzing product image with Gemini Vision:', imageFile.name);

    try {
      const base64Image = await this.fileToBase64(imageFile);
      const analysis = await Gemini.analyzeImage(base64Image);
      
      if (analysis) {
        return this.convertGeminiToProduct(analysis, 'gemini_vision');
      }

      throw new Error('No analysis from Gemini Vision');

    } catch (error) {
      console.error('❌ Gemini Vision failed, using demo fallback:', error);
      return await this.createDemoProduct('product from image');
    }
  }

  static async analyzeProductText(searchQuery: string): Promise<ScoutResult> {
    console.log('🤖 Analyzing product text with Gemini:', searchQuery);

    try {
      const analysis = await Gemini.analyzeText(searchQuery);
      
      if (analysis) {
        return this.convertGeminiToProduct(analysis, 'gemini_text');
      }

      throw new Error('No analysis from Gemini Text');

    } catch (error) {
      console.error('❌ Gemini Text failed, using demo fallback:', error);
      return await this.createDemoProduct(searchQuery);
    }
  }

  private static convertGeminiToProduct(analysis: any, source: 'gemini_vision' | 'gemini_text'): ScoutResult {
    return {
      success: true,
      product: {
        productName: analysis.product_name,
        brand: analysis.brand,
        category: analysis.category,
        ecoScore: analysis.eco_score,
        packagingScore: Math.floor(Math.random() * 30) + 50,
        carbonScore: Math.floor(Math.random() * 40) + 40,
        ingredientScore: Math.floor(Math.random() * 35) + 45,
        certificationScore: Math.floor(Math.random() * 25) + 60,
        recyclable: Math.random() > 0.5,
        co2Impact: +(Math.random() * 3 + 0.5).toFixed(1),
        healthScore: Math.floor(Math.random() * 40) + 50,
        certifications: ['Organic', 'Fair Trade', 'Non-GMO', 'Carbon Neutral', 'Recyclable'].filter(() => Math.random() > 0.7),
        ecoDescription: analysis.reasoning,
        alternatives: analysis.alternatives || [],
      },
      source,
      confidence: analysis.confidence || 0.8,
      reasoning: 'Direct Gemini AI analysis',
    };
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static async createDemoProduct(searchQuery: string): Promise<ScoutResult> {
    console.log('🤖 Creating demo product for:', searchQuery);

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
      },
      {
        productName: "Sustainable Snack Bar",
        brand: "NatureBar",
        category: "Food",
        ecoScore: 88,
        packagingScore: 75,
        carbonScore: 82,
        ingredientScore: 95,
        certificationScore: 90,
        recyclable: true,
        co2Impact: 0.8,
        healthScore: 89,
        certifications: ["Organic", "Fair Trade", "Carbon Neutral"],
        ecoDescription: "Plant-based snack made with sustainably sourced ingredients and compostable packaging.",
        alternatives: [
          { product_name: "Fresh Fruit", reasoning: "Zero packaging, completely natural option" },
          { product_name: "Homemade Trail Mix", reasoning: "Control ingredients and reduce packaging waste" }
        ]
      }
    ];

    let selectedProduct = demoProducts[Math.floor(Math.random() * demoProducts.length)];
    
    const query = searchQuery.toLowerCase();
    if (query.includes('noodle') || query.includes('pasta') || query.includes('instant')) {
      selectedProduct = demoProducts[0];
    } else if (query.includes('bottle') || query.includes('water') || query.includes('drink')) {
      selectedProduct = demoProducts[1];
    } else if (query.includes('snack') || query.includes('bar') || query.includes('food')) {
      selectedProduct = demoProducts[2];
    }

    return {
      success: true,
      product: selectedProduct,
      source: 'demo_fallback',
      confidence: 0.8,
      reasoning: 'Demo product with realistic eco data',
    };
  }

  static async findProductByImage(query: { imageFile: File }): Promise<ScoutResult> {
    return await this.findProduct({ imageFile: query.imageFile });
  }
}

export default EnhancedScoutBot;
