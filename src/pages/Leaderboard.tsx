import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default function Leaderboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Leaderboard (Mock Data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Leaderboard component working with mock data!</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between p-2 bg-muted rounded">
              <span> EcoChampion</span>
              <span>2,850 points</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span> GreenGuardian</span>
              <span>2,430 points</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span> SustainableScanner</span>
              <span>2,100 points</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
