import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Filter,
  Star,
  Leaf,
  Zap,
  TrendingUp,
  ShoppingCart,
  Sparkles,
  Eye,
  Heart,
  Plus,
  Minus,
  X,
  Clock,
  Truck,
  Shield,
  Flame,
  Wifi,
  RefreshCw,
  Grid,
  List,
  SortDesc,
  ThumbsUp,
  Package,
  Gift,
  Target,
  Globe,
  Users,
  BarChart3
} from "lucide-react";

// Enhanced Product Interface
interface EnhancedProduct {
  id: string;
  name: string;
  brand: string;
  eco_score: number;
  price: string;
  originalPrice?: string;
  discount?: number;
  rating: number;
  reviews: number;
  image_url: string;
  category: string;
  description: string;
  co2_saved: number;
  tags: string[];
  inStock: boolean;
  fastDelivery: boolean;
  freeShipping: boolean;
  verified: boolean;
  trending: boolean;
  newArrival: boolean;
  specifications?: Record<string, string>;
  sustainability?: {
    carbonNeutral: boolean;
    recycledMaterials: number;
    biodegradable: boolean;
    locallyMade: boolean;
  };
}

// Real-time Product Suggestions Interface
interface ProductSuggestion {
  id: string;
  reason: string;
  confidence: number;
  product: EnhancedProduct;
}

// Shopping Cart Item
interface CartItem extends EnhancedProduct {
  quantity: number;
}

// Enhanced mock product data with real shopping features
const featuredProducts: EnhancedProduct[] = [
  {
    id: '1',
    name: 'Bamboo Water Bottle Premium',
    brand: 'EcoLife Pro',
    eco_score: 95,
    price: '$24.99',
    originalPrice: '$34.99',
    discount: 29,
    rating: 4.9,
    reviews: 2847,
    image_url: '/placeholder.svg',
    category: 'Drinkware',
    description: 'Premium sustainable bamboo water bottle with temperature control and leak-proof design',
    co2_saved: 3.2,
    tags: ['Sustainable', 'Zero Waste', 'BPA Free', 'Premium'],
    inStock: true,
    fastDelivery: true,
    freeShipping: true,
    verified: true,
    trending: true,
    newArrival: false,
    specifications: {
      'Capacity': '750ml',
      'Material': '100% Bamboo Fiber',
      'Temperature': 'Keeps cold 24h, hot 12h',
      'Warranty': '2 Years'
    },
    sustainability: {
      carbonNeutral: true,
      recycledMaterials: 85,
      biodegradable: true,
      locallyMade: false
    }
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt Collection',
    brand: 'Green Thread Co.',
    eco_score: 91,
    price: '$28.00',
    originalPrice: '$35.00',
    discount: 20,
    rating: 4.7,
    reviews: 1543,
    image_url: '/placeholder.svg',
    category: 'Clothing',
    description: '100% organic cotton, ethically sourced and produced with fair trade certification',
    co2_saved: 2.8,
    tags: ['Organic', 'Fair Trade', 'Biodegradable', 'Ethical'],
    inStock: true,
    fastDelivery: false,
    freeShipping: true,
    verified: true,
    trending: false,
    newArrival: true,
    sustainability: {
      carbonNeutral: false,
      recycledMaterials: 0,
      biodegradable: true,
      locallyMade: true
    }
  },
  {
    id: '3',
    name: 'Solar Power Bank 20000mAh',
    brand: 'SunTech Pro',
    eco_score: 88,
    price: '$45.99',
    originalPrice: '$59.99',
    discount: 23,
    rating: 4.6,
    reviews: 3284,
    image_url: '/placeholder.svg',
    category: 'Electronics',
    description: 'High-capacity solar power bank with wireless charging and LED indicators',
    co2_saved: 5.4,
    tags: ['Solar Powered', 'Wireless Charging', 'Fast Charge', 'Durable'],
    inStock: true,
    fastDelivery: true,
    freeShipping: true,
    verified: true,
    trending: true,
    newArrival: false,
    sustainability: {
      carbonNeutral: true,
      recycledMaterials: 45,
      biodegradable: false,
      locallyMade: false
    }
  },
  {
    id: '4',
    name: 'Compostable Phone Case Set',
    brand: 'BioCover',
    eco_score: 93,
    price: '$19.99',
    rating: 4.8,
    reviews: 892,
    image_url: '/placeholder.svg',
    category: 'Electronics',
    description: 'Fully compostable phone cases made from plant-based materials',
    co2_saved: 1.2,
    tags: ['Compostable', 'Plant-Based', 'Biodegradable', 'Protective'],
    inStock: true,
    fastDelivery: true,
    freeShipping: false,
    verified: true,
    trending: false,
    newArrival: true,
    sustainability: {
      carbonNeutral: true,
      recycledMaterials: 0,
      biodegradable: true,
      locallyMade: true
    }
  },
  {
    id: '5',
    name: 'Stainless Steel Lunch Box',
    brand: 'EcoMeal',
    eco_score: 89,
    price: '$32.99',
    originalPrice: '$42.99',
    discount: 23,
    rating: 4.5,
    reviews: 1672,
    image_url: '/placeholder.svg',
    category: 'Kitchen',
    description: 'Premium stainless steel lunch box with compartments and bamboo utensils',
    co2_saved: 4.1,
    tags: ['Stainless Steel', 'Zero Waste', 'Leak Proof', 'Includes Utensils'],
    inStock: true,
    fastDelivery: false,
    freeShipping: true,
    verified: true,
    trending: true,
    newArrival: false,
    sustainability: {
      carbonNeutral: false,
      recycledMaterials: 75,
      biodegradable: false,
      locallyMade: true
    }
  },
  {
    id: '6',
    name: 'Hemp Yoga Mat',
    brand: 'ZenEco',
    eco_score: 94,
    price: '$65.99',
    originalPrice: '$79.99',
    discount: 18,
    rating: 4.8,
    reviews: 756,
    image_url: '/placeholder.svg',
    category: 'Fitness',
    description: 'Natural hemp yoga mat with cork backing, non-slip and antimicrobial',
    co2_saved: 3.7,
    tags: ['Hemp', 'Cork', 'Natural', 'Non-Slip'],
    inStock: true,
    fastDelivery: true,
    freeShipping: true,
    verified: true,
    trending: true,
    newArrival: true,
    sustainability: {
      carbonNeutral: true,
      recycledMaterials: 0,
      biodegradable: true,
      locallyMade: true
    }
  }
];

export default function SuperDiscoverPage() {
  const { toast } = useToast();
  
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('trending');
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<EnhancedProduct | null>(null);
  const [realtimeSuggestions, setRealtimeSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Filters State
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [ecoScoreMin, setEcoScoreMin] = useState(70);
  const [showInStockOnly, setShowInStockOnly] = useState(true);
  const [showFreeShippingOnly, setShowFreeShippingOnly] = useState(false);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time product suggestions
      const suggestions: ProductSuggestion[] = [
        {
          id: 'suggestion-1',
          reason: 'Based on your eco-score preferences',
          confidence: 94,
          product: featuredProducts[Math.floor(Math.random() * featuredProducts.length)]
        },
        {
          id: 'suggestion-2',
          reason: 'Popular in your area',
          confidence: 87,
          product: featuredProducts[Math.floor(Math.random() * featuredProducts.length)]
        },
        {
          id: 'suggestion-3',
          reason: 'Similar to your recent scans',
          confidence: 92,
          product: featuredProducts[Math.floor(Math.random() * featuredProducts.length)]
        }
      ];
      setRealtimeSuggestions(suggestions);
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = featuredProducts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Trending') {
        filtered = filtered.filter(p => p.trending);
      } else if (selectedCategory === 'New') {
        filtered = filtered.filter(p => p.newArrival);
      } else if (selectedCategory === 'Sustainable') {
        filtered = filtered.filter(p => p.eco_score >= 90);
      } else {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price.replace('$', ''));
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Eco score filter
    filtered = filtered.filter(product => product.eco_score >= ecoScoreMin);

    // Stock filter
    if (showInStockOnly) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Free shipping filter
    if (showFreeShippingOnly) {
      filtered = filtered.filter(product => product.freeShipping);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
        break;
      case 'eco-score':
        filtered.sort((a, b) => b.eco_score - a.eco_score);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default: // trending
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, priceRange, ecoScoreMin, showInStockOnly, showFreeShippingOnly]);

  // Cart functions
  const addToCart = useCallback((product: EnhancedProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast({
      title: "Added to Cart! 🛒",
      description: `${product.name} has been added to your cart.`,
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        toast({
          title: "Removed from Wishlist 💔",
          description: "Item removed from your wishlist.",
        });
        return prev.filter(id => id !== productId);
      }
      toast({
        title: "Added to Wishlist! ❤️",
        description: "Item saved to your wishlist.",
      });
      return [...prev, productId];
    });
  }, [toast]);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartValue = cart.reduce((sum, item) => sum + (parseFloat(item.price.replace('$', '')) * item.quantity), 0);

  const categories = ['All', 'Trending', 'New', 'Sustainable', 'Drinkware', 'Clothing', 'Electronics', 'Kitchen', 'Fitness'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, -50, -10],
              x: [-5, 5, -5],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header with Search and Live Status */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-3xl p-6 shadow-2xl border border-white/20">
            {/* Title and Description */}
            <div>
              <motion.h1 
                className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🛒 Super Shopping
              </motion.h1>
              <motion.p 
                className="text-slate-600 dark:text-slate-400 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Real-time eco-friendly products with AI-powered suggestions
              </motion.p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search eco-friendly products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-white/30 focus:border-blue-400 rounded-2xl"
                />
              </div>
            </div>

            {/* Live Status and Cart */}
            <div className="flex items-center gap-4">
              {/* Live Status */}
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Wifi className="h-4 w-4 text-green-500" />
                </motion.div>
                <div className="text-xs">
                  <div className="text-green-600 font-medium">Live</div>
                  <div className="text-slate-500">
                    {lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Cart Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-6 rounded-2xl">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                    {totalCartItems > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-5 w-5 p-0 text-xs flex items-center justify-center">
                        {totalCartItems}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full max-w-md">
                  <SheetHeader>
                    <SheetTitle>Shopping Cart ({totalCartItems} items)</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cart.length > 0 ? (
                      <>
                        {cart.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                          >
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg bg-gradient-to-br from-blue-100 to-purple-100"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{item.name}</h4>
                              <p className="text-slate-600 text-xs">{item.brand}</p>
                              <p className="font-bold text-blue-600">{item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    setCart(prev => prev.map(cartItem => 
                                      cartItem.id === item.id 
                                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                                        : cartItem
                                    ));
                                  }
                                }}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(item)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center font-bold">
                          <span>Total: ${totalCartValue.toFixed(2)}</span>
                          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                            Checkout
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Your cart is empty</p>
                        <p className="text-sm">Add some eco-friendly products!</p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </motion.div>

        {/* Real-time Suggestions Bar */}
        <AnimatePresence>
          {realtimeSuggestions.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200/30 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-5 w-5 text-green-600" />
                    </motion.div>
                    <h3 className="font-semibold text-green-800 dark:text-green-400">
                      🤖 AI Real-time Suggestions
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {realtimeSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl cursor-pointer hover:bg-white/70 transition-colors"
                        onClick={() => setSelectedProduct(suggestion.product)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={suggestion.product.image_url}
                            alt={suggestion.product.name}
                            className="w-12 h-12 object-cover rounded-lg bg-gradient-to-br from-blue-100 to-purple-100"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{suggestion.product.name}</p>
                            <p className="text-xs text-slate-600">{suggestion.reason}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Target className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600">{suggestion.confidence}% match</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories and Filters */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 shadow-xl border border-white/20">
            <CardContent className="p-6">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "rounded-full",
                      selectedCategory === category 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0" 
                        : "backdrop-blur-sm bg-white/50 hover:bg-white/70 border-white/50"
                    )}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex bg-white/50 dark:bg-slate-800/50 rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sort Options */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/50 dark:bg-slate-800/50 border border-white/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="trending">🔥 Trending</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                    <option value="eco-score">🌱 Eco Score</option>
                    <option value="rating">⭐ Rating</option>
                    <option value="reviews">💬 Most Reviews</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {filteredProducts.length} products found
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3">Loading amazing eco-products...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 max-w-4xl mx-auto"
            )}>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className={cn(
                    "group relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300",
                    viewMode === 'list' && "flex flex-row"
                  )}>
                    {/* Product Image */}
                    <div className={cn(
                      "relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100",
                      viewMode === 'grid' ? "aspect-square" : "w-48 flex-shrink-0"
                    )}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Overlay Badges */}
                      <div className="absolute top-2 left-2 space-y-1">
                        {product.discount && (
                          <Badge className="bg-red-500 text-white">
                            -{product.discount}%
                          </Badge>
                        )}
                        {product.trending && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <Flame className="h-3 w-3 mr-1" />
                            Hot
                          </Badge>
                        )}
                        {product.newArrival && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            New
                          </Badge>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                        >
                          <Heart className={cn(
                            "h-4 w-4",
                            wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-slate-600"
                          )} />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                        </Button>
                      </div>

                      {/* Eco Score */}
                      <div className="absolute bottom-2 left-2">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Leaf className="h-3 w-3" />
                          {product.eco_score}
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <CardContent className={cn("p-4", viewMode === 'list' && "flex-1")}>
                      <div className="space-y-3">
                        {/* Brand and Title */}
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{product.brand}</p>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                        </div>

                        {/* Rating and Reviews */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-sm">{product.rating}</span>
                          </div>
                          <span className="text-xs text-slate-500">({product.reviews.toLocaleString()} reviews)</span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Features */}
                        <div className="flex items-center gap-3 text-xs">
                          {product.freeShipping && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Truck className="h-3 w-3" />
                              Free Shipping
                            </div>
                          )}
                          {product.fastDelivery && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Zap className="h-3 w-3" />
                              Fast Delivery
                            </div>
                          )}
                          {product.verified && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <Shield className="h-3 w-3" />
                              Verified
                            </div>
                          )}
                        </div>

                        {/* Environmental Impact */}
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-700 dark:text-green-400 font-medium">
                              🌍 CO₂ Saved: {product.co2_saved}kg
                            </span>
                            {product.sustainability?.carbonNeutral && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Carbon Neutral
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-slate-900 dark:text-white">
                                {product.price}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-slate-500 line-through">
                                  {product.originalPrice}
                                </span>
                              )}
                            </div>
                            {!product.inStock && (
                              <p className="text-xs text-red-500 font-medium">Out of Stock</p>
                            )}
                          </div>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            disabled={!product.inStock}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </motion.div>

        {/* Product Detail Modal */}
        <Dialog open={selectedProduct !== null} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                  <p className="text-slate-600">{selectedProduct.brand}</p>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl overflow-hidden">
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    {/* Price and Rating */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold">{selectedProduct.price}</span>
                        {selectedProduct.originalPrice && (
                          <span className="text-lg text-slate-500 line-through">
                            {selectedProduct.originalPrice}
                          </span>
                        )}
                        {selectedProduct.discount && (
                          <Badge className="bg-red-500 text-white">
                            -{selectedProduct.discount}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn(
                              "h-4 w-4",
                              i < Math.floor(selectedProduct.rating) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-slate-300"
                            )} />
                          ))}
                        </div>
                        <span className="font-semibold">{selectedProduct.rating}</span>
                        <span className="text-slate-500">({selectedProduct.reviews.toLocaleString()} reviews)</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedProduct.description}
                    </p>

                    {/* Specifications */}
                    {selectedProduct.specifications && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Specifications</h4>
                        <div className="space-y-1">
                          {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-slate-600">{key}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sustainability Info */}
                    {selectedProduct.sustainability && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl space-y-2">
                        <h4 className="font-semibold text-green-800 dark:text-green-400">
                          🌱 Sustainability Features
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              selectedProduct.sustainability.carbonNeutral ? "bg-green-500" : "bg-slate-300"
                            )} />
                            Carbon Neutral
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              selectedProduct.sustainability.biodegradable ? "bg-green-500" : "bg-slate-300"
                            )} />
                            Biodegradable
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              selectedProduct.sustainability.locallyMade ? "bg-green-500" : "bg-slate-300"
                            )} />
                            Locally Made
                          </div>
                          <div className="text-green-700 dark:text-green-400">
                            {selectedProduct.sustainability.recycledMaterials}% Recycled
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => addToCart(selectedProduct)}
                        disabled={!selectedProduct.inStock}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toggleWishlist(selectedProduct.id)}
                        className="h-12 px-6"
                      >
                        <Heart className={cn(
                          "h-4 w-4",
                          wishlist.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : ""
                        )} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
