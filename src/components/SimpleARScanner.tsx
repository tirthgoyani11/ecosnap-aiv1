import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Scan, X, Loader2, Eye, Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdvancedProductSearch } from '@/hooks/useAdvancedProductSearch';
import { useToast } from '@/hooks/use-toast';

interface AROverlayProps {
  product: any;
  position: { x: number; y: number };
  onClose: () => void;
}

const AROverlay = ({ product, position, onClose }: AROverlayProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="absolute bg-white/95 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20 min-w-[280px]"
    style={{
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: 'translate(-50%, -50%)',
    }}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-900">{product.productName}</h3>
        <p className="text-sm text-gray-600">{product.brand}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
        <X size={16} />
      </Button>
    </div>
    
    <div className="flex items-center gap-3 mb-3">
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold text-green-600">{product.ecoScore}</div>
        <div className="text-xs text-gray-500">Eco Score</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium">{product.co2Impact}kg</div>
        <div className="text-xs text-gray-500">CO2 Impact</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium">{product.healthScore}/100</div>
        <div className="text-xs text-gray-500">Health</div>
      </div>
    </div>

    <div className="flex flex-wrap gap-1 mb-2">
      <Badge variant={product.recyclable ? 'default' : 'secondary'} className="text-xs">
        {product.recyclable ? 'Recyclable' : 'Non-recyclable'}
      </Badge>
      {product.certifications?.slice(0, 2).map((cert: string) => (
        <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>
      ))}
    </div>

    {product.alternatives && product.alternatives.length > 0 && (
      <div className="mt-3 pt-2 border-t border-gray-200">
        <p className="text-xs text-green-600 font-medium mb-1">
          💡 Better alternative: {product.alternatives[0].product_name}
        </p>
      </div>
    )}
  </motion.div>
);

export const SimpleARScanner: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [detectedProducts, setDetectedProducts] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { searchByImageFile, loading } = useAdvancedProductSearch();
  const { toast } = useToast();

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }

      setStream(mediaStream);
      setIsActive(true);

      toast({
        title: "AR Scanner Active! 🔍",
        description: "Point at products to see live eco information",
      });

    } catch (err) {
      console.error('Camera access failed:', err);
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access to use AR scanning",
        variant: "destructive",
      });
    }
  }, [facingMode, toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setDetectedProducts([]);
  }, [stream]);

  // Toggle camera facing mode
  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  // Simulate AR detection (replace with actual AR detection logic)
  useEffect(() => {
    if (!isActive || loading || isDetecting) return;

    const detectProducts = async () => {
      // Simulate random product detection
      if (Math.random() > 0.7) {
        setIsDetecting(true);
        
        // Capture current frame for analysis
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  const file = new File([blob], "ar-scan.jpg", { type: "image/jpeg" });
                  const results = await searchByImageFile(file);
                  
                  if (results.length > 0) {
                    const product = results[0];
                    const mockProduct = {
                      ...product,
                      position: {
                        x: Math.random() * 60 + 20, // 20-80%
                        y: Math.random() * 60 + 20, // 20-80%
                      },
                      id: Date.now(),
                    };
                    
                    setDetectedProducts([mockProduct]);
                    
                    // Auto-hide after 5 seconds
                    setTimeout(() => {
                      setDetectedProducts([]);
                    }, 5000);
                  }
                } catch (error) {
                  console.error('AR detection failed:', error);
                }
              }
              setIsDetecting(false);
            }, 'image/jpeg', 0.8);
          }
        }
      }
    };

    const interval = setInterval(detectProducts, 3000);
    return () => clearInterval(interval);
  }, [isActive, searchByImageFile, loading, isDetecting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="text-blue-500" size={20} />
          AR Product Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Control Buttons */}
          <div className="flex gap-2 justify-center">
            {!isActive ? (
              <Button onClick={startCamera} className="flex items-center gap-2">
                <Camera size={18} />
                Start AR Scanner
              </Button>
            ) : (
              <>
                <Button onClick={stopCamera} variant="outline">
                  Stop Scanner
                </Button>
                <Button onClick={toggleCamera} variant="outline" size="icon">
                  <RotateCcw size={18} />
                </Button>
              </>
            )}
          </div>

          {/* Camera View */}
          {isActive && (
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* AR Overlay for detected products */}
                <AnimatePresence>
                  {detectedProducts.map((product) => (
                    <AROverlay
                      key={product.id}
                      product={product}
                      position={product.position}
                      onClose={() => setDetectedProducts([])}
                    />
                  ))}
                </AnimatePresence>

                {/* Scanning indicator */}
                {(loading || isDetecting) && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isDetecting ? 'Detecting...' : 'Analyzing...'}
                    </div>
                  </div>
                )}

                {/* AR Grid overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full border border-white/20 rounded-lg">
                    {/* Corner markers */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-green-400"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-green-400"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-green-400"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-green-400"></div>
                    
                    {/* Status */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                        AR Mode: {detectedProducts.length > 0 ? 'Product Detected' : 'Scanning...'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-600 mt-2">
                Point your camera at products to see live eco information
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
