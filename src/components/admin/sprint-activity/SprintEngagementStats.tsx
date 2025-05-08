
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SprintEngagementStats = () => {
  // This component will be expanded in the future to show task completion rates,
  // time spent on tasks, and other engagement metrics
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sprint Engagement</CardTitle>
        </CardHeader>
        <CardContent className="min-h-52">
          <div className="flex flex-col items-center justify-center h-60 text-center space-y-4">
            <p className="text-lg text-gray-500">
              Sprint engagement tracking is coming soon.
            </p>
            <p className="text-sm text-gray-400 max-w-md">
              This section will display task completion rates, time spent on tasks, and other
              engagement metrics once the sprint is live.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SprintEngagementStats;
