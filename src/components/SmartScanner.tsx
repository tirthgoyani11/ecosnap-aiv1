import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Scan, Zap, X, RotateCcw, Loader2, CheckCircle, AlertCircle, Leaf, Package, Cloud, FlaskConical, ShieldCheck, HeartPulse, Hash, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useAdvancedProductSearch } from '@/hooks/useAdvancedProductSearch';
import { useBarcodeAPI } from '@/hooks/useBarcodeAPI';
import { useToast } from '@/hooks/use-toast';
import { StatsService } from '../lib/stats-service-clean';

// --- NEW DETAILED PRODUCT CARD ---
const ProductResultCard = ({ product }) => {
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
          <p className="text-md text-gray-500">by {product.brand} in <Badge variant="secondary">{product.category}</Badge></p>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Badge variant={product.recyclable ? 'default' : 'destructive'}>{product.recyclable ? 'Recyclable' : 'Not Recyclable'}</Badge>
              <Badge variant="outline">CO2 Impact: {product.co2Impact} kg</Badge>
              <Badge variant="outline">Cert Score: {product.certificationScore}/100</Badge>
            </div>
          </div>

          {product.certifications && product.certifications.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map(cert => <Badge key={cert} variant="secondary">{cert}</Badge>)}
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
          // Ensure video starts playing
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error);
          };
        }
        
        setStream(mediaStream);
        setIsScanning(true);
        
        toast({
          title: "Camera Ready! 📸",
          description: "Point your camera at a product and tap 'Scan Product'",
        });

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
    const results = await searchByImageFile(file);
    if (results.length > 0) {
      const product = results[0];
      
      // Update user stats with the scan
      const alternativesCount = product.alternatives?.length || 0;
      const updatedStats = StatsService.updateAfterScan(product, alternativesCount);
      
      // Show achievement notification if any new achievements
      if (updatedStats.achievements.length > 0) {
        const latestAchievement = updatedStats.achievements[updatedStats.achievements.length - 1];
        toast({
          title: "🏆 Achievement Unlocked!",
          description: `${latestAchievement}! Total: ${updatedStats.ecoPoints} eco points`,
          duration: 5000,
        });
      }
      
      stopCamera();
    }
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
        await analyzeFile(file);
      }
    }, 'image/jpeg', 0.8);
  }, [analyzeFile]);

  const handleBarcodeSearch = useCallback(async () => {
    if (!barcodeInput.trim()) {
      toast({
        title: "Enter Barcode",
        description: "Please enter a barcode number to search",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await lookupBarcode(barcodeInput.trim());
      if (result.success && result.product) {
        // Convert barcode result to match our product structure
        const convertedProduct = {
          ...result.product,
          // Add any missing fields that our UI expects
        };
        
        // Clear previous results and show the new product
        clearSearch();
        
        // Note: We'd need to update the search hook to handle barcode results
        // For now, show a toast with the result
        toast({
          title: `Product Found: ${result.product.productName}`,
          description: `Brand: ${result.product.brand} | Eco Score: ${result.product.ecoScore}`,
        });
      }
    } catch (error) {
      console.error('Barcode search failed:', error);
    }
  }, [barcodeInput, lookupBarcode, clearSearch, toast]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await analyzeFile(file);
  }, [analyzeFile]);

  return (
    <div className="space-y-6">
        <Card>
        <CardHeader><CardTitle className="text-lg font-bold text-center">Scanner Mode</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: 'camera', icon: Camera, label: 'Live Scan' }, 
              { mode: 'upload', icon: Upload, label: 'Upload Photo' },
              { mode: 'barcode', icon: Hash, label: 'Barcode' }
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
                    <p className="text-sm text-gray-400">Please allow camera access when prompted</p>
                  </div>
                )}
                
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
                  autoPlay 
                  playsInline 
                  muted 
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {loading && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Loader2 className="h-12 w-12 mx-auto animate-spin mb-4" />
                      <p className="text-lg font-semibold">Analyzing Product...</p>
                      <p className="text-sm opacity-75">AI is processing your image</p>
                    </div>
                  </div>
                )}

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
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-green-500 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Click to upload product image</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <Button className="mt-4" disabled={loading}>{loading ? 'Processing...' : 'Choose Image'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {scanMode === 'barcode' && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Hash size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold mb-2">Enter Barcode Number</p>
                <p className="text-sm text-gray-600">Type or scan a product barcode to get detailed analysis</p>
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. 123456789012"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                  className="flex-1 text-center text-lg font-mono"
                  disabled={barcodeLoading}
                />
              </div>
              
              <Button 
                onClick={handleBarcodeSearch} 
                disabled={barcodeLoading || !barcodeInput.trim()} 
                className="w-full py-3 text-lg font-semibold"
                size="lg"
              >
                {barcodeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-4 w-4" />
                    Analyze Product
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>💡 Tip: Most barcodes are 8-13 digits long</p>
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

      {hasResults && <ProductResultCard product={products[0]} />}
    </div>
  );
};