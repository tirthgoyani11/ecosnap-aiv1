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

// Prize Modal Component with modern styling
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-white/20 dark:border-slate-700/20"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-8">
          <div className="flex items-center justify-between">
            <motion.h2 
              className="text-3xl font-black text-white flex items-center gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-2xl">
                🎁
              </div>
              Prize Vault
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-yellow-300"
              >
                ✨
              </motion.div>
            </motion.h2>
            <motion.button
              onClick={onClose}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center text-white font-bold text-xl transition-all duration-200 backdrop-blur-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </div>
          <motion.p 
            className="text-white/90 mt-3 text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Claim your rewards and show off your eco-warrior achievements!
          </motion.p>
        </div>
        
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {prizes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prizes.map((prize, index) => (
                <motion.div
                  key={prize.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <Card 
                    className={cn(
                      "relative overflow-hidden transition-all duration-300 rounded-2xl border-2 shadow-xl backdrop-blur-sm",
                      prize.rarity === 'legendary' && 'bg-gradient-to-br from-yellow-50/80 to-orange-50/80 border-yellow-400/50 shadow-yellow-500/25',
                      prize.rarity === 'epic' && 'bg-gradient-to-br from-purple-50/80 to-pink-50/80 border-purple-400/50 shadow-purple-500/25',
                      prize.rarity === 'rare' && 'bg-gradient-to-br from-blue-50/80 to-cyan-50/80 border-blue-400/50 shadow-blue-500/25',
                      prize.rarity === 'common' && 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 border-gray-400/50 shadow-gray-500/25'
                    )}
                  >
                    {/* Rarity glow effect */}
                    <div className={cn(
                      "absolute inset-0 opacity-20 blur-xl",
                      prize.rarity === 'legendary' && 'bg-gradient-to-r from-yellow-400 to-orange-500',
                      prize.rarity === 'epic' && 'bg-gradient-to-r from-purple-400 to-pink-500',
                      prize.rarity === 'rare' && 'bg-gradient-to-r from-blue-400 to-cyan-500',
                      prize.rarity === 'common' && 'bg-gradient-to-r from-gray-400 to-gray-500'
                    )}></div>
                    
                    <CardContent className="p-6 text-center relative z-10">
                      <div className="text-6xl mb-4">
                        {prize.image_url}
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-slate-800 dark:text-white">{prize.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{prize.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-full font-bold border-0 shadow-lg",
                            prize.rarity === 'legendary' && 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
                            prize.rarity === 'epic' && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
                            prize.rarity === 'rare' && 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
                            prize.rarity === 'common' && 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                          )}
                        >
                          ✨ {prize.rarity.toUpperCase()}
                        </Badge>
                        <div className="text-sm font-bold bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                          {prize.points_required} pts
                        </div>
                      </div>
                      
                      <motion.button
                        className={cn(
                          "w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg",
                          prize.is_claimable 
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/25"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        )}
                        disabled={!prize.is_claimable || isClaimingPrize}
                        onClick={() => onClaimPrize(prize.id)}
                        whileHover={prize.is_claimable ? { scale: 1.05 } : {}}
                        whileTap={prize.is_claimable ? { scale: 0.95 } : {}}
                      >
                        {isClaimingPrize ? (
                          <div className="flex items-center justify-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Claiming...
                          </div>
                        ) : prize.is_claimable ? (
                          '🎉 Claim Now!'
                        ) : (
                          '🔒 Not Available'
                        )}
                      </motion.button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="text-8xl mb-6">🎁</div>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">No Prizes Available Yet</h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Keep scanning to unlock amazing rewards! Your next prize could be just one scan away ✨
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const getBadgeInfo = (points: number) => {
  if (points >= 1000) return { 
    name: 'Legend', 
    icon: '👑', 
    color: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white border-0 shadow-lg shadow-purple-500/25',
    textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'
  };
  if (points >= 500) return { 
    name: 'Champion', 
    icon: '⚡', 
    color: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-0 shadow-lg shadow-blue-500/25',
    textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600'
  };
  if (points >= 100) return { 
    name: 'Warrior', 
    icon: '🌎', 
    color: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/25',
    textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600'
  };
  return { 
    name: 'Explorer', 
    icon: '🌿', 
    color: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-lg shadow-gray-500/25',
    textColor: 'text-gray-600'
  };
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-75 animate-pulse"></div>
        <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-600 p-2 rounded-full shadow-lg">
          <Crown className="w-4 h-4 text-white drop-shadow-sm" />
        </div>
      </div>
    );
    case 2: return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full blur opacity-75"></div>
        <div className="relative bg-gradient-to-r from-gray-400 to-gray-600 p-2 rounded-full shadow-lg">
          <Medal className="w-4 h-4 text-white drop-shadow-sm" />
        </div>
      </div>
    );
    case 3: return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur opacity-75"></div>
        <div className="relative bg-gradient-to-r from-amber-500 to-amber-700 p-2 rounded-full shadow-lg">
          <Award className="w-4 h-4 text-white drop-shadow-sm" />
        </div>
      </div>
    );
    default: return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-600">
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">#{rank}</span>
      </div>
    );
  }
};

const PodiumCard = ({ user, position }: { user: LeaderboardEntry; position: number }) => {
  const badge = getBadgeInfo(user.total_points);
  const podiumStyles = [
    {
      // 1st place - Gold with rainbow glow - Tallest
      bg: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500',
      glow: 'shadow-2xl shadow-yellow-500/40',
      border: 'border-yellow-300/50',
      textGradient: 'bg-gradient-to-r from-yellow-600 to-orange-600',
      height: 'h-96'
    },
    {
      // 2nd place - Silver with blue accent - Medium
      bg: 'bg-gradient-to-br from-slate-300 via-gray-300 to-slate-400',
      glow: 'shadow-xl shadow-slate-500/30',
      border: 'border-slate-300/50',
      textGradient: 'bg-gradient-to-r from-slate-600 to-gray-700',
      height: 'h-80'
    },
    {
      // 3rd place - Bronze with warm tones - Medium
      bg: 'bg-gradient-to-br from-amber-400 via-orange-400 to-amber-600',
      glow: 'shadow-xl shadow-amber-500/30',
      border: 'border-amber-300/50',
      textGradient: 'bg-gradient-to-r from-amber-700 to-orange-700',
      height: 'h-80'
    }
  ];

  const style = podiumStyles[position - 1];
  
  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ 
        delay: position * 0.2,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={`relative ${style.height} w-full`}
      whileHover={{ scale: 1.05, y: -10 }}
    >
      {/* Glowing background effect */}
      <div className={`absolute inset-0 ${style.bg} opacity-20 blur-xl rounded-3xl ${style.glow}`}></div>
      
      {/* Glass card */}
      <Card className={`relative h-full backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 ${style.border} rounded-3xl overflow-hidden ${style.glow} hover:bg-white/90 dark:hover:bg-slate-900/90 transition-all duration-500`}>
        {/* Animated gradient overlay */}
        <div className={`absolute inset-0 ${style.bg} opacity-10 animate-pulse`}></div>
        
        <CardContent className="p-4 md:p-6 relative z-10 h-full flex flex-col items-center justify-center text-center">
          {/* Position indicator */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            {getRankIcon(position)}
          </div>
          
          {/* Avatar with glow effect */}
          <div className="relative mb-4 mt-4">
            <div className={`absolute inset-0 ${style.bg} opacity-30 blur-lg rounded-full`}></div>
            <Avatar className="w-24 h-24 relative ring-4 ring-white/50 dark:ring-slate-700/50 shadow-2xl">
              <AvatarImage src={user.avatar_url} alt={user.user_name} className="object-cover" />
              <AvatarFallback className={`text-2xl font-bold text-white ${style.bg} shadow-lg`}>
                {user.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Streak indicator with modern styling */}
            {user.scan_streak > 5 && (
              <motion.div 
                className="absolute -bottom-2 -right-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  <Flame className="w-3 h-3 mr-1" />
                  {user.scan_streak}
                </div>
              </motion.div>
            )}
          </div>
          
          {/* User name with gradient text */}
          <h3 className={`font-bold text-xl mb-2 text-transparent bg-clip-text ${style.textGradient}`}>
            {user.user_name}
          </h3>
          
          {/* Points with modern styling */}
          <div className={`text-3xl font-black mb-3 text-transparent bg-clip-text ${style.textGradient} drop-shadow-sm`}>
            {user.total_points.toLocaleString()}
            <span className="text-sm ml-1 opacity-70">pts</span>
          </div>
          
          {/* Badge with glassmorphism */}
          <div className="mb-4">
            <Badge className={`${badge.color} text-sm px-4 py-2 rounded-full font-medium backdrop-blur-sm`}>
              <span className="mr-2">{badge.icon}</span>
              {badge.name}
            </Badge>
          </div>
          
          {/* Stats with modern cards */}
          <div className="grid grid-cols-2 gap-3 w-full text-xs">
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="font-semibold text-slate-600 dark:text-slate-300">📊 Scans</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">{user.total_scans || 0}</div>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="font-semibold text-slate-600 dark:text-slate-300">🌱 Eco Score</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">{user.eco_score_avg || 0}%</div>
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
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.02, x: 10 }}
      className={cn(
        "group relative p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-xl",
        isCurrentUser 
          ? "bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-blue-300/50 dark:border-blue-700/50 shadow-lg shadow-blue-500/20" 
          : "bg-white/60 dark:bg-slate-800/60 border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:border-slate-300/70 dark:hover:border-slate-600/70"
      )}
    >
      {/* Animated background gradient */}
      {isCurrentUser && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
      <div className="flex items-center space-x-4 relative z-10">
        {/* Rank with enhanced styling */}
        <div className="flex items-center space-x-3 min-w-[4rem]">
          <div className="w-10 text-center flex justify-center">
            {getRankIcon(user.current_rank)}
          </div>
          
          {/* Avatar with glow effect */}
          <div className="relative">
            <Avatar className="w-14 h-14 ring-2 ring-white/50 dark:ring-slate-700/50 shadow-lg transition-all duration-300 group-hover:ring-4 group-hover:shadow-xl">
              <AvatarImage src={user.avatar_url} alt={user.user_name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg">
                {user.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"></div>
          </div>
        </div>
        
        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={cn(
              "font-bold text-lg truncate", 
              isCurrentUser 
                ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" 
                : "text-slate-800 dark:text-white"
            )}>
              {user.user_name}
              {isCurrentUser && (
                <motion.span 
                  className="text-xs ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-medium shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  You ✨
                </motion.span>
              )}
            </h3>
            
            {/* Streak with enhanced styling */}
            {user.scan_streak > 3 && (
              <motion.div 
                className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Flame className="w-3 h-3 mr-1 animate-pulse" />
                {user.scan_streak} streak
              </motion.div>
            )}
          </div>
          
          {/* Stats with modern cards */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-700/80 px-3 py-1 rounded-lg backdrop-blur-sm">
              <span className="text-blue-500">📊</span>
              <span className="font-medium text-slate-600 dark:text-slate-300">{user.total_scans || 0} scans</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-700/80 px-3 py-1 rounded-lg backdrop-blur-sm">
              <span className="text-green-500">🌱</span>
              <span className="font-medium text-slate-600 dark:text-slate-300">{user.eco_score_avg || 0}% eco</span>
            </div>
            
            {/* Badge with enhanced styling */}
            <Badge className={`${badge.color} text-xs px-3 py-1.5 rounded-lg font-medium backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300`}>
              <span className="mr-1">{badge.icon}</span>
              {badge.name}
            </Badge>
          </div>
        </div>
        
        {/* Points with enhanced styling */}
        <div className="text-right min-w-[6rem]">
          <motion.div 
            className={cn(
              "text-2xl font-black mb-1 drop-shadow-sm",
              isCurrentUser 
                ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                : "text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-200 dark:to-white"
            )}
            whileHover={{ scale: 1.1 }}
          >
            {user.total_points.toLocaleString()}
          </motion.div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">points</div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {showConfetti && <ConfettiBurst isVisible={true} />}
      
      <div className="max-w-7xl mx-auto p-6 space-y-10 relative z-10">
        {/* Header with enhanced styling */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            🏆 EcoScan Elite
          </motion.h1>
          <motion.p 
            className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Join the revolution of eco-warriors making a difference, one scan at a time ✨
          </motion.p>
          
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, 20],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* User Stats & Prize Button with glassmorphism */}
        <motion.div 
          className="flex flex-col lg:flex-row gap-8 mb-12"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {userStats && (
            <motion.div 
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/20 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                      <Star className="text-white w-6 h-6" />
                    </div>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-white">
                      Your Performance
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Rank', value: `#${userStats.current_rank}`, color: 'from-blue-500 to-cyan-500', icon: '🏆' },
                      { label: 'Points', value: userStats.total_points, color: 'from-green-500 to-emerald-500', icon: '⚡' },
                      { label: 'Streak', value: userStats.scan_streak, color: 'from-orange-500 to-red-500', icon: '🔥' },
                      { label: 'Scans', value: userStats.total_scans || 0, color: 'from-purple-500 to-pink-500', icon: '📊' }
                    ].map((stat, index) => (
                      <motion.div 
                        key={stat.label}
                        className="text-center p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-1`}>
                          {stat.value}
                        </div>
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          <motion.div
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setShowPrizeModal(true)}
              className="lg:w-auto w-full h-full min-h-[200px] bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 shadow-2xl rounded-3xl border-0 text-white font-bold text-xl backdrop-blur-sm relative overflow-hidden group"
              size="lg"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div>
                  <Gift className="w-12 h-12" />
                </div>
                <div>
                  <div className="text-lg">🎁 Prize Gallery</div>
                  <div className="text-sm opacity-90">({availablePrizes?.length || 0} available)</div>
                </div>
              </div>
            </Button>
          </motion.div>
        </motion.div>

        {/* Hall of Fame with enhanced styling */}
        {topThree.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="mb-16"
          >
            <motion.h2 
              className="text-4xl font-black text-center mb-12 flex items-center justify-center gap-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-yellow-500">
                <Trophy className="w-12 h-12" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
                Hall of Fame
              </span>
            </motion.h2>
            
            {/* Podium with proper height alignment */}
            <div className="relative">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/30 via-transparent to-yellow-200/30 rounded-3xl blur-3xl"></div>
              
              {/* Podium Layout - Responsive design */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-center gap-4 md:gap-6 relative z-10">
                
                {/* Mobile: Show in order 1, 2, 3 */}
                <div className="md:hidden space-y-6">
                  {topThree[0] && (
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-20 rounded-3xl blur-2xl animate-pulse"></div>
                      <PodiumCard user={topThree[0]} position={1} />
                    </div>
                  )}
                  {topThree[1] && <PodiumCard user={topThree[1]} position={2} />}
                  {topThree[2] && <PodiumCard user={topThree[2]} position={3} />}
                </div>

                {/* Desktop: Show in podium order 2, 1, 3 */}
                <div className="hidden md:flex md:items-end md:justify-center gap-6 w-full">
                  {/* 2nd Place - Medium height */}
                  {topThree[1] && (
                    <div className="flex-1 max-w-xs">
                      <div className="h-16"></div> {/* Spacer for height difference */}
                      <PodiumCard user={topThree[1]} position={2} />
                    </div>
                  )}
                  
                  {/* 1st Place - Tallest, center position */}
                  {topThree[0] && (
                    <div className="flex-1 max-w-xs relative">
                      {/* Winner glow effect */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-20 rounded-3xl blur-2xl animate-pulse"></div>
                      <PodiumCard user={topThree[0]} position={1} />
                    </div>
                  )}
                  
                  {/* 3rd Place - Shortest */}
                  {topThree[2] && (
                    <div className="flex-1 max-w-xs">
                      <div className="h-16"></div> {/* Spacer for height difference */}
                      <PodiumCard user={topThree[2]} position={3} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard with modern styling */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm border-b border-white/20 dark:border-slate-700/20">
              <CardTitle className="flex items-center gap-4 text-2xl font-black">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                  <Users className="text-white w-6 h-6" />
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-white">
                  Global Rankings
                </span>
                
                {/* Live indicator */}
                <motion.div
                  className="flex items-center gap-2 ml-auto"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {leaderboardData && leaderboardData.length > 0 ? (
                  leaderboardData.map((userEntry, index) => (
                    <motion.div
                      key={userEntry.id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index, type: "spring", stiffness: 100 }}
                    >
                      <LeaderboardRow
                        user={userEntry}
                        isCurrentUser={user?.id === userEntry.user_id}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-16"
                  >
                    <EmptyState
                      title="🚀 Ready to Start Your Journey?"
                      description="Be the pioneer eco-warrior and claim your spot at the top of the leaderboard!"
                      icon={Trophy}
                    />
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
