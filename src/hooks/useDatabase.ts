import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Scan {
  id: string;
  user_id: string;
  product_id?: string;
  detected_name?: string;
  scan_type: string;
  eco_score?: number;
  co2_footprint?: number;
  points_earned?: number;
  alternatives_suggested?: number;
  image_url?: string;
  metadata?: any;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  points: number;
  total_scans: number;
  total_co2_saved: number;
  eco_score_avg?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  eco_score?: number;
  carbon_footprint?: number;
  image_url?: string;
  badges?: string[];
  sustainable?: boolean;
  recyclable?: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Hook to get user profile
export const useProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user,
  });
};

// Hook to update user profile
export const useUpdateProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<UserProfile, 'full_name' | 'username' | 'avatar_url'>>) => {
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(['profile', user?.id], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
};

// Hook to get user's scans
export const useScans = (limit?: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['scans', user?.id, limit],
    queryFn: async () => {
      if (!user) throw new Error('No user found');
      
      let query = supabase
        .from('scans')
        .select(`
          *,
          products (
            id,
            name,
            brand,
            eco_score,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as (Scan & { products?: Product })[];
    },
    enabled: !!user,
  });
};

// Hook to create a new scan
export const useCreateScan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (scanData: {
      detected_name: string;
      scan_type: 'camera' | 'barcode' | 'upload' | 'text';
      eco_score?: number;
      co2_footprint?: number;
      image_url?: string;
      metadata?: any;
    }) => {
      if (!user) throw new Error('No user found');
      
      const points = scanData.eco_score ? Math.round(scanData.eco_score * 10) : 10;
      
      const { data, error } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          detected_name: scanData.detected_name,
          scan_type: scanData.scan_type,
          eco_score: scanData.eco_score || Math.floor(Math.random() * 40) + 60, // Mock score 60-100
          co2_footprint: scanData.co2_footprint || Math.random() * 5 + 1, // Mock 1-6 kg CO2
          points_earned: points,
          image_url: scanData.image_url,
          metadata: scanData.metadata,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update user profile stats
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('points, total_scans, total_co2_saved')
        .eq('user_id', user.id)
        .single();
      
      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({
            points: currentProfile.points + points,
            total_scans: currentProfile.total_scans + 1,
            total_co2_saved: currentProfile.total_co2_saved + (scanData.co2_footprint || Math.random() * 5 + 1),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: "Scan completed!",
        description: `You earned ${data.points_earned} points for scanning "${data.detected_name}"`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save scan. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating scan:', error);
    },
  });
};

// Hook to get products (for discover page)
export const useProducts = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['products', limit, offset],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data as Product[];
    },
  });
};

// Hook to search products
export const useProductSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: ['productSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!searchTerm.trim(),
  });
};

// Hook for bulk scan operations
export const useBulkScan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (scans: Array<{
      detected_name: string;
      scan_type: 'bulk';
      eco_score?: number;
      co2_footprint?: number;
    }>) => {
      if (!user) throw new Error('No user found');
      
      const scanRecords = scans.map(scan => ({
        user_id: user.id,
        detected_name: scan.detected_name,
        scan_type: scan.scan_type,
        eco_score: scan.eco_score || Math.floor(Math.random() * 40) + 60,
        co2_footprint: scan.co2_footprint || Math.random() * 5 + 1,
        points_earned: Math.round((scan.eco_score || 75) * 10),
      }));
      
      const { data, error } = await supabase
        .from('scans')
        .insert(scanRecords)
        .select();
      
      if (error) throw error;
      
      // Calculate totals for profile update
      const totalPoints = scanRecords.reduce((sum, scan) => sum + scan.points_earned, 0);
      const totalCo2Saved = scanRecords.reduce((sum, scan) => sum + scan.co2_footprint, 0);
      
      // Update user profile stats
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('points, total_scans, total_co2_saved')
        .eq('user_id', user.id)
        .single();
      
      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({
            points: currentProfile.points + totalPoints,
            total_scans: currentProfile.total_scans + scanRecords.length,
            total_co2_saved: currentProfile.total_co2_saved + totalCo2Saved,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }
      
      return { scans: data, totalPoints, totalScans: scanRecords.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      
      toast({
        title: "Bulk scan completed!",
        description: `Successfully scanned ${data.totalScans} products and earned ${data.totalPoints} points!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process bulk scan. Please try again.",
        variant: "destructive",
      });
      console.error('Error in bulk scan:', error);
    },
  });
};
