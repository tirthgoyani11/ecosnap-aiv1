// Simple test component to verify leaderboard functionality
import React from 'react';
import { mockLeaderboardData } from '@/lib/mock/leaderboard';

export const TestLeaderboard: React.FC = () => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Test Leaderboard Data</h3>
      <div className="space-y-2">
        {mockLeaderboardData.slice(0, 3).map((user) => (
          <div key={user.user_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium">{user.full_name}</span>
            <span className="text-sm text-gray-600">{user.points} pts</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Mock data loaded successfully ✓
      </p>
    </div>
  );
};

export default TestLeaderboard;
