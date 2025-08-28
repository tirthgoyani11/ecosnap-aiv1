// Simplified database hooks that return mock data
import { useQuery } from '@tanstack/react-query';
import { mockLeaderboardData } from '@/lib/mock/leaderboard';

// Mock user profile data
const mockUserProfile = {
  id: 'mock-user-1',
  user_id: 'mock-user-1',
  full_name: 'Test User',
  username: 'testuser',
  avatar_url: null,
  points: 1250,
  total_scans: 85,
  total_co2_saved: 42.5,
  eco_score_avg: 75,
  created_at: new Date().toISOString()
};

// Mock scan data
const mockScans = [
  {
    id: 'scan-1',
    user_id: 'mock-user-1',
    detected_name: 'Organic Apple',
    eco_score: 8.5,
    co2_footprint: 0.3,
    points_earned: 25,
    created_at: new Date().toISOString()
  },
  {
    id: 'scan-2', 
    user_id: 'mock-user-1',
    detected_name: 'Reusable Water Bottle',
    eco_score: 9.2,
    co2_footprint: 0.1,
    points_earned: 35,
    created_at: new Date().toISOString()
  }
];

// Hook to get user profile
export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      console.log('📱 Using mock user profile');
      return mockUserProfile;
    },
    staleTime: 0,
    retry: false,
  });
};

// Hook to get user scans
export const useScans = (limit?: number) => {
  return useQuery({
    queryKey: ['scans', limit],
    queryFn: async () => {
      console.log('📊 Using mock scans data');
      return limit ? mockScans.slice(0, limit) : mockScans;
    },
    staleTime: 0,
    retry: false,
  });
};

// Hook to get user rank
export const useUserRank = () => {
  return useQuery({
    queryKey: ['userRank'],
    queryFn: async () => {
      console.log('🏆 Using mock user rank');
      return { rank: 15, total_users: 1250 };
    },
    staleTime: 0,
    retry: false,
  });
};

// Hook to get leaderboard data
export const useLeaderboard = (limit = 50) => {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      console.log('🏆 Using mock leaderboard data');
      return mockLeaderboardData.slice(0, limit);
    },
    staleTime: 0,
    retry: false,
  });
};

// Mock mutation hooks
export const useCreateScan = () => ({
  mutate: (data: any) => console.log('Mock scan created:', data),
  isPending: false,
  isError: false,
});

export const useUpdateProfile = () => ({
  mutate: (data: any) => console.log('Mock profile updated:', data),
  isPending: false,
  isError: false,
});

export const useDeleteScan = () => ({
  mutate: (id: string) => console.log('Mock scan deleted:', id),
  isPending: false,
  isError: false,
});
