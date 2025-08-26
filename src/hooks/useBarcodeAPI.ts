import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarcodeProduct } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import RealProductAPI from '@/lib/real-product-api';

export const useBarcodeAPI = () => {
  const [isLooking, setIsLooking] = useState(false);
  const { toast } = useToast();

  const lookupBarcode = async (barcode: string): Promise<BarcodeProduct | null> => {
    setIsLooking(true);
    
    try {
      console.log('🔍 Real barcode lookup for:', barcode);
      
      // First try real OpenFoodFacts API
      const realProduct = await RealProductAPI.getProductByBarcode(barcode);
      
      if (realProduct) {
        console.log('✅ Real product found from OpenFoodFacts');
        
        // Store in Supabase for future reference
        try {
          const { error } = await supabase.from('products').upsert({
            barcode: realProduct.code,
            name: realProduct.product_name,
            brand: realProduct.brands,
            image_url: realProduct.image_url,
            eco_score: realProduct.eco_score,
            carbon_footprint: realProduct.carbon_footprint,
            recyclable: realProduct.recyclable,
            sustainable: realProduct.sustainable,
            badges: realProduct.badges,
            metadata: realProduct.metadata
          });
          
          if (!error) {
            console.log('💾 Product saved to database');
          }
        } catch (dbError) {
          console.warn('⚠️ Failed to save to database:', dbError);
        }

        setIsLooking(false);
        toast({
          title: "Real Product Found! 🎉",
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

      // Try Supabase function as fallback
      const { data, error } = await supabase.functions.invoke('barcode-lookup', {
        body: { barcode }
      });

      if (!error && data?.success) {
        setIsLooking(false);
        toast({
          title: "Product Found!",
          description: `Found: ${data.data.product_name}`,
        });
        return data.data;
      }

      // Generate enhanced demo products for better experience
      const demoProduct = generateRealisticDemoProduct(barcode);
      
      setIsLooking(false);
      toast({
        title: "Demo Product",
        description: `${demoProduct.product_name} - This is a demo for testing`,
      });

      return demoProduct;

    } catch (error) {
      console.error('❌ Barcode API error:', error);
      setIsLooking(false);
      
      // Enhanced fallback with realistic products
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