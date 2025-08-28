// Mock leaderboard data for fallback scenarios
export const mockLeaderboardData = [
  {
    user_id: 'mock-1',
    full_name: 'Alice Johnson',
    username: 'alice_eco',
    avatar_url: null,
    points: 2500,
    total_scans: 150,
    total_co2_saved: 125.5,
    rank: 1
  },
  {
    user_id: 'mock-2', 
    full_name: 'Bob Smith',
    username: 'bob_green',
    avatar_url: null,
    points: 2200,
    total_scans: 130,
    total_co2_saved: 98.2,
    rank: 2
  },
  {
    user_id: 'mock-3',
    full_name: 'Carol Wilson',
    username: 'carol_eco',
    avatar_url: null,
    points: 1800,
    total_scans: 95,
    total_co2_saved: 78.5,
    rank: 3
  },
  {
    user_id: 'mock-4',
    full_name: 'David Brown',
    username: 'david_sustainable',
    avatar_url: null,
    points: 1500,
    total_scans: 82,
    total_co2_saved: 67.3,
    rank: 4
  },
  {
    user_id: 'mock-5',
    full_name: 'Emma Davis',
    username: 'emma_green',
    avatar_url: null,
    points: 1200,
    total_scans: 68,
    total_co2_saved: 52.1,
    rank: 5
  }
];

export type MockLeaderboardEntry = typeof mockLeaderboardData[0];
