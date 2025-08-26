/**
 * Smart Scanner Component
 * 
 * Advanced product scanner inspired by EcoSnap-AI repository
 * Combines barcode scanning, image analysis, text search, and AI recommendations
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Search, Scan, Zap, X, RotateCcw, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdvancedProductSearch } from '@/hooks/useAdvancedProductSearch';
import { useToast } from '@/hooks/use-toast';

interface SmartScannerProps {
  onProductFound?: (product: any) => void;
  onEcoPointsEarned?: (points: number) => void;
  mode?: 'camera' | 'upload' | 'search' | 'auto';
}

export const SmartScanner: React.FC<SmartScannerProps> = ({
  onProductFound,
  onEcoPointsEarned,
  mode: initialMode = 'auto'
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'search'>(initialMode === 'auto' ? 'camera' : initialMode);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [scanProgress, setScanProgress] = useState(0);
  const [arMode, setArMode] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    products,
    loading,
    error,
    searchMetadata,
    searchByBarcode,
    searchByName,
    searchByImage,
    clearSearch,
    hasResults
  } = useAdvancedProductSearch();

  const { toast } = useToast();

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) return;

    try {
      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
      }
    } catch (err) {
      console.error('❌ Camera access failed:', err);
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access to use live scanning",
        variant: "destructive"
      });
    }
  }, [facingMode, stream, toast]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setScanProgress(0);
  }, [stream]);

  // Toggle camera facing mode
  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  // Capture and analyze image
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setScanProgress(20);
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      setScanProgress(60);

      // Use advanced product search with image
      const foundProducts = await searchByImage(imageData);

      setScanProgress(100);

      if (foundProducts.length > 0) {
        const product = foundProducts[0];
        onProductFound?.(product);
        
        // Award eco points based on product eco score
        const points = Math.floor((product.eco_score || 50) / 10) + 5;
        onEcoPointsEarned?.(points);

        if (arMode) {
          // Keep camera running for AR overlay
        } else {
          stopCamera();
        }
      }

    } catch (error) {
      console.error('❌ Capture and analyze failed:', error);
      setScanProgress(0);
    }
  }, [searchByImage, onProductFound, onEcoPointsEarned, arMode, stopCamera]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const foundProducts = await searchByImage(base64);

      if (foundProducts.length > 0) {
        const product = foundProducts[0];
        onProductFound?.(product);
        
        // Award points for upload scanning
        const points = Math.floor((product.eco_score || 50) / 10) + 3;
        onEcoPointsEarned?.(points);
      }

    } catch (error) {
      console.error('❌ File upload failed:', error);
    }
  }, [searchByImage, onProductFound, onEcoPointsEarned]);

  // Handle text search
  const handleTextSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      const foundProducts = await searchByName(searchQuery.trim());

      if (foundProducts.length > 0) {
        const product = foundProducts[0];
        onProductFound?.(product);
        
        // Award points for text search
        const points = Math.floor((product.eco_score || 50) / 10) + 2;
        onEcoPointsEarned?.(points);
      }

    } catch (error) {
      console.error('❌ Text search failed:', error);
    }
  }, [searchQuery, searchByName, onProductFound, onEcoPointsEarned]);

  // Auto-start camera when in camera mode
  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [scanMode, startCamera, stopCamera]);

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  // Get eco score icon
  const getEcoIcon = (score: number) => {
    if (score >= 80) return '🌱';
    if (score >= 60) return '♻️';
    if (score >= 40) return '🌿';
    return '⚠️';
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-center">Smart Scanner Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: 'camera' as const, icon: Camera, label: 'Live Scan', description: 'Point camera at product' },
              { mode: 'upload' as const, icon: Upload, label: 'Upload Photo', description: 'Select image from device' },
              { mode: 'search' as const, icon: Search, label: 'Text Search', description: 'Search by product name' }
            ].map(({ mode, icon: Icon, label, description }) => (
              <Button
                key={mode}
                variant={scanMode === mode ? "default" : "outline"}
                className={`flex flex-col items-center p-4 h-auto space-y-2 ${
                  scanMode === mode ? 'bg-green-500 text-white shadow-lg' : ''
                }`}
                onClick={() => setScanMode(mode)}
              >
                <Icon size={24} />
                <span className="font-medium text-sm">{label}</span>
                <span className="text-xs opacity-75">{description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Camera Mode */}
      {scanMode === 'camera' && (
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              {/* Camera View */}
              <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* AR Overlay */}
                {arMode && hasResults && (
                  <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getEcoIcon(products[0]?.eco_score || 50)}</span>
                      <div>
                        <div className="font-bold">Eco Score: {products[0]?.eco_score || 50}/100</div>
                        <div className="text-sm opacity-90">{products[0]?.product_name || 'Unknown'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scanning Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-green-500/20 border-2 border-green-400 animate-pulse">
                    <div className="absolute inset-4 border border-white/50 rounded-lg">
                      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex justify-center items-center space-x-4 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleCamera}
                  disabled={loading}
                  title="Switch Camera"
                >
                  <RotateCcw size={20} />
                </Button>

                <Button
                  onClick={captureAndAnalyze}
                  disabled={loading || !isScanning}
                  className="px-8 py-3 text-lg font-semibold"
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

                <Button
                  variant={arMode ? "default" : "outline"}
                  size="icon"
                  onClick={() => setArMode(!arMode)}
                  title="Toggle AR Mode"
                >
                  <Zap size={20} />
                </Button>
              </div>

              {/* Progress Bar */}
              {loading && scanProgress > 0 && (
                <div className="mt-4">
                  <Progress value={scanProgress} className="w-full" />
                  <p className="text-sm text-center text-gray-600 mt-2">
                    {scanProgress < 40 ? 'Capturing image...' : 
                     scanProgress < 80 ? 'Analyzing product...' : 
                     'Almost done...'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Mode */}
      {scanMode === 'upload' && (
        <Card>
          <CardContent className="p-6">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Click to upload product image</p>
              <p className="text-sm text-gray-500">Supports JPG, PNG, WebP</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button className="mt-4" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Choose Image'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Mode */}
      {scanMode === 'search' && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter product name (e.g., Coca Cola, iPhone 15, Organic Apples)"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                />
                <Button
                  onClick={handleTextSearch}
                  disabled={loading || !searchQuery.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search size={20} />
                  )}
                </Button>
              </div>
              
              {/* Search suggestions */}
              <div className="flex flex-wrap gap-2">
                {['Coca Cola', 'iPhone', 'Organic Apple', 'Ben & Jerry\'s', 'Tide Detergent'].map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="secondary"
                    className="cursor-pointer hover:bg-green-100"
                    onClick={() => setSearchQuery(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Metadata */}
      {searchMetadata && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {searchMetadata.confidence > 0.8 ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : searchMetadata.confidence > 0.5 ? (
                  <AlertCircle className="text-yellow-500" size={16} />
                ) : (
                  <AlertCircle className="text-orange-500" size={16} />
                )}
                
                <span className="text-sm font-medium">
                  Source: {searchMetadata.source}
                </span>
                
                <Badge 
                  variant="outline" 
                  className={getConfidenceColor(searchMetadata.confidence)}
                >
                  {Math.round(searchMetadata.confidence * 100)}% confidence
                </Badge>
              </div>
              
              <span className="text-xs text-gray-500">
                {searchMetadata.searchTime}ms
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              {searchMetadata.reasoning}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-red-700">{error}</span>
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                <X size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="text-sm text-blue-700">
            <div className="font-medium mb-2">Smart Scanner Tips:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>For best results, ensure product labels are clearly visible</li>
              <li>Good lighting improves scan accuracy</li>
              <li>Try different angles if the first scan doesn't work</li>
              <li>Use text search for products that are hard to photograph</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
