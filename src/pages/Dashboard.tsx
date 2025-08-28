import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KPIStat } from "@/components/KPIStat";
import { ScoreRing } from "@/components/ScoreRing";
import { CountUpStat } from "@/components/CountUpStat";
import { AnimatedElement, StaggeredGrid } from "@/components/AnimatedComponents";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProfile, useScans, useUserRank } from "@/hooks/useDatabase";
import { useEcoTips } from "@/hooks/useEcoTips";
import { 
  Scan, 
  Leaf, 
  TrendingUp, 
  Award,
  Calendar,
  BarChart3,
  Zap,
  ArrowRight,
  Users,
  Target,
  TreePine,
  Recycle,
  Lightbulb,
  Star
} from "lucide-react";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: recentScans, isLoading: scansLoading } = useScans(10);
  const { data: userRank, isLoading: rankLoading } = useUserRank();
  const { dailyTip, getHighImpactTips } = useEcoTips();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "🌿 EcoSnap AI - Dashboard";
    
    // Simulate loading for smooth animation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const isLoading = profileLoading || scansLoading || rankLoading;

  // Calculate achievements based on real data
  const achievements = [
    { 
      icon: Scan, 
      title: "First Scan", 
      description: "Completed your first product scan",
      earned: (profile?.total_scans || 0) > 0,
      date: (profile?.total_scans || 0) > 0 ? "Completed" : null
    },
    { 
      icon: TreePine, 
      title: "Eco Warrior", 
      description: "Scanned 10 sustainable products",
      earned: (profile?.total_scans || 0) >= 10,
      date: (profile?.total_scans || 0) >= 10 ? "Completed" : null
    },
    { 
      icon: Award, 
      title: "Point Master", 
      description: "Earned 500 eco points",
      earned: (profile?.points || 0) >= 500,
      date: (profile?.points || 0) >= 500 ? "Completed" : null
    },
    { 
      icon: Recycle, 
      title: "Carbon Saver", 
      description: "Helped save 25kg of CO₂",
      earned: (profile?.total_co2_saved || 0) >= 25,
      date: (profile?.total_co2_saved || 0) >= 25 ? "Completed" : null
    },
    { 
      icon: Users, 
      title: "Community Member", 
      description: "Joined the top 100 eco-scanners",
      earned: (userRank || 999) <= 100,
      date: (userRank || 999) <= 100 ? "Completed" : null
    }
  ];

  // Calculate eco impact equivalents
  const co2Saved = profile?.total_co2_saved || 0;
  const ecoImpact = {
    treesEquivalent: Math.round(co2Saved / 22), // 1 tree absorbs ~22kg CO2/year
    milesNotDriven: Math.round(co2Saved * 2.4), // 1kg CO2 = ~2.4 miles in average car
    waterSaved: Math.round(co2Saved * 65), // Rough estimate of water saved in liters
  };

  const recentActivity = recentScans?.slice(0, 3).map(scan => ({
    type: "scan",
    product: scan.detected_name || "Product Scan",
    score: scan.eco_score || 0,
    action: "Scan completed",
    time: new Date(scan.created_at).toLocaleDateString()
  })) || [
    {
      type: "scan",
      product: "No recent scans",
      score: 0,
      action: "Start scanning to see activity",
      time: "Never"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate weekly scans (for display)
  const weeklyScans = Math.min(stats.totalScans, 12);
  const monthlyGoal = 50;
  const weeklyGoal = Math.round(monthlyGoal / 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <AnimatedElement animation="fadeIn">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              <BarChart3 size={32} className="text-green-600" />
              <h1 className="text-3xl md:text-4xl font-bold">
                Your Impact Dashboard
              </h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track your sustainable journey and see how your choices are making a difference for the planet
            </p>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              Rating: {stats.sustainabilityRating}
            </Badge>
          </div>
        </AnimatedElement>

        {/* Key Metrics */}
        <StaggeredGrid>
          <AnimatedElement animation="fadeInUp" delay={0.1}>
            <KPIStat
              icon={Scan}
              title="Total Scans"
              value={stats.totalScans}
              changeLabel="+12%"
              color="primary"
            />
          </AnimatedElement>

          <AnimatedElement animation="fadeInUp" delay={0.2}>
            <KPIStat
              icon={TreePine}
              title="CO₂ Saved"
              value={stats.co2Saved}
              unit="kg"
              changeLabel="+8%"
              color="success"
            />
          </AnimatedElement>

          <AnimatedElement animation="fadeInUp" delay={0.3}>
            <KPIStat
              icon={Zap}
              title="Eco Points"
              value={stats.ecoPoints}
              changeLabel="+15%"
              color="accent"
            />
          </AnimatedElement>

          <AnimatedElement animation="fadeInUp" delay={0.4}>
            <KPIStat
              icon={TrendingUp}
              title="Avg Eco Score"
              value={Math.round((stats.ecoPoints / Math.max(stats.totalScans, 1)) || 75)}
              unit="/100"
              changeLabel="+5%"
              color="warning"
            />
          </AnimatedElement>
        </StaggeredGrid>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Eco Score Ring */}
            <AnimatedElement animation="fadeIn">
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Overall Eco Impact
                  </h3>
                  <ScoreRing 
                    score={Math.round((stats.ecoPoints / Math.max(stats.totalScans, 1)) || 75)}
                    size="lg"
                  />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <CountUpStat 
                        value={stats.alternativesFound}
                        suffix=" found"
                      />
                      <p className="text-sm text-gray-600 mt-1">Alternatives</p>
                    </div>
                    <div className="text-center">
                      <CountUpStat 
                        value={stats.productsScanned}
                        suffix=" analyzed"
                      />
                      <p className="text-sm text-gray-600 mt-1">Products</p>
                    </div>
                  </div>
                </div>
              </Card>
            </AnimatedElement>

            {/* Progress Tracking */}
            <AnimatedElement animation="fadeInUp" delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Scans this week</span>
                    <span className="font-medium">
                      {weeklyScans}/{weeklyGoal}
                    </span>
                  </div>
                  <Progress 
                    value={(weeklyScans / weeklyGoal) * 100} 
                    className="h-3"
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {weeklyGoal - weeklyScans > 0 
                        ? `${weeklyGoal - weeklyScans} more scans to reach weekly goal`
                        : "Weekly goal achieved! 🎉"
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>

            {/* Recent Activity */}
            <AnimatedElement animation="fadeInUp" delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {activity.type === "scan" ? (
                            <Scan className="h-4 w-4 text-blue-600" />
                          ) : activity.type === "achievement" ? (
                            <Award className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <Leaf className="h-4 w-4 text-green-600" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{activity.product}</p>
                            <p className="text-xs text-gray-600">{activity.action}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {activity.score && (
                            <div className="text-sm font-medium text-green-600">
                              {activity.score}/100
                            </div>
                          )}
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Achievements */}
            <AnimatedElement animation="fadeIn">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          achievement.earned 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          achievement.earned 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <achievement.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.title}</p>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                          {achievement.earned && achievement.date && (
                            <p className="text-xs text-green-600 mt-1">{achievement.date}</p>
                          )}
                        </div>
                        {achievement.earned && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>

            {/* Quick Actions */}
            <AnimatedElement animation="fadeInUp" delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    onClick={() => window.location.href = '/scanner'}
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Start New Scan
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-green-50"
                    onClick={() => window.location.href = '/leaderboard'}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Leaderboard
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </AnimatedElement>

            {/* Environmental Impact */}
            <AnimatedElement animation="scaleIn" delay={0.2}>
              <Card className="bg-gradient-to-br from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-green-600" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {stats.co2Saved}kg CO₂
                    </div>
                    <p className="text-sm text-gray-600">Carbon footprint reduced</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/50 p-3 rounded-lg">
                      <Recycle className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-medium">{stats.alternativesFound}</div>
                      <div className="text-xs text-gray-600">Swaps Made</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <Leaf className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <div className="text-sm font-medium">{stats.achievements.length}</div>
                      <div className="text-xs text-gray-600">Achievements</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Keep scanning to increase your positive impact! 🌱
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>
          </div>
        </div>
      </div>
    </div>
  );
}
