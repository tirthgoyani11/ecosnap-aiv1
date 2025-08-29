import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeminiScanService, GeminiScanResult } from "@/lib/gemini-scan-service";
import { ScoreRing } from "@/components/ScoreRing";
import { CountUpStat } from "@/components/CountUpStat";
import {
  BarChart3,
  History,
  TrendingUp,
  Calendar,
  Package,
  Leaf,
  Award,
  Eye,
  Share2,
  Download,
  Filter,
  Search,
  X,
  ArrowLeft,
  Sparkles,
  Target,
  Globe,
  Recycle,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface AnalyticsViewProps {
  onClose: () => void;
}

export function AnalyticsView({ onClose }: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'trends'>('overview');
  const [selectedScan, setSelectedScan] = useState<GeminiScanResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [analytics, setAnalytics] = useState(GeminiScanService.getAnalytics());

  useEffect(() => {
    // Update analytics when component mounts
    setAnalytics(GeminiScanService.getAnalytics());
  }, []);

  const filteredHistory = analytics.recentScans.filter(scan => {
    const matchesSearch = scan.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scan.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || scan.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(analytics.recentScans.map(scan => scan.category)));

  if (selectedScan) {
    return <ProductDetailView scan={selectedScan} onBack={() => setSelectedScan(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/30 p-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="glass-button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scanner
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              📊 Scan Analytics & History
            </h1>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'overview', label: '📈 Overview', icon: BarChart3 },
            { id: 'history', label: '🔍 Scan History', icon: History },
            { id: 'trends', label: '📊 Trends', icon: TrendingUp }
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? "default" : "outline"}
              className={`${activeTab === tab.id ? 'premium-button' : 'glass-button'}`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab analytics={analytics} />
          )}
          {activeTab === 'history' && (
            <HistoryTab 
              scans={filteredHistory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={categories}
              onSelectScan={setSelectedScan}
            />
          )}
          {activeTab === 'trends' && (
            <TrendsTab analytics={analytics} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OverviewTab({ analytics }: { analytics: any }) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">
                  <CountUpStat value={analytics.totalScans} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Eco Score</p>
                <p className="text-2xl font-bold">
                  <CountUpStat value={analytics.averageEcoScore} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">
                  <CountUpStat value={analytics.topCategories.length} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  <CountUpStat value={Math.min(analytics.totalScans, 12)} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCategories.slice(0, 5).map((category: any, index: number) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-blue-500' : 
                      index === 2 ? 'bg-purple-500' : 
                      index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{category.category}</span>
                  </div>
                  <Badge variant="secondary">{category.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Sustainability Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <ScoreRing 
              score={analytics.averageEcoScore} 
              size="lg" 
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function HistoryTab({ 
  scans, 
  searchQuery, 
  setSearchQuery, 
  filterCategory, 
  setFilterCategory, 
  categories, 
  onSelectScan 
}: any) {
  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background min-w-[150px]"
        >
          <option value="all">All Categories</option>
          {categories.map((category: string) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Scan History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scans.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scans found</h3>
            <p className="text-muted-foreground">Start scanning products to see your history here!</p>
          </div>
        ) : (
          scans.map((scan: GeminiScanResult) => (
            <Card 
              key={scan.id} 
              className="glass-card cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => onSelectScan(scan)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {scan.thumbnail && (
                    <img 
                      src={scan.thumbnail} 
                      alt={scan.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{scan.productName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{scan.brand}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {scan.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Leaf className="h-3 w-3 text-green-500" />
                        <span className="text-sm font-medium">{scan.ecoScore}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}

function TrendsTab({ analytics }: { analytics: any }) {
  return (
    <motion.div
      key="trends"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Sustainability Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end space-x-2">
            {analytics.sustainabilityTrend.map((score: number, index: number) => (
              <div 
                key={index}
                className="flex-1 bg-primary rounded-t"
                style={{ height: `${(score / 100) * 100}%` }}
                title={`Scan ${index + 1}: ${score}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Last {analytics.sustainabilityTrend.length} scans showing eco score trends
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentScans.slice(0, 5).map((scan: GeminiScanResult) => (
                <div key={scan.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{scan.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {scan.ecoScore}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Insights Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Products with high eco score (80+)</span>
                <Badge variant="secondary">
                  {analytics.recentScans.filter((s: any) => s.ecoScore >= 80).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Organic certified products</span>
                <Badge variant="secondary">
                  {analytics.recentScans.filter((s: any) => 
                    s.aiAnalysis?.certifications?.includes('Organic')).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sustainable packaging</span>
                <Badge variant="secondary">
                  {analytics.recentScans.filter((s: any) => 
                    s.aiAnalysis?.sustainability?.packaging >= 80).length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function ProductDetailView({ scan, onBack }: { scan: GeminiScanResult; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/30 p-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            onClick={onBack}
            variant="outline"
            className="glass-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="glass-button">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="glass-button">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          
          {/* Main Product Info */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  {scan.thumbnail && (
                    <img 
                      src={scan.thumbnail} 
                      alt={scan.productName}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{scan.productName}</h1>
                    <p className="text-xl text-muted-foreground mb-4">{scan.brand}</p>
                    <Badge className="mb-4">{scan.category}</Badge>
                  </div>

                  <div className="flex items-center justify-center">
                    <ScoreRing score={scan.ecoScore} size="lg" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <Recycle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-sm text-muted-foreground">Recyclability</p>
                      <p className="font-semibold">{scan.recyclability}%</p>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <Globe className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm text-muted-foreground">Carbon Footprint</p>
                      <p className="font-semibold">{scan.carbonFootprint}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Details */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Sustainability Breakdown</h4>
                  <div className="space-y-2">
                    {Object.entries(scan.aiAnalysis.sustainability).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded">
                            <div 
                              className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded"
                              style={{ width: `${value as number}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{value as number}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {scan.aiAnalysis.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {scan.aiAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Alternatives */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Sustainable Alternatives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {scan.alternatives.map((alt, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{alt.name}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Eco Score</span>
                      <Badge variant="secondary">{alt.score}</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-medium">{alt.price}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Availability</span>
                      <Badge variant={alt.availability === 'In Stock' ? 'default' : 'secondary'}>
                        {alt.availability}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alt.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
