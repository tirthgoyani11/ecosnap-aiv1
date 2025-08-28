import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KPIStat } from "@/components/KPIStat";
import { ScoreRing } from "@/components/ScoreRing";
import { CountUpStat } from "@/components/CountUpStat";
import { AnimatedElement, StaggeredGrid } from "@/components/AnimatedComponents";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProfile, useScans, useUserRank } from "@/hooks/useStaticData";
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
  Star,
  Car,
  Droplet
} from "lucide-react";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: recentScans, isLoading: scansLoading } = useScans(10);
  const { data: userRankData, isLoading: rankLoading } = useUserRank();
  
  const userRank = userRankData?.rank;
  const { dailyTip } = useEcoTips();

  useEffect(() => {
    document.title = "🌿 EcoSnap AI - Dashboard";
  }, []);

  const isLoading = profileLoading || scansLoading || rankLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

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
    time: new Date(scan.created_at).toLocaleDateString(),
    points: scan.points_earned || 0
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <AnimatedElement animation="fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Your Eco Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Track your environmental impact and sustainable choices
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Rank</p>
                <p className="text-2xl font-bold text-primary">#{userRank || '—'}</p>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Stats Grid */}
        <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPIStat
            icon={Scan}
            title="Total Scans"
            value={profile?.total_scans || 0}
            change={2}
            changeLabel="this week"
            color="primary"
          />
          
          <KPIStat
            icon={TreePine}
            title="CO₂ Saved"
            value={Math.round(profile?.total_co2_saved || 0)}
            unit="kg"
            changeLabel="Keep it up!"
            color="success"
          />
          
          <KPIStat
            icon={Zap}
            title="Eco Points"
            value={profile?.points || 0}
            changeLabel="Earn more by scanning"
            color="secondary"
          />
          
          <KPIStat
            icon={Award}
            title="Avg Eco Score"
            value={Math.round(profile?.eco_score_avg || 75)}
            unit="/100"
            changeLabel="Great choices!"
            color="accent"
          />
        </StaggeredGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Eco Impact Equivalents */}
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                Your Environmental Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20 inline-block mb-3">
                    <TreePine className="h-8 w-8 text-green-600" />
                  </div>
                  <CountUpStat
                    value={ecoImpact.treesEquivalent}
                    duration={2}
                  />
                  <p className="text-lg font-medium mt-2">Trees Worth of CO₂ Absorbed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on annual absorption rates
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20 inline-block mb-3">
                    <Car className="h-8 w-8 text-blue-600" />
                  </div>
                  <CountUpStat
                    value={ecoImpact.milesNotDriven}
                    duration={2.2}
                  />
                  <p className="text-lg font-medium mt-2">Miles Not Driven</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Equivalent in car emissions avoided
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 rounded-full bg-cyan-100 dark:bg-cyan-900/20 inline-block mb-3">
                    <Droplet className="h-8 w-8 text-cyan-600" />
                  </div>
                  <CountUpStat
                    value={ecoImpact.waterSaved}
                    duration={2.4}
                  />
                  <p className="text-lg font-medium mt-2">Liters Water Saved</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Through sustainable choices
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Eco Tip */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Daily Eco Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyTip ? (
                <div>
                  <div className="text-2xl mb-2">{dailyTip.icon}</div>
                  <h3 className="font-semibold mb-2">{dailyTip.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {dailyTip.description}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {Array.from({ length: dailyTip.impact_rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">
                      Impact Rating
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Loading tip...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-3">
                      <Scan className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{activity.product}</p>
                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.score >= 70 ? "default" : "secondary"} className="text-xs">
                        {activity.score}/100
                      </Badge>
                      {activity.points > 0 && (
                        <p className="text-xs text-green-600 font-medium">+{activity.points} pts</p>
                      )}
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Scan className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs">Start scanning products to see your history!</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Link to="/scanner">
                  <Button variant="outline" className="w-full">
                    <Scan className="h-4 w-4 mr-2" />
                    Start Scanning
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      achievement.earned 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      achievement.earned 
                        ? 'bg-green-100 dark:bg-green-900/40' 
                        : 'bg-muted'
                    }`}>
                      <achievement.icon className={`h-4 w-4 ${
                        achievement.earned 
                          ? 'text-green-600' 
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        achievement.earned 
                          ? 'text-foreground' 
                          : 'text-muted-foreground'
                      }`}>
                        {achievement.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.earned && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Earned
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
