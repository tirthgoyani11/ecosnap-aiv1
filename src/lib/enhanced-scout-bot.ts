/**
 * Enhanced Scout Bot - Advanced Product Discovery System
 * 
 * Combines multiple APIs and intelligent fallback strategies to find products
 * Inspired by EcoSnap-AI repository patterns with our robust API integrations
 */

import { supabase } from '@/integrations/supabase/client';
import RealProductAPI from './real-product-api';

interface ScoutResult {
  success: boolean;
  product?: any;
  source: 'openfoodfacts' | 'supabase' | 'ai_analysis' | 'demo' | 'search_fallback';
  confidence: number;
  reasoning?: string;
}

interface ProductSearchQuery {
  barcode?: string;
  productName?: string;
  brand?: string;
  category?: string;
  imageData?: string;
}

export class EnhancedScoutBot {
  
  // Enhanced demo product database with realistic variety
  private static readonly DEMO_PRODUCTS = [
    // Beverages
    {
      code: '1234567890123',
      product_name: 'Coca-Cola Classic 12oz Can',
      brands: 'Coca-Cola',
      category: 'Beverages',
      eco_score: 32,
      packaging_score: 45,
      carbon_score: 25,
      ingredient_score: 20,
      certification_score: 15,
      recyclable: true,
      co2_impact: 2.1,
      health_score: 25,
      certifications: [],
      eco_description: 'High sugar content and significant environmental impact from production and packaging.',
      image_url: '/placeholder.svg',
      alternatives: [
        {
          name: 'Hint Water - Watermelon',
          brand: 'Hint',
          eco_score: 85,
          price: 1.99,
          co2_impact: 0.3,
          rating: 4.5,
          why_better: 'Zero calories, natural flavors, recyclable packaging, lower carbon footprint.',
          benefits: ['No Added Sugar', 'Natural Flavoring', 'BPA-Free'],
          improvements: { co2_reduction: 85, better_score: 53 }
        }
      ]
    },
    // Fresh Produce
    {
      code: '2345678901234',
      product_name: 'Organic Gala Apple',
      brands: 'Local Organic Farm',
      category: 'Fresh Produce',
      eco_score: 92,
      packaging_score: 95,
      carbon_score: 88,
      ingredient_score: 95,
      certification_score: 90,
      recyclable: true,
      co2_impact: 0.4,
      health_score: 95,
      certifications: ['USDA Organic', 'Non-GMO'],
      eco_description: 'Excellent sustainability with organic farming practices and minimal packaging.',
      image_url: '/placeholder.svg'
    },
    // Electronics
    {
      code: '3456789012345',
      product_name: 'iPhone 15 Pro',
      brands: 'Apple',
      category: 'Electronics',
      eco_score: 68,
      packaging_score: 75,
      carbon_score: 42,
      ingredient_score: 65,
      certification_score: 68,
      recyclable: true,
      co2_impact: 5.2,
      health_score: 70,
      certifications: ['Energy Star'],
      eco_description: 'Good sustainability efforts but high carbon footprint from manufacturing.',
      image_url: '/placeholder.svg',
      alternatives: [
        {
          name: 'Fairphone 5',
          brand: 'Fairphone',
          eco_score: 84,
          price: 699,
          co2_impact: 2.1,
          rating: 4.3,
          why_better: 'Repairable design, ethical sourcing, 8-year warranty, recycled materials.',
          benefits: ['Repairable', 'Ethical', '8-Year Warranty'],
          improvements: { co2_reduction: 60, better_score: 26 }
        }
      ]
    },
    // Food Products
    {
      code: '4567890123456',
      product_name: 'Ben & Jerry\'s Chocolate Chip Cookie Dough',
      brands: 'Ben & Jerry\'s',
      category: 'Ice Cream',
      eco_score: 58,
      packaging_score: 65,
      carbon_score: 45,
      ingredient_score: 62,
      certification_score: 70,
      recyclable: true,
      co2_impact: 3.2,
      health_score: 35,
      certifications: ['Fair Trade', 'Non-GMO'],
      eco_description: 'Fair trade ingredients but high carbon footprint from dairy and cold chain.',
      image_url: '/placeholder.svg',
      alternatives: [
        {
          name: 'Oatly Vanilla Ice Cream',
          brand: 'Oatly',
          eco_score: 76,
          price: 5.99,
          co2_impact: 1.8,
          rating: 4.2,
          why_better: 'Plant-based alternative with 60% lower carbon footprint.',
          benefits: ['Plant-Based', 'Lower CO2', 'Sustainable Oats'],
          improvements: { co2_reduction: 44, better_score: 18 }
        }
      ]
    },
    // Household Products
    {
      code: '5678901234567',
      product_name: 'Tide Liquid Laundry Detergent',
      brands: 'Tide (P&G)',
      category: 'Household',
      eco_score: 42,
      packaging_score: 35,
      carbon_score: 38,
      ingredient_score: 45,
      certification_score: 25,
      recyclable: false,
      co2_impact: 2.8,
      health_score: 65,
      certifications: [],
      eco_description: 'Conventional detergent with synthetic chemicals and non-recyclable packaging.',
      image_url: '/placeholder.svg',
      alternatives: [
        {
          name: 'Seventh Generation Free & Clear',
          brand: 'Seventh Generation',
          eco_score: 81,
          price: 8.99,
          co2_impact: 1.4,
          rating: 4.4,
          why_better: 'Plant-based formula, recyclable packaging, biodegradable ingredients.',
          benefits: ['Plant-Based', 'Biodegradable', 'Recyclable Package'],
          improvements: { co2_reduction: 50, better_score: 39 }
        }
      ]
    }
  ];

  /**
   * Main scout function - tries multiple strategies to find product data
   */
  static async findProduct(query: ProductSearchQuery): Promise<ScoutResult> {
    console.log('🔍 Enhanced Scout Bot starting search with:', query);

    // Strategy 1: Barcode lookup via OpenFoodFacts
    if (query.barcode) {
      const barcodeResult = await this.searchByBarcode(query.barcode);
      if (barcodeResult.success) {
        return barcodeResult;
      }
    }

    // Strategy 2: Product name + brand search
    if (query.productName) {
      const nameResult = await this.searchByProductName(query.productName, query.brand);
      if (nameResult.success) {
        return nameResult;
      }
    }

    // Strategy 3: AI image analysis (if image provided)
    if (query.imageData) {
      const imageResult = await this.analyzeProductImage(query.imageData);
      if (imageResult.success) {
        return imageResult;
      }
    }

    // Strategy 4: Intelligent demo matching
    const demoResult = this.findBestDemoMatch(query);
    
    return demoResult;
  }

  /**
   * Strategy 1: Search by barcode using OpenFoodFacts
   */
  private static async searchByBarcode(barcode: string): Promise<ScoutResult> {
    try {
      const product = await RealProductAPI.getProductByBarcode(barcode);
      
      if (product) {
        return {
          success: true,
          product: this.normalizeProduct(product),
          source: 'openfoodfacts',
          confidence: 0.95,
          reasoning: 'Found exact match in OpenFoodFacts database'
        };
      }

      // Try Supabase cache
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (data) {
        return {
          success: true,
          product: this.normalizeProduct(data),
          source: 'supabase',
          confidence: 0.85,
          reasoning: 'Found cached product in database'
        };
      }

    } catch (error) {
      console.warn('❌ Barcode search failed:', error);
    }

    return { success: false, source: 'openfoodfacts', confidence: 0 };
  }

  /**
   * Strategy 2: Search by product name with fuzzy matching
   */
  private static async searchByProductName(productName: string, brand?: string): Promise<ScoutResult> {
    try {
      // First try Supabase with text search
      let query = supabase
        .from('products')
        .select('*')
        .textSearch('name', productName);

      if (brand) {
        query = query.textSearch('brand', brand);
      }

      const { data } = await query.limit(1);

      if (data && data.length > 0) {
        return {
          success: true,
          product: this.normalizeProduct(data[0]),
          source: 'supabase',
          confidence: 0.8,
          reasoning: 'Found product through name search in database'
        };
      }

      // Try fuzzy matching against demo products
      const fuzzyMatch = this.fuzzyMatchDemoProducts(productName, brand);
      if (fuzzyMatch.confidence > 0.6) {
        return {
          success: true,
          product: fuzzyMatch.product,
          source: 'demo',
          confidence: fuzzyMatch.confidence,
          reasoning: 'Found similar product in demo database'
        };
      }

    } catch (error) {
      console.warn('❌ Name search failed:', error);
    }

    return { success: false, source: 'search_fallback', confidence: 0 };
  }

  /**
   * Strategy 3: Analyze product image using Gemini AI
   */
  private static async analyzeProductImage(imageData: string): Promise<ScoutResult> {
    try {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiKey) {
        return { success: false, source: 'ai_analysis', confidence: 0 };
      }

      const prompt = `
        Analyze this product image and identify:
        1. Product name
        2. Brand
        3. Category
        4. Key visible features
        5. Packaging type
        
        Return JSON: {
          "product_name": "exact name",
          "brand": "brand name", 
          "category": "category",
          "packaging": "description",
          "confidence": 0.0-1.0
        }
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageData.split(',')[1]
                }
              }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          if (analysis.confidence > 0.7) {
            // Try to find this product in our database or create enhanced demo
            const enhancedProduct = await this.enhanceProductWithAI(analysis);
            
            return {
              success: true,
              product: enhancedProduct,
              source: 'ai_analysis',
              confidence: analysis.confidence,
              reasoning: 'Product identified through AI image analysis'
            };
          }
        }
      }

    } catch (error) {
      console.warn('❌ AI image analysis failed:', error);
    }

    return { success: false, source: 'ai_analysis', confidence: 0 };
  }

  /**
   * Strategy 4: Intelligent demo matching with scoring
   */
  private static findBestDemoMatch(query: ProductSearchQuery): ScoutResult {
    let bestMatch = this.DEMO_PRODUCTS[0];
    let bestScore = 0;

    for (const product of this.DEMO_PRODUCTS) {
      let score = 0;

      // Score by product name similarity
      if (query.productName) {
        score += this.calculateTextSimilarity(query.productName, product.product_name) * 0.4;
      }

      // Score by brand similarity  
      if (query.brand) {
        score += this.calculateTextSimilarity(query.brand, product.brands) * 0.3;
      }

      // Score by category
      if (query.category) {
        score += this.calculateTextSimilarity(query.category, product.category) * 0.2;
      }

      // Boost score for popular/common products
      if (product.product_name.toLowerCase().includes('coca') || 
          product.product_name.toLowerCase().includes('apple') ||
          product.product_name.toLowerCase().includes('iphone')) {
        score += 0.1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = product;
      }
    }

    return {
      success: true,
      product: this.normalizeProduct(bestMatch),
      source: 'demo',
      confidence: Math.min(bestScore, 0.9),
      reasoning: `Best match from demo database (${Math.round(bestScore * 100)}% similarity)`
    };
  }

  /**
   * Fuzzy matching for demo products
   */
  private static fuzzyMatchDemoProducts(productName: string, brand?: string): {product: any, confidence: number} {
    let bestMatch = this.DEMO_PRODUCTS[0];
    let bestConfidence = 0;

    for (const product of this.DEMO_PRODUCTS) {
      let confidence = this.calculateTextSimilarity(productName, product.product_name);
      
      if (brand) {
        confidence = (confidence + this.calculateTextSimilarity(brand, product.brands)) / 2;
      }

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestMatch = product;
      }
    }

    return {
      product: this.normalizeProduct(bestMatch),
      confidence: bestConfidence
    };
  }

  /**
   * Calculate text similarity using simple algorithm
   */
  private static calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    const normalize = (str: string) => str.toLowerCase().trim();
    const a = normalize(text1);
    const b = normalize(text2);

    if (a === b) return 1.0;
    if (a.includes(b) || b.includes(a)) return 0.8;

    // Simple Levenshtein distance approximation
    const maxLength = Math.max(a.length, b.length);
    if (maxLength === 0) return 1.0;

    let matches = 0;
    const aWords = a.split(' ');
    const bWords = b.split(' ');

    for (const aWord of aWords) {
      for (const bWord of bWords) {
        if (aWord === bWord || aWord.includes(bWord) || bWord.includes(aWord)) {
          matches++;
          break;
        }
      }
    }

    return matches / Math.max(aWords.length, bWords.length);
  }

  /**
   * Enhance product data using AI analysis
   */
  private static async enhanceProductWithAI(basicProduct: any): Promise<any> {
    try {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiKey) {
        return this.generateEnhancedDemoProduct(basicProduct);
      }

      const prompt = `
        Create comprehensive sustainability analysis for:
        Product: ${basicProduct.product_name}
        Brand: ${basicProduct.brand}
        Category: ${basicProduct.category}
        
        Return JSON with eco scores, sustainability info, and alternatives:
        {
          "eco_score": 0-100,
          "carbon_footprint": number,
          "recyclable": boolean,
          "sustainable": boolean,
          "eco_description": "detailed explanation",
          "alternatives": [{"name": "alt name", "eco_score": number, "why_better": "reason"}]
        }
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const enhancement = JSON.parse(jsonMatch[0]);
          
          return {
            ...basicProduct,
            ...enhancement,
            source: 'ai_enhanced'
          };
        }
      }

    } catch (error) {
      console.warn('❌ AI enhancement failed, using demo:', error);
    }

    return this.generateEnhancedDemoProduct(basicProduct);
  }

  /**
   * Generate enhanced demo product from basic info
   */
  private static generateEnhancedDemoProduct(basicProduct: any): any {
    const demoBase = this.DEMO_PRODUCTS[Math.floor(Math.random() * this.DEMO_PRODUCTS.length)];
    
    return {
      ...demoBase,
      product_name: basicProduct.product_name || demoBase.product_name,
      brands: basicProduct.brand || demoBase.brands,
      category: basicProduct.category || demoBase.category,
      eco_description: `AI analysis for "${basicProduct.product_name}". This is enhanced demo data with realistic sustainability metrics.`,
      source: 'ai_enhanced_demo'
    };
  }

  /**
   * Normalize product data to consistent format
   */
  private static normalizeProduct(product: any): any {
    return {
      code: product.code || product.barcode || `demo_${Date.now()}`,
      product_name: product.product_name || product.name || 'Unknown Product',
      brands: product.brands || product.brand || 'Unknown Brand',
      categories: product.categories || product.category || 'General',
      image_url: product.image_url || '/placeholder.svg',
      eco_score: product.eco_score || 50,
      carbon_footprint: product.carbon_footprint || product.co2_impact || 1.0,
      recyclable: product.recyclable ?? true,
      sustainable: product.sustainable ?? (product.eco_score > 70),
      eco_description: product.eco_description || 'Sustainability analysis available',
      alternatives: product.alternatives || [],
      certifications: product.certifications || [],
      metadata: {
        source: product.source || 'scout_bot',
        confidence: product.confidence || 0.8,
        fetched_at: new Date().toISOString()
      }
    };
  }

  /**
   * Quick search by common product names
   */
  static async quickSearch(searchTerm: string): Promise<ScoutResult[]> {
    const results: ScoutResult[] = [];

    // Search demo products
    for (const product of this.DEMO_PRODUCTS) {
      const similarity = this.calculateTextSimilarity(searchTerm, product.product_name);
      
      if (similarity > 0.3) {
        results.push({
          success: true,
          product: this.normalizeProduct(product),
          source: 'demo',
          confidence: similarity,
          reasoning: `${Math.round(similarity * 100)}% match in demo database`
        });
      }
    }

    // Sort by confidence
    return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }
}

export default EnhancedScoutBot;
