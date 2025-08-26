import { useState, useEffect } from 'react';
import { mockUserStats, mockLeaderboard, mockChartData, type UserStats, type LeaderboardUser } from '@/lib/mock/stats';

export const useStatsMock = () => {
  const [stats, setStats] = useState<UserStats>(mockUserStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const unlockAchievement = (achievementId: string) => {
    setStats(prev => ({
      ...prev,
      achievements: prev.achievements.map(achievement =>
        achievement.id === achievementId
          ? { ...achievement, unlocked: true, unlockedDate: new Date().toISOString().split('T')[0] }
          : achievement
      )
    }));
  };

  return {
    stats,
    loading,
    unlockAchievement
  };
};

export const useLeaderboardMock = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setLeaderboard(mockLeaderboard);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return {
    leaderboard,
    loading
  };
};

export const useChartMock = () => {
  return {
    data: mockChartData,
    loading: false
  };
};