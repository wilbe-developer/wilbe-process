
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const PrivacySettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control your data and privacy preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Profile Visibility</h3>
              <p className="text-sm text-gray-600">
                Control who can see your profile in the member directory
              </p>
            </div>
            <select className="px-3 py-1.5 border rounded-md">
              <option>Everyone</option>
              <option>Members Only</option>
              <option>No One</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Contact Information</h3>
              <p className="text-sm text-gray-600">
                Control who can see your contact information
              </p>
            </div>
            <select className="px-3 py-1.5 border rounded-md">
              <option>Everyone</option>
              <option>Members Only</option>
              <option>No One</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Activity Tracking</h3>
              <p className="text-sm text-gray-600">
                Control how your activity on the platform is tracked
              </p>
            </div>
            <Button variant="outline">Manage</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive">Delete Account</Button>
      </CardFooter>
    </Card>
  );
};
