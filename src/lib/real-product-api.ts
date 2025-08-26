/**
 * Real Product API Service
 * Integrates with OpenFoodFacts, Gemini AI, and other real APIs
 */

interface ProductApiResponse {
  product: {
    code: string;
    product_name: string;
    brands: string;
    image_url: string;
    image_front_url?: string;
    ingredients_text?: string;
    categories: string;
    nutriscore_grade?: string;
    ecoscore_score?: number;
    ecoscore_grade?: string;
    packaging?: string;
    labels?: string;
    countries?: string;
    manufacturing_places?: string;
  };
  status: number;
  status_verbose: string;
}

interface UnsplashImage {
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
  };
  alt_description: string;
}

export class RealProductAPI {
  private static readonly OPENFOODFACTS_BASE = 'https://world.openfoodfacts.org/api/v2/product';
  private static readonly UNSPLASH_BASE = 'https://api.unsplash.com';
  private static readonly CARBON_BASE = 'https://www.carboninterface.com/api/v1';
  private static readonly UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  private static readonly CARBON_API_KEY = import.meta.env.VITE_CARBON_INTERFACE_KEY;

  /**
   * Get real product data from OpenFoodFacts
   */
  static async getProductByBarcode(barcode: string): Promise<any> {
    try {
      console.log(`🔍 Looking up barcode: ${barcode}`);
      
      const response = await fetch(`${this.OPENFOODFACTS_BASE}/${barcode}.json`);
      const data: ProductApiResponse = await response.json();
      
      if (data.status === 0 || !data.product) {
        console.log('❌ Product not found in OpenFoodFacts');
        return null;
      }

      const product = data.product;
      console.log('✅ Product found:', product.product_name);

      // Get additional product image from Unsplash if OpenFoodFacts image is poor
      let productImage = product.image_front_url || product.image_url;
      if (!productImage || productImage.includes('default')) {
        productImage = await this.getProductImage(product.product_name);
      }

      // Calculate eco score using Gemini AI
      const ecoScore = await this.calculateEcoScoreWithAI(product);
      
      // Get carbon footprint estimate
      const carbonFootprint = await this.estimateCarbonFootprint(product);

      return {
        code: product.code,
        product_name: product.product_name || 'Unknown Product',
        brands: product.brands || 'Unknown Brand',
        image_url: productImage,
        categories: product.categories || 'General',
        eco_score: ecoScore.score,
        eco_grade: ecoScore.grade,
        carbon_footprint: carbonFootprint,
        recyclable: this.isRecyclable(product),
        sustainable: ecoScore.score > 70,
        ingredients: product.ingredients_text,
        packaging: product.packaging,
        labels: product.labels,
        countries: product.countries,
        manufacturing_places: product.manufacturing_places,
        badges: this.generateBadges(product, ecoScore.score),
        metadata: {
          source: 'openfoodfacts',
          nutriscore: product.nutriscore_grade,
          original_ecoscore: product.ecoscore_score,
          fetched_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error fetching product data:', error);
      throw new Error(`Failed to fetch product data: ${error.message}`);
    }
  }

  /**
   * Get high-quality product image from Unsplash
   */
  static async getProductImage(productName: string): Promise<string> {
    try {
      const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        console.warn('⚠️ Unsplash API key not configured');
        return '/placeholder.svg';
      }

      const query = encodeURIComponent(productName.split(' ').slice(0, 3).join(' '));
      const response = await fetch(
        `${this.UNSPLASH_BASE}/search/photos?query=${query}&per_page=1&orientation=portrait`,
        {
          headers: {
            'Authorization': `Client-ID ${accessKey}`
          }
        }
      );

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const image: UnsplashImage = data.results[0];
        console.log('📸 Found Unsplash image for:', productName);
        return image.urls.regular;
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch Unsplash image:', error);
    }
    
    return '/placeholder.svg';
  }

  /**
   * Calculate eco score using Gemini AI
   */
  static async calculateEcoScoreWithAI(product: any): Promise<{score: number, grade: string, reasoning: string}> {
    try {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiKey) {
        console.warn('⚠️ Gemini API key not configured, using fallback');
        return this.fallbackEcoScore(product);
      }

      const prompt = `
        Analyze this product for environmental sustainability and provide an eco score from 0-100:
        
        Product: ${product.product_name}
        Brand: ${product.brands}
        Categories: ${product.categories}
        Ingredients: ${product.ingredients_text || 'Not specified'}
        Packaging: ${product.packaging || 'Not specified'}
        Labels: ${product.labels || 'None'}
        Manufacturing: ${product.manufacturing_places || 'Not specified'}
        
        Consider:
        1. Packaging sustainability (recyclable, minimal, biodegradable)
        2. Ingredient sourcing (organic, fair trade, local)
        3. Manufacturing impact (energy use, water consumption)
        4. Transportation footprint
        5. End-of-life disposal
        
        Respond with JSON: {"score": number, "grade": "A-F", "reasoning": "brief explanation"}
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log('🤖 Gemini AI eco score:', result.score);
          return result;
        }
      }
    } catch (error) {
      console.warn('⚠️ Gemini API error, using fallback:', error);
    }

    return this.fallbackEcoScore(product);
  }

  /**
   * Fallback eco score calculation
   */
  private static fallbackEcoScore(product: any): {score: number, grade: string, reasoning: string} {
    let score = 50; // Base score
    
    // Check for organic labels
    if (product.labels?.toLowerCase().includes('organic')) score += 20;
    if (product.labels?.toLowerCase().includes('fair-trade')) score += 15;
    if (product.labels?.toLowerCase().includes('recyclable')) score += 10;
    
    // Packaging penalties
    if (product.packaging?.toLowerCase().includes('plastic')) score -= 15;
    if (product.packaging?.toLowerCase().includes('non-recyclable')) score -= 20;
    
    // Original ecoscore integration
    if (product.ecoscore_score) {
      score = Math.max(score, product.ecoscore_score);
    }

    score = Math.min(100, Math.max(0, score));
    
    const grade = score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';
    
    return {
      score,
      grade,
      reasoning: `Score based on packaging (${product.packaging || 'unknown'}), labels (${product.labels || 'none'}), and sustainability factors.`
    };
  }

  /**
   * Estimate carbon footprint
   */
  static async estimateCarbonFootprint(product: any): Promise<number> {
    try {
      // Simple estimation based on product category and origin
      const baseFootprint = this.getCategoryFootprint(product.categories);
      const transportMultiplier = this.getTransportMultiplier(product.countries);
      const packagingFootprint = this.getPackagingFootprint(product.packaging);
      
      return Number((baseFootprint * transportMultiplier + packagingFootprint).toFixed(2));
    } catch (error) {
      console.warn('⚠️ Carbon footprint estimation error:', error);
      return 2.5; // Default footprint
    }
  }

  private static getCategoryFootprint(categories: string): number {
    const category = categories?.toLowerCase() || '';
    if (category.includes('meat')) return 15.0;
    if (category.includes('dairy')) return 8.0;
    if (category.includes('beverages')) return 3.0;
    if (category.includes('fruits') || category.includes('vegetables')) return 1.5;
    if (category.includes('clothing')) return 12.0;
    if (category.includes('electronics')) return 25.0;
    return 5.0; // Default
  }

  private static getTransportMultiplier(countries: string): number {
    if (!countries) return 1.2;
    const country = countries.toLowerCase();
    if (country.includes('local') || country.includes('usa')) return 1.0;
    if (country.includes('europe')) return 1.1;
    if (country.includes('asia') || country.includes('china')) return 1.5;
    return 1.2;
  }

  private static getPackagingFootprint(packaging: string): number {
    if (!packaging) return 0.5;
    const pack = packaging.toLowerCase();
    if (pack.includes('plastic')) return 1.2;
    if (pack.includes('cardboard') || pack.includes('paper')) return 0.3;
    if (pack.includes('glass')) return 0.8;
    if (pack.includes('metal')) return 1.0;
    return 0.5;
  }

  /**
   * Check if product is recyclable
   */
  private static isRecyclable(product: any): boolean {
    const packaging = product.packaging?.toLowerCase() || '';
    const labels = product.labels?.toLowerCase() || '';
    
    return packaging.includes('recyclable') || 
           labels.includes('recyclable') ||
           packaging.includes('cardboard') ||
           packaging.includes('glass') ||
           packaging.includes('aluminum');
  }

  /**
   * Generate product badges
   */
  private static generateBadges(product: any, ecoScore: number): string[] {
    const badges = [];
    
    if (ecoScore >= 80) badges.push('Eco Champion');
    if (ecoScore >= 70) badges.push('Eco Friendly');
    if (product.labels?.toLowerCase().includes('organic')) badges.push('Organic');
    if (product.labels?.toLowerCase().includes('fair-trade')) badges.push('Fair Trade');
    if (this.isRecyclable(product)) badges.push('Recyclable');
    if (product.labels?.toLowerCase().includes('carbon-neutral')) badges.push('Carbon Neutral');
    
    return badges;
  }

  /**
   * Calculate carbon footprint using Carbon Interface API
   */
  static async calculateCarbonFootprint(product: any): Promise<number> {
    try {
      if (!this.CARBON_API_KEY) {
        console.warn('⚠️ Carbon Interface API key not configured');
        return this.estimateCarbonFootprint(product);
      }

      const response = await fetch(`${this.CARBON_BASE}/estimates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.CARBON_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'shipping',
          weight_value: 1,
          weight_unit: 'kg',
          distance_value: 500,
          distance_unit: 'km',
          transport_method: 'truck'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const carbonKg = data.data?.attributes?.carbon_kg || 0;
        console.log('🌍 Carbon Interface API result:', carbonKg, 'kg CO₂');
        return carbonKg;
      }
    } catch (error) {
      console.warn('⚠️ Carbon Interface API error:', error);
    }

    return this.estimateCarbonFootprint(product);
  }

  /**
   * Estimate carbon footprint based on product data
   */
  private static estimateCarbonFootprint(product: any): number {
    const categories = product.categories?.toLowerCase() || '';
    const packaging = product.packaging?.toLowerCase() || '';
    
    let baseFootprint = 2.5; // kg CO₂e
    
    // Category-based adjustments
    if (categories.includes('meat')) baseFootprint = 15.0;
    else if (categories.includes('dairy')) baseFootprint = 6.0;
    else if (categories.includes('beverages')) baseFootprint = 1.8;
    else if (categories.includes('fruits') || categories.includes('vegetables')) baseFootprint = 1.2;
    
    // Packaging adjustments
    if (packaging.includes('glass')) baseFootprint *= 1.2;
    else if (packaging.includes('plastic')) baseFootprint *= 1.1;
    else if (packaging.includes('aluminum')) baseFootprint *= 1.3;
    
    // Organic/sustainable adjustments
    const labels = product.labels?.toLowerCase() || '';
    if (labels.includes('organic')) baseFootprint *= 0.8;
    if (labels.includes('local')) baseFootprint *= 0.7;
    if (labels.includes('carbon-neutral')) baseFootprint *= 0.3;
    
    return Math.round(baseFootprint * 100) / 100;
  }
}

export default RealProductAPI;
