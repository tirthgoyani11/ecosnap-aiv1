// Static hooks that never have loading states - immediate data
import { mockLeaderboardData } from '@/lib/mock/leaderboard';

// Static user profile data - no React Query
export const staticUserProfile = {
  id: 'static-user-1',
  user_id: 'static-user-1',
  full_name: 'Test User',
  username: 'testuser',
  avatar_url: null,
  points: 1250,
  total_scans: 85,
  total_co2_saved: 42.5,
  eco_score_avg: 75,
  created_at: new Date().toISOString()
};

// Static scan data
export const staticScans = [
  {
    id: 'scan-1',
    user_id: 'static-user-1',
    detected_name: 'Organic Apple',
    eco_score: 8.5,
    co2_footprint: 0.3,
    points_earned: 25,
    created_at: new Date().toISOString()
  },
  {
    id: 'scan-2', 
    user_id: 'static-user-1',
    detected_name: 'Reusable Water Bottle',
    eco_score: 9.2,
    co2_footprint: 0.1,
    points_earned: 35,
    created_at: new Date().toISOString()
  }
];

// Static user rank
export const staticUserRank = { rank: 15, total_users: 1250 };

// Static hooks that return data immediately - NO REACT QUERY
export const useProfile = () => ({
  data: staticUserProfile,
  isLoading: false,
  error: null
});

export const useScans = (limit?: number) => ({
  data: limit ? staticScans.slice(0, limit) : staticScans,
  isLoading: false,
  error: null
});

export const useUserRank = () => ({
  data: staticUserRank,
  isLoading: false,
  error: null
});

export const useLeaderboard = (limit = 50) => ({
  data: mockLeaderboardData.slice(0, limit),
  isLoading: false,
  error: null
});

// Static mutation hooks
export const useCreateScan = () => ({
  mutate: (data: any) => console.log('Static scan created:', data),
  isPending: false,
  isError: false,
});

export const useUpdateProfile = () => ({
  mutate: (data: any) => console.log('Static profile updated:', data),
  isPending: false,
  isError: false,
});

export const useDeleteScan = () => ({
  mutate: (id: string) => console.log('Static scan deleted:', id),
  isPending: false,
  isError: false,
});
