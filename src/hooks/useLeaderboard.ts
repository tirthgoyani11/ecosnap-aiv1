import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface LeaderboardEntry {
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

// Hook to get leaderboard data using profiles table
export const useLeaderboard = (timeframe: 'week' | 'all' = 'all') => {
  return useQuery({
    queryKey: ['leaderboard', timeframe],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      console.log('🏆 Fetching leaderboard data...');
      
      let query = supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false });
      
      // Filter for users with activity this week if requested
      if (timeframe === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        query = query.gte('updated_at', oneWeekAgo.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Leaderboard query error:', error);
        throw error;
      }
      
      if (!data) return [];
      
      // Transform and rank the data
      const transformedData: LeaderboardEntry[] = data.map((entry, index) => ({
        id: entry.id,
        user_id: entry.user_id,
        rank: index + 1,
        user_name: entry.full_name || entry.username || 'Anonymous User',
        avatar_url: entry.avatar_url,
        points: entry.points,
        streak: calculateStreak(entry.updated_at), // Calculate streak based on activity
        last_active: entry.updated_at,
        total_scans: entry.total_scans || 0,
        eco_score_avg: entry.eco_score_avg || 0,
        badges: getBadgesForPoints(entry.points),
        created_at: entry.created_at,
        updated_at: entry.updated_at
      }));
      
      console.log('✅ Leaderboard data fetched:', transformedData.length, 'entries');
      return transformedData;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get user's rank
export const useUserRank = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userRank', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('❌ User rank query error:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Count users with higher points
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('points', data.points);
      
      if (countError) throw countError;
      
      return (count || 0) + 1; // Add 1 because count gives users above current user
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook to claim points (milestone feature)
export const useClaimPoints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ points }: { points: number }) => {
      if (!user) throw new Error('No user found');
      
      // Get current profile
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();
      
      if (!currentProfile) throw new Error('Profile not found');
      
      // Update profile with new points
      const { data, error } = await supabase
        .from('profiles')
        .update({
          points: currentProfile.points + points,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['userRank'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: "Points Claimed! 🎉",
        description: `You earned 50 points! Keep scanning to climb the leaderboard.`,
      });
    },
    onError: (error) => {
      console.error('❌ Claim points error:', error);
      toast({
        title: "Error",
        description: "Failed to claim points. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook to subscribe to real-time leaderboard changes
export const useLeaderboardSubscription = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['leaderboard-subscription'],
    queryFn: () => {
      const subscription = supabase
        .channel('leaderboard-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: 'points=neq.0'
          },
          (payload) => {
            console.log('🔄 Profile points change detected:', payload);
            // Invalidate leaderboard queries to refetch data
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            queryClient.invalidateQueries({ queryKey: ['userRank'] });
          }
        )
        .subscribe();
      
      return subscription;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

// Utility function to calculate streak based on last activity
function calculateStreak(lastActive: string): number {
  const lastActiveDate = new Date(lastActive);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Simple streak calculation: max 30 days, decreases if not active
  if (diffDays <= 1) return 30; // Very active
  if (diffDays <= 3) return 15; // Active
  if (diffDays <= 7) return 7;  // Weekly active
  if (diffDays <= 14) return 3; // Biweekly active
  return 1; // Default streak
}

// Utility function to get badges based on points
function getBadgesForPoints(points: number): string[] {
  const badges: string[] = [];
  
  if (points >= 500) badges.push('Climate Champion');
  else if (points >= 100) badges.push('Eco Warrior');
  else badges.push('Beginner');
  
  // Additional milestone badges
  if (points >= 1000) badges.push('Sustainability Master');
  if (points >= 2000) badges.push('Planet Protector');
  if (points >= 5000) badges.push('Eco Legend');
  
  return badges;
}
