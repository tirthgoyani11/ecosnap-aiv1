import React from 'react';
import { useProfile, useScans } from '@/hooks/useDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const DataFlowTest: React.FC = () => {
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { data: scans, isLoading: scansLoading, refetch: refetchScans } = useScans(5);
  
  const testData = {
    profile: profile ? {
      points: profile.points,
      total_scans: profile.total_scans,
      total_co2_saved: profile.total_co2_saved,
    } : null,
    recentScans: scans?.map(scan => ({
      id: scan.id,
      detected_name: scan.detected_name,
      eco_score: scan.eco_score,
      created_at: scan.created_at
    })) || []
  };
  
  console.log('🧪 Data Flow Test:', testData);
  
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>🧪 Data Flow Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Profile Data:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            {JSON.stringify(testData.profile, null, 2)}
          </pre>
          <p className="text-sm text-gray-600">Loading: {profileLoading ? 'Yes' : 'No'}</p>
        </div>
        
        <div>
          <h3 className="font-semibold">Recent Scans ({testData.recentScans.length}):</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto">
            {JSON.stringify(testData.recentScans, null, 2)}
          </pre>
          <p className="text-sm text-gray-600">Loading: {scansLoading ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" onClick={() => refetchProfile()}>
            Refresh Profile
          </Button>
          <Button size="sm" onClick={() => refetchScans()}>
            Refresh Scans
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          Check browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  );
};

export default DataFlowTest;
