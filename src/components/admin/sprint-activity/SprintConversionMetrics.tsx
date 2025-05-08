
import { useSprintAdminData } from "@/hooks/useSprintAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SprintConversionMetrics = () => {
  const { waitlistSignups, sprintProfiles, isLoading } = useSprintAdminData();
  
  // Simplified for initial version: showing basic conversion stats
  const totalWaitlist = waitlistSignups.length;
  const totalSprints = sprintProfiles.length;
  
  // For future: match emails between waitlist and sprint profiles to track conversion
  const conversionRate = totalWaitlist > 0 ? (totalSprints / totalWaitlist) * 100 : 0;
  
  const funnelData = [
    {
      name: "Waitlist Signups",
      value: totalWaitlist,
      fill: "#8B5CF6"
    },
    {
      name: "Sprint Participants",
      value: totalSprints,
      fill: "#D946EF"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Waitlist Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWaitlist}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Sprint Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSprints}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={funnelData}
              layout="vertical"
            >
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill="#8884d8"
                label={{ position: 'right', formatter: (val) => val }}
              >
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500 italic">
          Note: This is a simplified view. Future versions will track individual conversions from waitlist to sprint.
        </p>
      </div>
    </div>
  );
};

export default SprintConversionMetrics;
