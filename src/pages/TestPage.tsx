import React from 'react';
import { useLeaderboard } from '@/hooks/useStaticData';
import { useAuth } from '@/contexts/AuthContextSimple';

export default function TestPage() {
  const { data: leaderboard, isLoading } = useLeaderboard();
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">✅ STATIC DATA TEST - Never Loads!</h1>
      
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">User Status</h2>
          <p><strong>Loading:</strong> {isLoading ? '❌ YES (BAD)' : '✅ NO (GOOD)'}</p>
          <p><strong>User:</strong> {user?.full_name || 'Not loaded'}</p>
          <p><strong>Email:</strong> {user?.email || 'Not loaded'}</p>
        </div>
        
        {/* Leaderboard Info */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Leaderboard Status</h2>
          <p><strong>Loading:</strong> {isLoading ? '❌ YES (BAD)' : '✅ NO (GOOD)'}</p>
          <p><strong>Data Count:</strong> {leaderboard?.length || 0}</p>
          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-2">
              <p><strong>First User:</strong> {leaderboard[0].full_name}</p>
              <p><strong>Points:</strong> {leaderboard[0].points}</p>
            </div>
          )}
        </div>
        
        {/* Navigation Test */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">🔗 Navigation Test</h2>
          <p className="mb-4">Try these links after visiting leaderboard:</p>
          <div className="space-x-4">
            <a href="/dashboard" className="text-blue-500 hover:underline px-3 py-2 bg-blue-50 rounded">Dashboard</a>
            <a href="/leaderboard" className="text-green-500 hover:underline px-3 py-2 bg-green-50 rounded">Leaderboard</a>
            <a href="/scanner" className="text-purple-500 hover:underline px-3 py-2 bg-purple-50 rounded">Scanner</a>
            <a href="/test" className="text-orange-500 hover:underline px-3 py-2 bg-orange-50 rounded">Test Page</a>
          </div>
        </div>
        
        {/* Status */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">✅ Static Data Status</h2>
          <p className="text-green-700 dark:text-green-300">All data is static - no React Query, no loading states, no network calls!</p>
        </div>
      </div>
    </div>
  );
}
