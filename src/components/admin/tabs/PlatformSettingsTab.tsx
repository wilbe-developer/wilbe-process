
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PlatformSettingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
        <CardDescription>
          Configure general platform settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <h3 className="font-medium">Automatic User Approval</h3>
              <p className="text-sm text-gray-600">
                Automatically approve new user registrations
              </p>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50 mr-2">
                Disabled
              </Badge>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-600">
                Send email notifications for new content
              </p>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 mr-2">
                Enabled
              </Badge>
              <Button variant="outline" size="sm">
                Disable
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <h3 className="font-medium">Video Progress Tracking</h3>
              <p className="text-sm text-gray-600">
                Track user progress through video content
              </p>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 mr-2">
                Enabled
              </Badge>
              <Button variant="outline" size="sm">
                Disable
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <h3 className="font-medium">Public Member Directory</h3>
              <p className="text-sm text-gray-600">
                Allow members to see and contact each other
              </p>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 mr-2">
                Enabled
              </Badge>
              <Button variant="outline" size="sm">
                Disable
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformSettingsTab;
