export interface UserStats {
  totalScans: number;
  avgEcoScore: number;
  co2Saved: number;
  pointsEarned: number;
  level: number;
  levelProgress: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  level: number;
}

export const mockUserStats: UserStats = {
  totalScans: 247,
  avgEcoScore: 68,
  co2Saved: 45.6,
  pointsEarned: 3420,
  level: 5,
  levelProgress: 65,
  achievements: [
    {
      id: "first-scan",
      name: "First Steps",
      description: "Complete your first eco scan",
      icon: "🌱",
      unlocked: true,
      unlockedDate: "2024-01-15"
    },
    {
      id: "eco-warrior",
      name: "Eco Warrior",
      description: "Scan 100 products",
      icon: "⚡",
      unlocked: true,
      unlockedDate: "2024-02-10"
    },
    {
      id: "green-champion",
      name: "Green Champion",
      description: "Save 50kg of CO2",
      icon: "🏆",
      unlocked: false
    }
  ]
};

export const mockLeaderboard: LeaderboardUser[] = [
  {
    id: "1",
    name: "EcoMaster2024",
    avatar: "/api/placeholder/40/40",
    points: 8950,
    rank: 1,
    level: 12
  },
  {
    id: "2", 
    name: "GreenGuardian",
    avatar: "/api/placeholder/40/40",
    points: 7230,
    rank: 2,
    level: 10
  },
  {
    id: "3",
    name: "SustainableSarah",
    avatar: "/api/placeholder/40/40",
    points: 6540,
    rank: 3,
    level: 9
  },
  {
    id: "4",
    name: "EcoExplorer",
    avatar: "/api/placeholder/40/40",
    points: 5890,
    rank: 4,
    level: 8
  },
  {
    id: "5",
    name: "PlanetProtector",
    avatar: "/api/placeholder/40/40", 
    points: 4320,
    rank: 5,
    level: 7
  }
];

export const mockChartData = [
  { month: "Jan", scans: 12, co2Saved: 3.2 },
  { month: "Feb", scans: 19, co2Saved: 5.1 },
  { month: "Mar", scans: 28, co2Saved: 7.8 },
  { month: "Apr", scans: 35, co2Saved: 9.4 },
  { month: "May", scans: 42, co2Saved: 11.6 },
  { month: "Jun", scans: 38, co2Saved: 10.3 },
];