import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Scan, Zap, X, RotateCcw, Loader2, CheckCircle, AlertCircle, Leaf, Package, Cloud, FlaskConical, ShieldCheck, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdvancedProductSearch } from '@/hooks/useAdvancedProductSearch';
import { useToast } from '@/hooks/use-toast';

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
  );
};


// --- MAIN SCANNER COMPONENT ---

export const SmartScanner: React.FC = () => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { products, loading, error, searchByImageFile, clearSearch, hasResults } = useAdvancedProductSearch();
  const { toast } = useToast();

  useEffect(() => {
    if (scanMode !== 'camera') return;
    let mediaStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } } });
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
      } catch (err) { console.error('Camera access failed:', err); toast({ title: "Camera Access Failed", variant: "destructive" }); }
    };
    startCamera();
    return () => {
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
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

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await analyzeFile(file);
  }, [analyzeFile]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg font-bold text-center">Scanner Mode</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[{ mode: 'camera', icon: Camera, label: 'Live Scan' }, { mode: 'upload', icon: Upload, label: 'Upload Photo' }].map(({ mode, icon: Icon, label }) => (
              <Button key={mode} variant={scanMode === mode ? "default" : "outline"} className="flex flex-col h-auto p-4 space-y-2" onClick={() => setScanMode(mode as any)}>
                <Icon size={24} /><span className="font-medium text-sm">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {scanMode === 'camera' && (
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                {loading && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center"><Loader2 className="h-12 w-12 text-white animate-spin" /></div>}
              </div>
              <div className="flex justify-center items-center space-x-4 mt-4">
                <Button variant="outline" size="icon" onClick={toggleCamera} disabled={loading}><RotateCcw size={20} /></Button>
                <Button onClick={captureAndAnalyze} disabled={loading || !isScanning} className="px-8 py-3 text-lg font-semibold"><Scan className="mr-2 h-4 w-4" />Scan Product</Button>
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