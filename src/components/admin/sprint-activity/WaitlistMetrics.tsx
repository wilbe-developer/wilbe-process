
import React from "react";
import { useSprintAdminData } from "@/hooks/useSprintAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RefreshCcw, Users, Link, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const WaitlistMetrics = () => {
  const { waitlistSignups, referralStats, utmSources, utmMediums, isLoading, refreshData } = useSprintAdminData();

  const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981', '#2dd4bf', '#4ade80', '#facc15', '#fb923c', '#f87171'];

  // Calculate signups by date for the chart
  const getSignupsByDate = () => {
    const dateMap = new Map<string, number>();
    
    waitlistSignups.forEach(signup => {
      const date = new Date(signup.created_at).toLocaleDateString();
      const currentCount = dateMap.get(date) || 0;
      dateMap.set(date, currentCount + 1);
    });
    
    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Waitlist Metrics</h3>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Total Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-2xl font-bold">{referralStats.totalSignups}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Referred Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Link className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-2xl font-bold">{referralStats.totalReferrals}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Referral Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-2xl font-bold">
                {referralStats.totalSignups > 0 
                  ? Math.round((referralStats.totalReferrals / referralStats.totalSignups) * 100) 
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-gray-500">Top Referrer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-lg font-bold truncate">
                {referralStats.topReferrers.length > 0 
                  ? `${referralStats.topReferrers[0].name} (${referralStats.topReferrers[0].referrals})` 
                  : "No referrals yet"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Signups over time</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getSignupsByDate()}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" name="Signups" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>UTM Sources</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {utmSources.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={utmSources}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    label={({ source, count }) => `${source}: ${count}`}
                    dataKey="count"
                    nameKey="source"
                  >
                    {utmSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">No UTM source data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaitlistMetrics;
