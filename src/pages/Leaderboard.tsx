import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy,
  Crown,
  Medal,
  Star,
  Flame,
  Zap,
  Award,
  Users,
  Calendar,
  TrendingUp,
  Gift,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// Temporarily commented out problematic imports
// import { useLeaderboard, useClaimPoints } from '@/hooks/useLeaderboard';
import { LoadingSkeleton } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

// Temporary interface and mock data
interface LeaderboardEntry {
  id: string;
  user_id: string;
  rank: number;
  user_name: string;
  avatar_url?: string;
  points: number;
  streak: number;
  last_active: string;
  total_scans?: number;
  eco_score_avg?: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { 
    id: '1', 
    user_id: '1', 
    rank: 1, 
    user_name: 'EcoChampion', 
    avatar_url: null, 
    points: 1250, 
    streak: 15, 
    last_active: '2024-01-15', 
    total_scans: 65, 
    eco_score_avg: 85, 
    badges: ['Early Adopter', 'Scan Master'], 
    created_at: '2024-01-01', 
    updated_at: '2024-01-15' 
  },
  { 
    id: '2', 
    user_id: '2', 
    rank: 2, 
    user_name: 'GreenWarrior', 
    avatar_url: null, 
    points: 980, 
    streak: 8, 
    last_active: '2024-01-14', 
    total_scans: 49, 
    eco_score_avg: 78, 
    badges: ['Consistent Scanner'], 
    created_at: '2024-01-02', 
    updated_at: '2024-01-14' 
  },
  { 
    id: '3', 
    user_id: '3', 
    rank: 3, 
    user_name: 'SustainableUser', 
    avatar_url: null, 
    points: 750, 
    streak: 5, 
    last_active: '2024-01-13', 
    total_scans: 38, 
    eco_score_avg: 72, 
    badges: [], 
    created_at: '2024-01-03', 
    updated_at: '2024-01-13' 
  }
];
import { ConfettiBurst } from '@/components/ConfettiBurst';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  rank: number;
  user_name: string;
  avatar_url?: string;
  points: number;
  streak: number;
  last_active: string;
  total_scans?: number;
  eco_score_avg?: number;
  badges: string[];
}

const getBadgeInfo = (points: number) => {
  if (points >= 500) return { name: 'Climate Champion', icon: '⚡', color: 'bg-purple-100 text-purple-800 border-purple-200' };
  if (points >= 100) return { name: 'Eco Warrior', icon: '🌎', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  return { name: 'Beginner', icon: '🌿', color: 'bg-green-100 text-green-800 border-green-200' };
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2: return <Medal className="w-6 h-6 text-gray-400" />;
    case 3: return <Award className="w-6 h-6 text-amber-600" />;
    default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  }
};

const PodiumCard = ({ user, position }: { user: LeaderboardEntry; position: number }) => {
  const badge = getBadgeInfo(user.points);
  const podiumColors = [
    'from-yellow-400 to-yellow-600', // 1st
    'from-gray-300 to-gray-500',     // 2nd
    'from-amber-400 to-amber-600'    // 3rd
  ];
  
  return (
    <motion.div
      initial={{ scale: 0, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ delay: position * 0.2, type: 'spring', stiffness: 200 }}
      className={cn(
        "relative p-6 rounded-2xl bg-gradient-to-br text-white shadow-lg",
        `bg-gradient-to-br ${podiumColors[position - 1]}`,
        position === 1 && "transform scale-110"
      )}
    >
      <div className="text-center space-y-4">
        <div className="relative">
          <Avatar className="w-16 h-16 mx-auto border-4 border-white shadow-lg">
            <AvatarImage src={user.avatar_url} alt={user.user_name} />
            <AvatarFallback className="text-lg font-bold">
              {user.user_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-2 -right-2">
            {getRankIcon(position)}
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-lg">{user.user_name}</h3>
          <p className="text-sm opacity-90">
            <Zap className="w-4 h-4 inline mr-1" />
            {user.points.toLocaleString()} pts
          </p>
          <p className="text-sm opacity-90">
            <Flame className="w-4 h-4 inline mr-1" />
            {user.streak} day streak
          </p>
        </div>
        
        <Badge className={cn("text-xs", badge.color)}>
          <span className="mr-1">{badge.icon}</span>
          {badge.name}
        </Badge>
      </div>
    </motion.div>
  );
};

const LeaderboardRow = ({ user, currentUserId, index }: { 
  user: LeaderboardEntry; 
  currentUserId?: string; 
  index: number; 
}) => {
  const isCurrentUser = user.user_id === currentUserId;
  const badge = getBadgeInfo(user.points);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:-translate-y-1",
        isCurrentUser 
          ? "bg-primary/5 border-primary/30 shadow-sm" 
          : "bg-card hover:bg-accent/50"
      )}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-8 h-8">
          {getRankIcon(user.rank)}
        </div>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.avatar_url} alt={user.user_name} />
          <AvatarFallback>{user.user_name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center space-x-2">
            <span className={cn("font-semibold", isCurrentUser && "text-primary")}>
              {user.user_name}
              {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
            </span>
            <Badge className={cn("text-xs", badge.color)}>
              <span className="mr-1">{badge.icon}</span>
              {badge.name}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Last active: {new Date(user.last_active).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center text-lg font-bold">
              <Zap className="w-4 h-4 mr-1 text-primary" />
              {user.points.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">points</div>
          </div>
          
          <div>
            <div className="flex items-center text-lg font-bold text-orange-600">
              <Flame className="w-4 h-4 mr-1" />
              {user.streak}
            </div>
            <div className="text-sm text-muted-foreground">streak</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'week' | 'all'>('all');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Mock data usage - replace with real hooks later
  const leaderboardData = mockLeaderboard;
  const isLoading = false;
  const error = null;
  
  const handleClaimMilestone = async () => {
    try {
      // Mock claim points functionality
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error('Failed to claim points:', error);
    }
  };
  
  if (isLoading) return <LoadingSkeleton />;
  
  if (error || !leaderboardData) {
    return (
      <EmptyState 
        icon={Trophy}
        title="Leaderboard Unavailable"
        description="Unable to load leaderboard data. Please try again later."
      />
    );
  }
  
  const topThree = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3);
  const currentUserEntry = leaderboardData.find(entry => entry.user_id === user?.id);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {showConfetti && <ConfettiBurst isVisible={showConfetti} onComplete={() => setShowConfetti(false)} />}
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-medium mb-4">
          <Trophy className="w-5 h-5" />
          <span>EcoSnap Champions</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
          🌱 EcoSnap Leaderboard
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Compete with eco-warriors worldwide! Scan products, earn points, and climb the rankings.
        </p>
        
        {/* Timeframe Toggle */}
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as 'week' | 'all')} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="week" className="text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              This Week
            </TabsTrigger>
            <TabsTrigger value="all" className="text-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              All-Time
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>
      
      {/* Current User Stats */}
      {currentUserEntry && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={currentUserEntry.avatar_url} alt={currentUserEntry.user_name} />
                    <AvatarFallback>{currentUserEntry.user_name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">Your Rank: #{currentUserEntry.rank}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentUserEntry.points} points • {currentUserEntry.streak} day streak
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleClaimMilestone}
                  disabled={false}
                  className="bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Claim +50 Points
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Podium Section */}
      {topThree.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="p-8 bg-gradient-to-br from-background to-accent/20 border-0 shadow-xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2 text-primary" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* 2nd Place */}
                <div className="md:order-1 md:mt-8">
                  <PodiumCard user={topThree[1]} position={2} />
                </div>
                
                {/* 1st Place */}
                <div className="md:order-2">
                  <PodiumCard user={topThree[0]} position={1} />
                </div>
                
                {/* 3rd Place */}
                <div className="md:order-3 md:mt-8">
                  <PodiumCard user={topThree[2]} position={3} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Full Rankings
              <Badge variant="secondary" className="ml-2">
                {leaderboardData.length} participants
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {remaining.map((user, index) => (
                <LeaderboardRow 
                  key={user.user_id} 
                  user={user} 
                  currentUserId={user?.id}
                  index={index}
                />
              ))}
            </AnimatePresence>
            
            {remaining.length === 0 && (
              <EmptyState 
                icon={Sparkles}
                title="Be the First!"
                description="Start scanning products to appear on the leaderboard."
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
