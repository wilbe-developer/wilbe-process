
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const AccountSettings = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter your current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter your new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Update Password</Button>
        </CardFooter>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive email updates about new content and events
                </p>
              </div>
              <Button variant="outline">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Platform Updates</h3>
                <p className="text-sm text-gray-600">
                  Get notified about platform features and improvements
                </p>
              </div>
              <Button variant="outline">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Community Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive updates about member activities and discussions
                </p>
              </div>
              <Button variant="outline">Disabled</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
