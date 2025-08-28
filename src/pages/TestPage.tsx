import React from 'react';
import { useLeaderboard } from '@/hooks/useDatabaseSimple';
import { useAuth } from '@/contexts/AuthContextSimple';

export default function TestPage() {
  const { data: leaderboard, isLoading } = useLeaderboard();
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Test Page - Debugging App Issues</h1>
      
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">User Status</h2>
          <p>User: {user?.full_name || 'Not loaded'}</p>
          <p>Email: {user?.email || 'Not loaded'}</p>
        </div>
        
        {/* Leaderboard Info */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Leaderboard Status</h2>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Data Count: {leaderboard?.length || 0}</p>
          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-2">
              <p>First User: {leaderboard[0].full_name}</p>
              <p>Points: {leaderboard[0].points}</p>
            </div>
          )}
        </div>
        
        {/* Simple Navigation Test */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Navigation Test</h2>
          <div className="space-x-4">
            <a href="/dashboard" className="text-blue-500 hover:underline">Dashboard</a>
            <a href="/leaderboard" className="text-blue-500 hover:underline">Leaderboard</a>
            <a href="/scanner" className="text-blue-500 hover:underline">Scanner</a>
          </div>
        </div>
      </div>
    </div>
  );
}
