import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScoreRing } from "@/components/ScoreRing";
import { ProductCard } from "@/components/ProductCard";
import { AlternativeCard } from "@/components/AlternativeCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorState } from "@/components/ErrorState";
import { AnimatedElement } from "@/components/AnimatedComponents";
import { SmartScanner } from "@/components/SmartScanner";
import { useBarcodeAPI } from "@/hooks/useBarcodeAPI";
import { useEcoScore } from "@/hooks/useEcoScore";
import { useAlternatives } from "@/hooks/useAlternatives";
import { useCamera } from "@/hooks/useCamera";
import { useToast } from "@/hooks/use-toast";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { 
  Scan, 
  Camera, 
  Upload,
  Zap, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Play,
  Square,
  FileImage,
  Trophy
} from "lucide-react";

interface ProductResult {
  code?: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  eco_score?: number;
  recyclable?: boolean;
  sustainable?: boolean;
  badges?: string[];
  alternatives?: any[];
  carbon_footprint?: number;
  categories?: string;
}

export default function Scanner() {
  const [currentProduct, setCurrentProduct] = useState<ProductResult | null>(null);
  const [productAlternatives, setProductAlternatives] = useState<any[]>([]);
  const [ecoPoints, setEcoPoints] = useState(0);
  
  const { toast } = useToast();
  const { triggerHaptic } = useHapticFeedback();
  const { calculateEcoScore, isCalculating } = useEcoScore();
  const { generateAlternatives, isGenerating } = useAlternatives();

  useEffect(() => {
    document.title = "🌿 EcoSnap AI - Smart Scanner";
    
    // Load eco points from localStorage
    const savedPoints = localStorage.getItem('ecoPoints');
    if (savedPoints) {
      setEcoPoints(parseInt(savedPoints, 10));
    }
  }, []);

  // Save eco points to localStorage
  const saveEcoPoints = (points: number) => {
    setEcoPoints(points);
    localStorage.setItem('ecoPoints', points.toString());
  };

  const handleProductFound = async (product: any) => {
    setCurrentProduct(null);
    triggerHaptic('medium');
    
    try {
      // Calculate enhanced eco score if not already provided
      let ecoData;
      if (!product.eco_score || product.eco_score === 50) {
        ecoData = await calculateEcoScore({
          product_name: product.product_name,
          brand: product.brands,
          category: product.categories || product.category
        });
      }
      
      // Get alternatives
      const alternatives = await generateAlternatives({
        product_name: product.product_name,
        brand: product.brands,
        category: product.categories || product.category
      });
      
      setCurrentProduct({
        code: product.code,
        product_name: product.product_name,
        brands: product.brands,
        image_url: product.image_url,
        eco_score: ecoData?.overall_score || product.eco_score || 50,
        recyclable: product.recyclable,
        sustainable: product.sustainable,
        carbon_footprint: product.carbon_footprint || product.co2_impact,
        categories: product.categories || product.category,
        badges: product.badges || [],
        alternatives: alternatives || product.alternatives || []
      });
      
      setProductAlternatives(alternatives || product.alternatives || []);
      
      toast({
        title: "Product Analysis Complete! ✨",
        description: `${product.product_name} - Full sustainability report ready`,
      });
    } catch (error) {
      console.error('❌ Product analysis failed:', error);
      
      // Still show the product with basic info
      setCurrentProduct({
        code: product.code,
        product_name: product.product_name,
        brands: product.brands,
        image_url: product.image_url,
        eco_score: product.eco_score || 50,
        recyclable: product.recyclable,
        sustainable: product.sustainable,
        carbon_footprint: product.carbon_footprint,
        categories: product.categories,
        badges: product.badges || []
      });
      
      toast({
        title: "Product Found!",
        description: `${product.product_name} - Basic analysis available`,
      });
    }
  };

  const handleEcoPointsEarned = (points: number) => {
    const newTotal = ecoPoints + points;
    saveEcoPoints(newTotal);
    triggerHaptic('success');
    
    toast({
      title: `+${points} Eco Points! 🌟`,
      description: `Total: ${newTotal} points`,
    });
  };

  const handleReset = () => {
    setCurrentProduct(null);
    setProductAlternatives([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <AnimatedElement animation="fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scan className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">EcoSnap AI Scanner</h1>
                  <p className="text-sm text-muted-foreground">
                    Advanced product discovery & sustainability analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Eco Points Display */}
                <div className="flex items-center gap-2 bg-green-50 rounded-full px-3 py-1">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">{ecoPoints}</span>
                </div>
                
                {currentProduct && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleReset}
                    className="smooth-hover"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    New Scan
                  </Button>
                )}
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!currentProduct ? (
          <div className="space-y-8">
            {/* Welcome Message */}
            <AnimatedElement animation="fadeInUp" className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Discover Sustainable Products
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Use our advanced AI-powered scanner to analyze products, get sustainability scores, 
                and discover eco-friendly alternatives. Every scan earns you eco points!
              </p>
            </AnimatedElement>

            {/* Smart Scanner */}
            <AnimatedElement animation="scaleIn" delay={200}>
              <div className="max-w-4xl mx-auto">
                <SmartScanner 
                  onProductFound={handleProductFound}
                  onEcoPointsEarned={handleEcoPointsEarned}
                  mode="auto"
                />
              </div>
            </AnimatedElement>

            {/* Loading State */}
            {(isCalculating || isGenerating) && (
              <AnimatedElement animation="fadeIn">
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <LoadingSpinner className="mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analyzing Product</h3>
                    <p className="text-muted-foreground">
                      {isCalculating && isGenerating 
                        ? 'Calculating eco score and finding alternatives...'
                        : isCalculating 
                        ? 'Calculating sustainability score...'
                        : 'Finding eco-friendly alternatives...'
                      }
                    </p>
                    <Progress value={65} className="mt-4 max-w-md mx-auto" />
                  </CardContent>
                </Card>
              </AnimatedElement>
            )}
          </div>
        ) : (
          /* Product Results */
          <div className="space-y-8">
            {/* Product Information */}
            <AnimatedElement animation="fadeInUp">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Product Analysis Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Product Header */}
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      {currentProduct.image_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={currentProduct.image_url} 
                            alt={currentProduct.product_name}
                            className="w-32 h-32 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2">{currentProduct.product_name}</h3>
                        {currentProduct.brands && (
                          <p className="text-lg text-muted-foreground mb-2">{currentProduct.brands}</p>
                        )}
                        {currentProduct.categories && (
                          <Badge variant="outline" className="mb-4">
                            {currentProduct.categories}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>

            {/* Eco Score Breakdown */}
            <AnimatedElement animation="fadeInUp" delay={100}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Sustainability Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Score Ring */}
                    <div className="flex flex-col items-center">
                      <ScoreRing score={currentProduct.eco_score || 50} />
                      <h3 className="text-xl font-bold mt-4">
                        Overall Eco Score
                      </h3>
                      <p className="text-muted-foreground text-center">
                        Based on sustainability factors like packaging, sourcing, and carbon footprint
                      </p>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {currentProduct.carbon_footprint?.toFixed(1) || '1.2'}kg
                          </div>
                          <div className="text-sm text-muted-foreground">CO₂ Impact</div>
                        </div>
                        
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {currentProduct.recyclable ? (
                              <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
                            ) : (
                              <AlertCircle className="h-8 w-8 mx-auto text-orange-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {currentProduct.recyclable ? 'Recyclable' : 'Limited Recycling'}
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      {currentProduct.badges && currentProduct.badges.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Certifications</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentProduct.badges.map((badge, index) => (
                              <Badge key={index} variant="secondary">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Category */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Product Category</h4>
                        <Badge variant="outline">{currentProduct.categories || 'General'}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>

            {/* Alternatives */}
            {productAlternatives && productAlternatives.length > 0 && (
              <AnimatedElement animation="fadeInUp" delay={200}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-green-500" />
                      Eco-Friendly Alternatives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {productAlternatives.slice(0, 4).map((alternative, index) => (
                        <AlternativeCard 
                          key={alternative.id || index} 
                          alternative={alternative}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedElement>
            )}

            {/* Action Buttons */}
            <AnimatedElement animation="fadeInUp" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={handleReset}
                  className="smooth-hover"
                >
                  <Scan className="h-5 w-5 mr-2" />
                  Scan Another Product
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: `${currentProduct.product_name} - EcoSnap Analysis`,
                        text: `Check out this sustainability analysis: ${currentProduct.product_name} scored ${currentProduct.eco_score}/100 for eco-friendliness!`,
                        url: window.location.href
                      });
                    }
                  }}
                  className="smooth-hover"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Share Results
                </Button>
              </div>
            </AnimatedElement>
          </div>
        )}
      </div>
    </div>
  );
};
