import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { KPIStat } from "@/components/KPIStat";
import { LoadingSkeleton } from "@/components/LoadingSpinner";
import { useLeaderboardMock, useStatsMock } from "@/hooks/useStatsMock";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star,
  Zap,
  Award,
  TrendingUp,
  Users,
  Sparkles
} from "lucide-react";

export default function Leaderboard() {
  const { leaderboard, loading } = useLeaderboardMock();
  const { stats, unlockAchievement } = useStatsMock();
  const { toast } = useToast();

  const handleUnlockAchievement = () => {
    const lockedAchievement = stats.achievements.find(a => !a.unlocked);
    if (lockedAchievement) {
      unlockAchievement(lockedAchievement.id);
      toast({
        title: "🎉 Achievement Unlocked!",
        description: `You earned: ${lockedAchievement.name}`,
      });

      // Trigger confetti effect (would be implemented with a confetti library)
      console.log("🎊 Confetti burst!");
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case 2:
        return "from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 3:
        return "from-amber-600/20 to-amber-700/20 border-amber-600/30";
      default:
        return "from-muted/20 to-muted/10 border-muted/20";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <LoadingSkeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoadingSkeleton className="h-32" count={3} />
          </div>
          <LoadingSkeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Eco
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {" "}Leaderboard
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Compete with eco-warriors worldwide and climb the sustainability rankings.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left Column - User Stats */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {/* User Points Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats.pointsEarned.toLocaleString()}
                </div>
                <p className="text-muted-foreground">Total Points</p>
              </div>

              <div className="space-y-4">
                <KPIStat
                  title="Current Level"
                  value={stats.level}
                  icon={Zap}
                  color="primary"
                />
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to Level {stats.level + 1}</span>
                    <span>{stats.levelProgress}%</span>
                  </div>
                  <Progress value={stats.levelProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {100 - stats.levelProgress}% to next level
                  </p>
                </div>
              </div>

              <Button
                onClick={handleUnlockAchievement}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Unlock Achievement
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4">
            <KPIStat
              title="Global Rank"
              value="#247"
              icon={TrendingUp}
              color="accent"
              change={5}
              changeLabel="positions up"
            />
            <KPIStat
              title="Active Users"
              value="12.5K"
              icon={Users}
              color="secondary"
            />
          </div>
        </motion.div>

        {/* Right Column - Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Eco Warriors
                <Badge variant="secondary" className="ml-auto">
                  Global Rankings
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Top 3 Podium */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-3 gap-4 mb-8"
                >
                  {leaderboard.slice(0, 3).map((user, index) => {
                    const actualRank = index === 0 ? 1 : index === 1 ? 2 : 3;
                    const displayOrder = index === 1 ? 0 : index === 0 ? 1 : 2; // 2nd, 1st, 3rd
                    
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + displayOrder * 0.1 }}
                        className={`
                          text-center p-4 rounded-2xl glass-card
                          ${actualRank === 1 ? 'scale-110' : ''}
                          ${actualRank === 2 ? 'order-first' : ''}
                          ${actualRank === 3 ? 'order-last' : ''}
                        `}
                      >
                        <div className="relative mb-3">
                          <Avatar className={`mx-auto ${actualRank === 1 ? 'w-16 h-16' : 'w-12 h-12'}`}>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-2 -right-2">
                            {getRankIcon(actualRank)}
                          </div>
                        </div>
                        <h4 className={`font-semibold truncate ${actualRank === 1 ? 'text-lg' : 'text-sm'}`}>
                          {user.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Level {user.level}
                        </p>
                        <div className={`font-bold text-primary ${actualRank === 1 ? 'text-xl' : 'text-lg'}`}>
                          {user.points.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">points</p>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Rest of the Rankings */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Complete Rankings
                  </h4>
                  
                  <AnimatePresence>
                    {leaderboard.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className={`
                          flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer
                          bg-gradient-to-r ${getRankColor(user.rank)}
                          hover:shadow-glow
                        `}
                      >
                        {/* Rank */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50">
                          {getRankIcon(user.rank)}
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{user.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>Level {user.level}</span>
                            <Badge variant="outline" className="text-xs">
                              {user.points.toLocaleString()} pts
                            </Badge>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {user.points.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            points
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
