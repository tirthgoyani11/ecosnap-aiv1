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
import { 
  useLeaderboard, 
  useUserRank, 
  useAvailablePrizes, 
  useClaimPrize,
  type LeaderboardEntry
} from '@/hooks/useLeaderboard';
import { LoadingSkeleton } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ConfettiBurst } from '@/components/ConfettiBurst';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Prize Modal Component
function PrizeModal({ 
  isOpen, 
  onClose, 
  prizes = [], 
  onClaimPrize, 
  isClaimingPrize 
}: {
  isOpen: boolean;
  onClose: () => void;
  prizes: any[];
  onClaimPrize: (prizeId: string) => void;
  isClaimingPrize: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="text-yellow-500" />
              🎁 Available Prizes
            </h2>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prizes.map((prize) => (
              <Card 
                key={prize.id} 
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                  prize.rarity === 'legendary' && 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300',
                  prize.rarity === 'epic' && 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300',
                  prize.rarity === 'rare' && 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300',
                  prize.rarity === 'common' && 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
                )}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{prize.image_url}</div>
                  <h3 className="font-semibold text-lg mb-2">{prize.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{prize.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant="outline"
                      className={cn(
                        prize.rarity === 'legendary' && 'border-yellow-500 text-yellow-700',
                        prize.rarity === 'epic' && 'border-purple-500 text-purple-700',
                        prize.rarity === 'rare' && 'border-blue-500 text-blue-700',
                        prize.rarity === 'common' && 'border-gray-500 text-gray-700'
                      )}
                    >
                      {prize.rarity}
                    </Badge>
                    <div className="text-sm font-medium">
                      {prize.points_required} pts
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    disabled={!prize.is_claimable || isClaimingPrize}
                    onClick={() => onClaimPrize(prize.id)}
                    variant={prize.is_claimable ? "default" : "secondary"}
                  >
                    {isClaimingPrize ? 'Claiming...' : prize.is_claimable ? '🎉 Claim Prize!' : '🔒 Not Available'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {prizes.length === 0 && (
            <EmptyState
              title="No Prizes Available"
              description="Keep scanning to unlock amazing rewards!"
              icon={Gift}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

const getBadgeInfo = (points: number) => {
  if (points >= 1000) return { name: 'EcoLegend', icon: '👑', color: 'bg-purple-100 text-purple-800 border-purple-200' };
  if (points >= 500) return { name: 'Climate Champion', icon: '⚡', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  if (points >= 100) return { name: 'Eco Warrior', icon: '🌎', color: 'bg-green-100 text-green-800 border-green-200' };
  return { name: 'Beginner', icon: '🌿', color: 'bg-gray-100 text-gray-800 border-gray-200' };
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
  const badge = getBadgeInfo(user.total_points);
  const podiumColors = [
    'from-yellow-400 to-yellow-600', // 1st
    'from-gray-300 to-gray-500',     // 2nd
    'from-amber-400 to-amber-600'    // 3rd
  ];
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: position * 0.1 }}
      className="relative"
    >
      <Card className="text-center relative overflow-hidden border-2 shadow-lg">
        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${podiumColors[position - 1]}`} />
        <CardContent className="p-6 relative z-10">
          <div className="relative mb-4">
            <Avatar className="w-20 h-20 mx-auto mb-2 ring-4 ring-white shadow-lg">
              <AvatarImage src={user.avatar_url} alt={user.user_name} />
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                {user.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2">
              {getRankIcon(position)}
            </div>
            {user.scan_streak > 7 && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                  <Flame className="w-3 h-3 mr-1" />
                  {user.scan_streak}
                </div>
              </div>
            )}
          </div>
          
          <h3 className="font-bold text-lg mb-2">{user.user_name}</h3>
          <div className="text-2xl font-bold text-blue-600 mb-2">{user.total_points.toLocaleString()} pts</div>
          
          <div className="space-y-2">
            <Badge className={`${badge.color} text-xs`}>
              {badge.icon} {badge.name}
            </Badge>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>📊 {user.total_scans || 0} scans</div>
              <div>🌱 {user.eco_score_avg || 0}% eco</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const LeaderboardRow = ({ user, isCurrentUser }: { user: LeaderboardEntry; isCurrentUser?: boolean }) => {
  const badge = getBadgeInfo(user.total_points);
  
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
        isCurrentUser 
          ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800" 
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 text-center">
          {getRankIcon(user.current_rank)}
        </div>
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar_url} alt={user.user_name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
            {user.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={cn(
            "font-semibold", 
            isCurrentUser ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"
          )}>
            {user.user_name}
            {isCurrentUser && <span className="text-xs ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>}
          </h3>
          {user.scan_streak > 3 && (
            <div className="flex items-center text-orange-500 text-xs">
              <Flame className="w-3 h-3 mr-1" />
              {user.scan_streak}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>📊 {user.total_scans || 0} scans</span>
          <span>🌱 {user.eco_score_avg || 0}% eco</span>
          <Badge className={`${badge.color} text-xs`}>
            {badge.icon} {badge.name}
          </Badge>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-xl font-bold text-blue-600">{user.total_points.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">points</div>
      </div>
    </motion.div>
  );
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Use comprehensive leaderboard hooks
  const { data: leaderboardData, isLoading: isLoadingLeaderboard, error: leaderboardError } = useLeaderboard();
  const { data: userRank, isLoading: isLoadingRank } = useUserRank();
  const { data: availablePrizes, isLoading: isLoadingPrizes } = useAvailablePrizes();
  const claimPrizeMutation = useClaimPrize();

  const handleClaimPrize = async (prizeId: string) => {
    try {
      await claimPrizeMutation.mutateAsync(prizeId);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast.success('🎉 Prize claimed successfully!');
    } catch (error) {
      toast.error('Failed to claim prize. Please try again.');
    }
  };

  // Loading states
  if (isLoadingLeaderboard || isLoadingRank) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <LoadingSkeleton className="h-10 w-64 mx-auto mb-4" />
            <LoadingSkeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <LoadingSkeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (leaderboardError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <EmptyState
            title="Failed to load leaderboard"
            description="Please try again later or contact support if the problem persists."
            icon={Trophy}
          />
        </div>
      </div>
    );
  }

  const topThree = leaderboardData?.slice(0, 3) || [];
  const remainingUsers = leaderboardData?.slice(3) || [];
  const userStats = userRank || null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showConfetti && <ConfettiBurst isVisible={true} />}
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🏆 EcoScan Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Compete with eco-warriors worldwide and earn amazing rewards!
          </p>
        </motion.div>

        {/* User Stats & Prize Button */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {userStats && (
            <Card className="flex-1">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="text-yellow-500" />
                  Your Performance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">#{userStats.current_rank}</div>
                    <div className="text-sm text-muted-foreground">Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{userStats.total_points}</div>
                    <div className="text-sm text-muted-foreground">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{userStats.scan_streak}</div>
                    <div className="text-sm text-muted-foreground">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userStats.total_scans || 0}</div>
                    <div className="text-sm text-muted-foreground">Scans</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Button
            onClick={() => setShowPrizeModal(true)}
            className="lg:w-auto w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <Gift className="mr-2" />
            View Prizes ({availablePrizes?.length || 0})
          </Button>
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
              <Trophy className="text-yellow-500" />
              Hall of Fame
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="md:mt-8">
                  <PodiumCard user={topThree[1]} position={2} />
                </div>
              )}
              
              {/* 1st Place */}
              {topThree[0] && (
                <div>
                  <PodiumCard user={topThree[0]} position={1} />
                </div>
              )}
              
              {/* 3rd Place */}
              {topThree[2] && (
                <div className="md:mt-8">
                  <PodiumCard user={topThree[2]} position={3} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-blue-500" />
              Global Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboardData && leaderboardData.length > 0 ? (
                leaderboardData.map((userEntry, index) => (
                  <LeaderboardRow
                    key={userEntry.id}
                    user={userEntry}
                    isCurrentUser={user?.id === userEntry.user_id}
                  />
                ))
              ) : (
                <EmptyState
                  title="No leaderboard data"
                  description="Be the first to start scanning and climb the rankings!"
                  icon={Trophy}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prize Modal */}
        <PrizeModal
          isOpen={showPrizeModal}
          onClose={() => setShowPrizeModal(false)}
          prizes={availablePrizes || []}
          onClaimPrize={handleClaimPrize}
          isClaimingPrize={claimPrizeMutation.isPending}
        />
      </div>
    </div>
  );
}
