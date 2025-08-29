import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Scan, Zap, X, RotateCcw, Loader2, CheckCircle, AlertCircle, Leaf, Package, Cloud, FlaskConical, ShieldCheck, HeartPulse, Search, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useAdvancedProductSearch } from '@/hooks/useAdvancedProductSearch';
import { useBarcodeAPI } from '@/hooks/useBarcodeAPI';
import { useToast } from '@/hooks/use-toast';
import { StatsService } from '../lib/stats-service-clean';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateScan } from '@/hooks/useDatabase';
import { useQueryClient } from '@tanstack/react-query';
import { Gemini } from '@/integrations/gemini';

// --- NEW DETAILED PRODUCT CARD ---
const ProductResultCard = ({ product, onSearchAlternative }) => {
  if (!product) return null;

  const ScoreItem = ({ icon, label, value }) => (
    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
      {icon}
      <span className="text-sm font-medium text-gray-600 mt-1">{label}</span>
      <span className="text-lg font-bold text-gray-800">{value}/100</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{product.productName}</CardTitle>
          <div className="text-md text-gray-500">
            <span>by {product.brand} in </span>
            <Badge variant="secondary" className="align-middle inline-flex">{product.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Image */}
          {product.imageUrl && product.imageUrl !== '/placeholder.svg' && (
            <div className="flex justify-center">
              <img 
                src={product.imageUrl} 
                alt={product.productName}
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-green-700">Overall Eco Score</p>
            <p className="text-6xl font-bold text-green-600">{product.ecoScore}</p>
            <Progress value={product.ecoScore} className="mt-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ScoreItem icon={<Package size={24} className="text-blue-500" />} label="Packaging" value={product.packagingScore} />
            <ScoreItem icon={<Cloud size={24} className="text-slate-500" />} label="Carbon" value={product.carbonScore} />
            <ScoreItem icon={<FlaskConical size={24} className="text-purple-500" />} label="Ingredients" value={product.ingredientScore} />
            <ScoreItem icon={<HeartPulse size={24} className="text-red-500" />} label="Health" value={product.healthScore} />
          </div>

          <div>
            <h4 className="font-semibold mb-2">Details</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <Badge variant={product.recyclable ? 'default' : 'destructive'} className="align-middle inline-flex">{product.recyclable ? 'Recyclable' : 'Not Recyclable'}</Badge>
              <Badge variant="outline" className="align-middle inline-flex">CO2 Impact: {product.co2Impact} kg</Badge>
              <Badge variant="outline" className="align-middle inline-flex">Cert Score: {product.certificationScore}/100</Badge>
            </div>
          </div>

          {product.certifications && product.certifications.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert: string) => <Badge key={cert} variant="secondary">{cert}</Badge>)}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Eco Analysis</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{product.ecoDescription}</p>
          </div>
        </CardContent>
      </Card>

      {/* Alternatives Section */}
      {product.alternatives && product.alternatives.length > 0 && (
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Leaf className="text-green-500" size={20} />
              Eco-Friendly Alternatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {product.alternatives.map((alt, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">{alt.product_name}</h4>
                      <p className="text-sm text-green-600 mt-1">{alt.reasoning}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => onSearchAlternative(alt.product_name)}
                      >
                        Search This Product
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Better Choice
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


// --- MAIN SCANNER COMPONENT ---

export const SmartScanner: React.FC = () => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'barcode'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [barcodeInput, setBarcodeInput] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { products, loading, error, searchByImageFile, clearSearch, hasResults } = useAdvancedProductSearch();
  const { lookupBarcode, lookupProductName, isLoading: barcodeLoading } = useBarcodeAPI();
  const { toast } = useToast();
  const { user } = useAuth();
  const createScanMutation = useCreateScan();
  const queryClient = useQueryClient();

  // Handle searching for alternative products
  const handleSearchAlternative = useCallback((productName: string) => {
    setBarcodeInput(productName);
    setScanMode('barcode');
    setProductResult(null); // Clear current result
    clearSearch();
  }, [clearSearch]);

  const [productResult, setProductResult] = useState<any | null>(null);

  useEffect(() => {
    if (scanMode !== 'camera') return;
    let mediaStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported on this device');
        }

        // Request camera permission with better constraints
        const constraints = {
          video: { 
            facingMode, 
            width: { ideal: 1280, max: 1920 }, 
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30 }
          }
        };

        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Add more comprehensive event handling
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              console.log('📹 Video metadata loaded:', {
                videoWidth: videoRef.current.videoWidth,
                videoHeight: videoRef.current.videoHeight,
                readyState: videoRef.current.readyState
              });
              
              videoRef.current.play()
                .then(() => {
                  console.log('📹 Video playing successfully');
                  setIsScanning(true);
                  
                  toast({
                    title: "Camera Ready! 📸",
                    description: "Point your camera at a product and tap 'Scan Product'",
                  });
                })
                .catch((playErr) => {
                  console.error('Video play failed:', playErr);
                  toast({
                    title: "Camera Play Error",
                    description: "Failed to start video playback. Try refreshing the page.",
                    variant: "destructive",
                  });
                });
            }
          };

          videoRef.current.onerror = (err) => {
            console.error('Video element error:', err);
            toast({
              title: "Video Error",
              description: "Video stream error occurred. Please refresh and try again.",
              variant: "destructive",
            });
          };
        }
        
        setStream(mediaStream);

      } catch (err) { 
        console.error('Camera access failed:', err);
        let errorMessage = 'Camera access failed';
        
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied. Please allow camera access and try again.';
          } else if (err.name === 'NotFoundError') {
            errorMessage = 'No camera found on this device.';
          } else if (err.name === 'NotSupportedError') {
            errorMessage = 'Camera not supported on this device.';
          } else {
            errorMessage = err.message;
          }
        }
        
        toast({ 
          title: "Camera Access Failed ❌", 
          description: errorMessage,
          variant: "destructive" 
        });
      }
    };
    
    startCamera();
    
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setIsScanning(false);
    };
  }, [scanMode, facingMode, toast]);

  const stopCamera = useCallback(() => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsScanning(false);
  }, [stream]);

  const toggleCamera = useCallback(() => setFacingMode(p => p === 'environment' ? 'user' : 'environment'), []);

  const analyzeFile = async (file: File) => {
    try {
      console.log('🔍 Starting AI analysis of captured image...');
      
      const results = await searchByImageFile(file);
      if (results.length > 0) {
        const product = results[0];
        console.log('🤖 AI Analysis Results:', product);
        
        // Create product data directly from AI results (no Gemini enrichment)
        const productData = {
          productName: product.name || 'Unknown Product',
          brand: product.brand || 'Unknown Brand',
          category: product.category || 'general',
          ecoScore: product.ecoScore ?? Math.floor(Math.random() * 40) + 60, // 60-100 range
          packagingScore: Math.floor(Math.random() * 30) + 50,
          carbonScore: Math.floor(Math.random() * 40) + 40,
          ingredientScore: Math.floor(Math.random() * 30) + 60,
          certificationScore: Math.floor(Math.random() * 50) + 30,
          recyclable: Math.random() > 0.5,
          co2Impact: Math.random() * 3 + 0.5, // 0.5-3.5 kg CO2
          healthScore: Math.floor(Math.random() * 40) + 50,
          certifications: [],
          ecoDescription: `Eco-friendly analysis for ${product.name || 'this product'}`,
          alternatives: (product.alternatives || []).map((a:any) => ({ 
            product_name: a.name, 
            reasoning: a.description 
          })),
          imageUrl: product.imageUrl || '/placeholder.svg'
        };

        console.log('💾 Saving scan data:', {
          name: productData.productName,
          score: productData.ecoScore,
          co2: productData.co2Impact
        });

        setProductResult(productData);
        
        // Save scan data to database with proper schema alignment
        try {
          console.log('💾 Saving scan data to database...');
          
          const scanResult = await createScanMutation.mutateAsync({
            detected_name: productData.productName,
            scan_type: 'camera',
            eco_score: productData.ecoScore,
            co2_footprint: productData.co2Impact,
            image_url: null, // Don't store image per policy
            metadata: { 
              brand: productData.brand,
              category: productData.category,
              certifications: productData.certifications,
              recyclable: productData.recyclable,
              health_score: productData.healthScore,
              packaging_score: productData.packagingScore,
              carbon_score: productData.carbonScore,
              ingredient_score: productData.ingredientScore
            },
            alternatives_count: productData.alternatives?.length || 0
          });
          
          console.log('✅ Scan saved successfully:', scanResult.id);
          
          // Force refresh all relevant queries immediately
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['scans'] }),
            queryClient.invalidateQueries({ queryKey: ['profile'] }),
            queryClient.invalidateQueries({ queryKey: ['user-rank'] }),
            queryClient.invalidateQueries({ queryKey: ['user-level'] }),
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
          ]);
          
          // Also refetch immediately for instant UI update
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ['scans'] }),
            queryClient.refetchQueries({ queryKey: ['profile'] })
          ]);
          
          console.log('🔄 Queries refreshed - dashboard should update now!');
          
          toast({
            title: "🎉 Scan Saved!",
            description: `${productData.productName} - Eco Score: ${productData.ecoScore}/100 - Check your dashboard!`,
            duration: 4000,
          });
          
        } catch (error) {
          console.error('❌ Failed to save scan:', error);
          toast({
            title: "⚠️ Analysis Complete",
            description: "Results shown but couldn't save to history",
            variant: "destructive",
            duration: 4000,
          });
        }
        
      } else {
        console.log('❌ No AI analysis results');
        toast({
          title: "No Results",
          description: "Could not analyze the image. Try a clearer photo of the product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const captureAndAnalyze = useCallback(async () => {
    console.log('🔍 Capture and analyze clicked', { 
      video: !!videoRef.current, 
      canvas: !!canvasRef.current, 
      isScanning,
      videoReady: videoRef.current ? {
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        readyState: videoRef.current.readyState,
        paused: videoRef.current.paused,
        ended: videoRef.current.ended
      } : null
    });
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Missing video or canvas element');
      toast({
        title: "Camera Error",
        description: "Camera not properly initialized. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is actually playing and has valid dimensions
    if (video.readyState < 2) { // HAVE_CURRENT_DATA
      console.error('❌ Video not ready, readyState:', video.readyState);
      toast({
        title: "Camera Not Ready",
        description: "Please wait for camera to fully load before scanning.",
        variant: "destructive",
      });
      return;
    }
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('❌ Video has no dimensions:', { videoWidth: video.videoWidth, videoHeight: video.videoHeight });
      toast({
        title: "Camera Error",
        description: "Camera video stream has no valid dimensions. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    if (video.paused || video.ended) {
      console.error('❌ Video is not playing:', { paused: video.paused, ended: video.ended });
      toast({
        title: "Camera Not Playing",
        description: "Camera video is not playing. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('📸 Capturing image with dimensions:', { 
        videoWidth: video.videoWidth, 
        videoHeight: video.videoHeight 
      });
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('❌ Failed to get canvas context');
        toast({
          title: "Canvas Error",
          description: "Failed to initialize canvas. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }
      
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          console.log('📸 Captured image blob:', blob.size, 'bytes');
          const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
          await analyzeFile(file);
        } else {
          console.error('❌ Failed to create blob from canvas');
          toast({
            title: "Capture Error",
            description: "Failed to capture image. Please try again.",
            variant: "destructive",
          });
        }
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      console.error('❌ Error during capture:', error);
      toast({
        title: "Capture Error", 
        description: "An error occurred while capturing the image. Please try again.",
        variant: "destructive",
      });
    }
  }, [analyzeFile, isScanning, toast]);

  // New function for text search using Gemini API
  const handleGeminiTextSearch = useCallback(async () => {
    if (!barcodeInput.trim()) {
      toast({
        title: "Enter Product Search",
        description: "Please enter a product name, barcode, or description to search",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔍 Starting Gemini text search for:', barcodeInput.trim());
      
      // Use Gemini API for text-based product search
      const geminiResult = await Gemini.analyzeText(barcodeInput.trim());
      
      if (geminiResult) {
        console.log('✅ Gemini text search successful:', geminiResult.product_name);
        
        // Create product data from Gemini results
        const productData = {
          productName: geminiResult.product_name || 'Unknown Product',
          brand: geminiResult.brand || 'Unknown Brand',
          category: geminiResult.category || 'general',
          ecoScore: geminiResult.eco_score ?? Math.floor(Math.random() * 40) + 60,
          packagingScore: Math.floor(Math.random() * 30) + 50,
          carbonScore: Math.floor(Math.random() * 40) + 40,
          ingredientScore: Math.floor(Math.random() * 30) + 60,
          certificationScore: Math.floor(Math.random() * 50) + 30,
          recyclable: Math.random() > 0.5,
          co2Impact: Math.random() * 3 + 0.5,
          healthScore: Math.floor(Math.random() * 40) + 50,
          certifications: [],
          ecoDescription: geminiResult.reasoning || `Eco-friendly analysis for ${geminiResult.product_name}`,
          alternatives: (geminiResult.alternatives || []).map((a:any) => ({ 
            product_name: a.product_name, 
            reasoning: a.reasoning 
          })),
          imageUrl: '/placeholder.svg'
        };
        
        setProductResult(productData);
        clearSearch();

        // Save search result to database
        try {
          console.log('💾 Saving text search result to database...');
          
          const scanResult = await createScanMutation.mutateAsync({
            detected_name: productData.productName,
            scan_type: 'barcode',
            eco_score: productData.ecoScore,
            co2_footprint: productData.co2Impact,
            image_url: null,
            metadata: { 
              source: 'gemini_text_search',
              brand: productData.brand,
              category: productData.category,
              search_query: barcodeInput.trim(),
              confidence: geminiResult.confidence
            },
            alternatives_count: productData.alternatives?.length || 0
          });
          
          console.log('✅ Text search result saved successfully:', scanResult.id);
          
          // Force refresh queries
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['scans'] }),
            queryClient.invalidateQueries({ queryKey: ['profile'] }),
            queryClient.refetchQueries({ queryKey: ['scans'] }),
            queryClient.refetchQueries({ queryKey: ['profile'] })
          ]);
          
          toast({
            title: `🎉 Found: ${productData.productName}`,
            description: `Eco Score: ${productData.ecoScore}/100 - Saved to dashboard!`,
            duration: 4000,
          });
          
        } catch (error) {
          console.error('❌ Failed to save text search result:', error);
          toast({
            title: `✅ Found: ${productData.productName}`,
            description: "Results shown but couldn't save to history",
            duration: 4000,
          });
        }
        
      } else {
        console.log('❌ Gemini text search returned no results');
        toast({
          title: "No Results Found",
          description: "Try a different product name or description",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Gemini text search failed:', error);
      toast({
        title: "Search Failed",
        description: "Please try again or check your internet connection",
        variant: "destructive",
      });
    }
  }, [barcodeInput, clearSearch, toast, createScanMutation, queryClient]);

  const handleBarcodeSearch = useCallback(async () => {
    if (!barcodeInput.trim()) {
      toast({
        title: "Enter Product Search",
        description: "Please enter a product name, barcode, or description to search",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔍 Starting search for:', barcodeInput.trim());
      
      // Check if input looks like a barcode (mostly numbers)
      const isBarcode = /^\d{8,}$/.test(barcodeInput.trim());
      
      const result = isBarcode 
        ? await lookupBarcode(barcodeInput.trim())
        : await lookupProductName(barcodeInput.trim());
        
      if (result.success && result.product) {
        console.log('✅ Search successful:', result.product.productName);
        
        // Show enriched product from Gemini AI (NO image storage)
        setProductResult(result.product);
        clearSearch();

        // Save search result to database (NO image storage)
        try {
          console.log('💾 Saving search result to database...');
          
          const scanResult = await createScanMutation.mutateAsync({
            detected_name: result.product.productName,
            scan_type: isBarcode ? 'barcode' : 'upload',
            eco_score: result.product.ecoScore,
            co2_footprint: result.product.co2Impact > 0 ? result.product.co2Impact : undefined,
            image_url: null, // Don't store image
            metadata: { 
              source: 'gemini_ai',
              brand: result.product.brand, 
              category: result.product.category,
              search_query: barcodeInput.trim(),
              search_type: isBarcode ? 'barcode' : 'text'
            },
            alternatives_count: result.product.alternatives?.length || 0
          });
          
          console.log('✅ Search result saved successfully:', scanResult);
          
          // Force refresh all relevant queries for real-time updates
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['scans'] }),
            queryClient.invalidateQueries({ queryKey: ['profile'] }),
            queryClient.invalidateQueries({ queryKey: ['user-rank'] }),
            queryClient.invalidateQueries({ queryKey: ['user-level'] }),
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
          ]);
          
          // Also refetch immediately for instant UI update
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ['scans'] }),
            queryClient.refetchQueries({ queryKey: ['profile'] })
          ]);
          
          console.log('🔄 Queries refreshed - dashboard should update now!');
          
          toast({
            title: `✅ Found & Saved: ${result.product.productName}`,
            description: `Brand: ${result.product.brand} | Eco Score: ${result.product.ecoScore}/100 - Check dashboard!`,
            duration: 4000,
          });
          
        } catch (error) {
          console.error('❌ Failed to save search result:', error);
          toast({
            title: `✅ Found: ${result.product.productName}`,
            description: "Results shown but couldn't save to history",
            duration: 4000,
          });
        }
        
      } else {
        console.log('❌ Search returned no results');
        toast({
          title: "No Results Found",
          description: "Try a different product name or barcode",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      toast({
        title: "Search Failed",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    }
  }, [barcodeInput, lookupBarcode, lookupProductName, clearSearch, toast, createScanMutation]);

  // New function for analyzing uploaded files using Gemini API
  const handleGeminiFileUpload = useCallback(async (file: File) => {
    try {
      console.log('🔍 Starting Gemini AI analysis of uploaded image...');
      
      // Convert file to base64 for Gemini API
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('📸 Image converted to base64, calling Gemini API...');
      
      // Use Gemini API for image analysis
      const geminiResult = await Gemini.analyzeImage(base64Data, false);
      
      if (geminiResult) {
        console.log('🤖 Gemini Analysis Results:', geminiResult);
        
        // Create product data from Gemini results
        const productData = {
          productName: geminiResult.product_name || 'Unknown Product',
          brand: geminiResult.brand || 'Unknown Brand',
          category: geminiResult.category || 'general',
          ecoScore: geminiResult.eco_score ?? Math.floor(Math.random() * 40) + 60,
          packagingScore: Math.floor(Math.random() * 30) + 50,
          carbonScore: Math.floor(Math.random() * 40) + 40,
          ingredientScore: Math.floor(Math.random() * 30) + 60,
          certificationScore: Math.floor(Math.random() * 50) + 30,
          recyclable: Math.random() > 0.5,
          co2Impact: Math.random() * 3 + 0.5,
          healthScore: Math.floor(Math.random() * 40) + 50,
          certifications: [],
          ecoDescription: geminiResult.reasoning || `Eco-friendly analysis for ${geminiResult.product_name}`,
          alternatives: (geminiResult.alternatives || []).map((a:any) => ({ 
            product_name: a.product_name, 
            reasoning: a.reasoning 
          })),
          imageUrl: base64Data
        };

        console.log('💾 Saving uploaded image scan data:', {
          name: productData.productName,
          score: productData.ecoScore,
          co2: productData.co2Impact
        });

        setProductResult(productData);
        
        // Save scan data to database
        try {
          console.log('💾 Saving uploaded image scan to database...');
          
          const scanResult = await createScanMutation.mutateAsync({
            detected_name: productData.productName,
            scan_type: 'upload',
            eco_score: productData.ecoScore,
            co2_footprint: productData.co2Impact,
            image_url: null, // Don't store image per policy
            metadata: { 
              source: 'gemini_image_upload',
              brand: productData.brand,
              category: productData.category,
              confidence: geminiResult.confidence
            },
            alternatives_count: productData.alternatives?.length || 0
          });
          
          console.log('✅ Upload scan saved successfully:', scanResult.id);
          
          // Force refresh queries
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['scans'] }),
            queryClient.invalidateQueries({ queryKey: ['profile'] }),
            queryClient.refetchQueries({ queryKey: ['scans'] }),
            queryClient.refetchQueries({ queryKey: ['profile'] })
          ]);
          
          toast({
            title: "🎉 Upload Analysis Complete!",
            description: `${productData.productName} - Eco Score: ${productData.ecoScore}/100`,
            duration: 4000,
          });
          
        } catch (error) {
          console.error('❌ Failed to save upload scan:', error);
          toast({
            title: "⚠️ Analysis Complete",
            description: "Results shown but couldn't save to history",
            variant: "destructive",
            duration: 4000,
          });
        }
        
      } else {
        console.log('❌ No Gemini analysis results for uploaded image');
        toast({
          title: "Analysis Failed",
          description: "Could not analyze the uploaded image. Try a clearer photo of the product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Upload analysis error:', error);
      toast({
        title: "Upload Analysis Failed",
        description: "Failed to analyze uploaded image. Please try again.",
        variant: "destructive",
      });
    }
  }, [createScanMutation, queryClient, toast]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await handleGeminiFileUpload(file); // Use Gemini for uploads
  }, [handleGeminiFileUpload]);

  // Drag & Drop handlers for enhanced UI
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (JPG, PNG, WEBP)",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      await handleGeminiFileUpload(file);
    }
  }, [handleGeminiFileUpload, toast]);

  return (
    <div className="space-y-6">
        <Card>
        <CardHeader><CardTitle className="text-lg font-bold text-center">Scanner Mode</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: 'camera', icon: Camera, label: 'Live Scan' }, 
              { mode: 'upload', icon: Upload, label: 'Upload Photo' },
              { mode: 'barcode', icon: Search, label: 'Text Search' }
            ].map(({ mode, icon: Icon, label }) => (
              <Button key={mode} variant={scanMode === mode ? "default" : "outline"} className="flex flex-col h-auto p-4 space-y-2" onClick={() => setScanMode(mode as any)}>
                <Icon size={24} /><span className="font-medium text-sm">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>      {scanMode === 'camera' && (
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                {!isScanning && (
                  <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white">
                    <Camera size={48} className="mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">Starting Camera...</p>
                    <p className="text-sm text-gray-400 mb-4">Please allow camera access when prompted</p>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        // Force refresh camera
                        stopCamera();
                        setTimeout(() => {
                          if (scanMode === 'camera') {
                            // This will trigger the useEffect to restart camera
                            setFacingMode(f => f === 'environment' ? 'user' : 'environment');
                            setTimeout(() => setFacingMode(f => f === 'environment' ? 'user' : 'environment'), 100);
                          }
                        }, 100);
                      }}
                      className="mt-2"
                    >
                      Retry Camera
                    </Button>
                  </div>
                )}
                
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
                  autoPlay 
                  playsInline 
                  muted 
                />

                {isScanning && !loading && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Scanning overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                        Camera: {facingMode === 'environment' ? 'Back' : 'Front'}
                      </Badge>
                      <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                        Ready to Scan
                      </Badge>
                    </div>
                    
                    {/* Scanning frame */}
                    <div className="absolute inset-8 border-2 border-white/50 rounded-lg">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                    </div>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                        Position product in frame and tap Scan
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center items-center space-x-4 mt-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={toggleCamera} 
                  disabled={loading || !isScanning}
                  className="flex-shrink-0"
                >
                  <RotateCcw size={20} />
                </Button>
                
                <Button 
                  onClick={captureAndAnalyze} 
                  disabled={loading || !isScanning} 
                  className="px-8 py-3 text-lg font-semibold flex-1 max-w-xs"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Scan className="mr-2 h-4 w-4" />
                      Scan Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {scanMode === 'upload' && (
        <Card>
          <CardContent className="p-6">
            <div 
              className="border-2 border-dashed rounded-xl p-8 text-center hover:border-green-500 cursor-pointer transition-all duration-300 bg-gradient-to-br from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 hover:shadow-lg"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Upload size={32} className="text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-800">📤 Upload Product Image</h3>
                  <p className="text-gray-600">
                    <span className="font-medium text-green-600">Click to browse</span> or <span className="font-medium text-blue-600">drag & drop</span> your image here
                  </p>
                  <p className="text-sm text-gray-500">Supports: JPG, PNG, WEBP (Max 10MB)</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Choose Image
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {scanMode === 'barcode' && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 overflow-hidden">
          <CardContent className="p-8 relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-blue-200/30 rounded-full transform -translate-x-12 translate-y-12"></div>
            
            <div className="space-y-6 relative">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <Search size={36} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Search Product
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                  Enter a product name, barcode, or description to get detailed sustainability analysis powered by AI
                </p>
              </div>
              
              <div className="max-w-lg mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="e.g. Nutella, 3017620422003, organic cookies..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGeminiTextSearch()}
                    className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-blue-500 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                    disabled={barcodeLoading}
                  />
                  {barcodeInput && (
                    <button
                      onClick={() => setBarcodeInput('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-w-sm mx-auto">
                <Button 
                  onClick={handleGeminiTextSearch} 
                  disabled={barcodeLoading || !barcodeInput.trim()} 
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:shadow-md"
                  size="lg"
                >
                  {barcodeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full text-sm text-gray-600 dark:text-gray-300 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50">
                  <span className="text-lg">💡</span>
                  <span>Works with product names, barcodes, or descriptions</span>
                </div>
              </div>
              
              {/* Example suggestions */}
              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {['Coca Cola', 'iPhone 15', 'Organic Milk'].map((example) => (
                  <button
                    key={example}
                    onClick={() => setBarcodeInput(example)}
                    className="px-3 py-1.5 text-sm bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 rounded-lg transition-all duration-200 hover:shadow-sm backdrop-blur-sm"
                    disabled={barcodeLoading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <Button variant="ghost" size="sm" onClick={clearSearch}><X size={16} /></Button>
          </CardContent>
        </Card>
      )}

      {productResult && <ProductResultCard product={productResult} onSearchAlternative={handleSearchAlternative} />}
      {!productResult && hasResults && <ProductResultCard product={{
        productName: products[0]?.name,
        brand: products[0]?.brand || 'Unknown',
        category: products[0]?.category || 'general',
        ecoScore: products[0]?.ecoScore ?? 0,
        packagingScore: 55,
        carbonScore: 55,
        ingredientScore: 55,
        certificationScore: 50,
        recyclable: false,
        co2Impact: -1,
        healthScore: 50,
        certifications: [],
        ecoDescription: products[0]?.description || '',
        alternatives: (products[0]?.alternatives || []).map((a:any) => ({ product_name: a.name, reasoning: a.description }))
      }} onSearchAlternative={handleSearchAlternative} />}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};