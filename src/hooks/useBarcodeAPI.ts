import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarcodeProduct } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import RealProductAPI from '@/lib/real-product-api';
import EnhancedScoutBot from '@/lib/enhanced-scout-bot';

export const useBarcodeAPI = () => {
  const [isLooking, setIsLooking] = useState(false);
  const { toast } = useToast();

  const lookupBarcode = async (barcode: string): Promise<BarcodeProduct | null> => {
    setIsLooking(true);
    
    try {
      console.log('🤖 Enhanced Scout Bot starting barcode search:', barcode);
      
      // Use the Enhanced Scout Bot for comprehensive product search
      const scoutResult = await EnhancedScoutBot.findProduct({ barcode });
      
      if (scoutResult.success && scoutResult.product && scoutResult.product.product_name) {
        const product = scoutResult.product;
        
        console.log(`✅ Scout Bot found product from ${scoutResult.source} (${Math.round(scoutResult.confidence * 100)}% confidence): ${product.product_name}`);
        
        // Save to Supabase if from external source
        if (scoutResult.source === 'openfoodfacts' || scoutResult.source === 'ai_analysis') {
          try {
            const { error } = await supabase.from('products').upsert({
              barcode: product.code || barcode,
              name: product.product_name,
              brand: product.brands || 'Unknown',
              image_url: product.image_url,
              eco_score: product.eco_score || 50,
              carbon_footprint: product.carbon_footprint || 0,
              recyclable: product.recyclable || false,
              sustainable: product.sustainable || false,
              badges: product.badges || [],
              metadata: product.metadata || {}
            });
            
            if (!error) {
              console.log('💾 Product cached in database');
            }
          } catch (dbError) {
            console.warn('⚠️ Failed to cache product:', dbError);
          }
        }

        setIsLooking(false);
        
        // Show appropriate toast based on source and confidence
        const sourceMessages = {
          openfoodfacts: "Real Product Found! 🎉",
          supabase: "Product Found! 📱", 
          ai_analysis: "AI Analysis Complete! 🤖",
          demo: "Demo Product 🧪",
          search_fallback: "Similar Product Found 🔍"
        };

        toast({
          title: sourceMessages[scoutResult.source] || "Product Found!",
          description: `${product.product_name} - ${scoutResult.reasoning}`,
        });

        return {
          code: product.code || barcode,
          product_name: product.product_name || 'Unknown Product',
          brands: product.brands || 'Unknown Brand',
          categories: product.categories || 'General',
          ingredients_text: product.ingredients || '',
          packaging: product.packaging || '',
          ecoscore_grade: product.eco_grade?.toLowerCase() || 'unknown',
          nutriscore_grade: product.metadata?.nutriscore || 'unknown',
          image_url: product.image_url || '/placeholder.svg'
        };
      }

      // If scout bot fails completely, fallback to original logic
      console.log('⚠️ Scout Bot failed, trying fallback methods');
      
      // Try original RealProductAPI as last resort
      const realProduct = await RealProductAPI.getProductByBarcode(barcode);
      
      if (realProduct) {
        console.log('✅ Fallback: Real product found from OpenFoodFacts');
        
        setIsLooking(false);
        toast({
          title: "Product Found! 🎉",
          description: `${realProduct.product_name} by ${realProduct.brands}`,
        });

        return {
          code: realProduct.code,
          product_name: realProduct.product_name,
          brands: realProduct.brands,
          categories: realProduct.categories,
          ingredients_text: realProduct.ingredients,
          packaging: realProduct.packaging,
          ecoscore_grade: realProduct.eco_grade?.toLowerCase(),
          nutriscore_grade: realProduct.metadata?.nutriscore,
          image_url: realProduct.image_url
        };
      }

      // Final fallback - Generate demo product
      const demoProduct = generateRealisticDemoProduct(barcode);
      
      setIsLooking(false);
      toast({
        title: "Demo Product",
        description: `${demoProduct.product_name} - This is a demo for testing`,
      });

      return demoProduct;

    } catch (error) {
      console.error('❌ Complete lookup failure:', error);
      setIsLooking(false);
      
      // Ultimate fallback with realistic products
      const fallbackProduct = generateRealisticDemoProduct(barcode);
      
      toast({
        title: "Demo Mode",
        description: `Showing ${fallbackProduct.product_name} as demo`,
        variant: "default"
      });

      return fallbackProduct;
    }
  };

  return { lookupBarcode, isLooking };
};

// Generate realistic demo products with high-quality data
function generateRealisticDemoProduct(barcode: string): BarcodeProduct {
  const demoProducts = [
    {
      code: barcode,
      product_name: 'Organic Fair Trade Coffee Beans',
      brands: 'Sustainable Grounds',
      categories: 'Beverages, Coffee, Organic',
      ingredients_text: '100% organic arabica coffee beans, fair trade certified',
      packaging: 'Recyclable aluminum bag with compostable liner',
      ecoscore_grade: 'a',
      nutriscore_grade: 'a',
      image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&h=300&fit=crop'
    },
    {
      code: barcode,
      product_name: 'Recycled Ocean Plastic Water Bottle',
      brands: 'AquaGreen',
      categories: 'Beverages, Water, Eco-friendly',
      ingredients_text: 'Purified water with added electrolytes',
      packaging: '100% recycled ocean plastic bottle',
      ecoscore_grade: 'a',
      nutriscore_grade: 'a',
      image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=300&fit=crop'
    },
    {
      code: barcode,
      product_name: 'Bamboo Fiber Eco T-Shirt',
      brands: 'GreenWear Co',
      categories: 'Clothing, Sustainable fashion',
      ingredients_text: '70% bamboo fiber, 30% organic cotton',
      packaging: 'Compostable packaging made from corn starch',
      ecoscore_grade: 'a',
      nutriscore_grade: undefined,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    },
    {
      code: barcode,
      product_name: 'Solar-Powered Portable Charger',
      brands: 'EcoTech Solutions',
      categories: 'Electronics, Solar energy, Sustainable tech',
      ingredients_text: 'Solar panel, lithium battery, recycled aluminum casing',
      packaging: 'Recyclable cardboard with soy-based inks',
      ecoscore_grade: 'b',
      nutriscore_grade: undefined,
      image_url: 'https://images.unsplash.com/photo-1615870216519-2f9fa725582f?w=300&h=300&fit=crop'
    },
    {
      code: barcode,
      product_name: 'Plant-Based Protein Smoothie',
      brands: 'Purely Plant',
      categories: 'Beverages, Health drinks, Vegan',
      ingredients_text: 'Pea protein, banana, coconut water, spirulina, natural flavors',
      packaging: 'Glass bottle with recyclable metal cap',
      ecoscore_grade: 'a',
      nutriscore_grade: 'a',
      image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=300&h=300&fit=crop'
    },
    {
      code: barcode,
      product_name: 'Biodegradable Dish Soap',
      brands: 'CleanGreen',
      categories: 'Household, Cleaning, Eco-friendly',
      ingredients_text: 'Plant-based surfactants, essential oils, biodegradable formula',
      packaging: 'Refillable glass bottle with bamboo pump',
      ecoscore_grade: 'a',
      nutriscore_grade: undefined,
      image_url: 'https://images.unsplash.com/photo-1556229010-aa81b84ac8f7?w=300&h=300&fit=crop'
    }
  ];

  // Use barcode to consistently return same product
  const index = parseInt(barcode.slice(-1) || '0') % demoProducts.length;
  return demoProducts[index];
}