
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";
import { UserProfile, ApprovalStatus } from "@/types";
import { useNavigate } from "react-router-dom";

// Mock pending users
const PENDING_USERS: UserProfile[] = [
  {
    id: "pending1",
    firstName: "Jennifer",
    lastName: "Liu",
    email: "jennifer.liu@example.com",
    linkedIn: "https://linkedin.com/in/jenniferliu",
    institution: "Stanford University",
    location: "Palo Alto, USA",
    role: "Neuroscience PhD Candidate",
    bio: "Researching neuroplasticity and cognitive adaptation in traumatic brain injury patients.",
    approved: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "pending2",
    firstName: "Michael",
    lastName: "Park",
    email: "michael.park@example.com",
    linkedIn: "https://linkedin.com/in/michaelpark",
    institution: "UCLA",
    location: "Los Angeles, USA",
    role: "Biomedical Engineering",
    bio: "Developing novel drug delivery systems for targeted cancer therapy.",
    approved: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: "pending3",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@example.com",
    linkedIn: "https://linkedin.com/in/priyasharma",
    institution: "Cambridge University",
    location: "Cambridge, UK",
    role: "Biotechnology Researcher",
    bio: "Working on CRISPR-based genetic therapies for inherited diseases.",
    approved: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    avatar: "https://randomuser.me/api/portraits/women/57.jpg",
  },
];

const AdminPage = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState(PENDING_USERS);
  const [videoLink, setVideoLink] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [moduleId, setModuleId] = useState("startup-founder");

  // Redirect if not admin
  if (!isAdmin) {
    navigate(PATHS.HOME);
    return null;
  }

  const handleApprovalAction = (userId: string, status: ApprovalStatus) => {
    setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    
    toast({
      title: status === 'approved' ? "User Approved" : "User Rejected",
      description: `User has been ${status}. ${status === 'approved' ? 'They will be notified by email.' : ''}`,
    });
    
    // In a real app, this would trigger notifications to the user and/or update database
    console.log(`User ${userId} ${status}. This would trigger a notification to the user.`);
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would add the video to the database
    toast({
      title: "Video Added",
      description: "The video has been added to the knowledge center.",
    });
    
    // Reset form
    setVideoLink("");
    setVideoTitle("");
    setVideoDescription("");
    setModuleId("startup-founder");
    
    console.log("Video added:", { videoLink, videoTitle, videoDescription, moduleId });
    console.log("In a real app, this would add the video to the database");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage user approvals, content, and platform settings
        </p>
      </div>

      <Tabs defaultValue="approvals" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="approvals">User Approvals</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Review and approve new user registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <img
                              src={user.avatar}
                              alt={user.firstName}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                            <div>
                              {user.firstName} {user.lastName}
                              <div className="text-sm text-gray-500">
                                {user.role}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.institution}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApprovalAction(user.id, "approved")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleApprovalAction(user.id, "rejected")
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Video Content</CardTitle>
                <CardDescription>
                  Add new videos to the knowledge center
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddVideo} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoLink">YouTube Link</Label>
                    <Input
                      id="videoLink"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoTitle">Title</Label>
                    <Input
                      id="videoTitle"
                      placeholder="Video title"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoDescription">Description</Label>
                    <textarea
                      id="videoDescription"
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      placeholder="Video description"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="moduleSelect">Module</Label>
                    <select
                      id="moduleSelect"
                      className="w-full px-3 py-2 border rounded-md"
                      value={moduleId}
                      onChange={(e) => setModuleId(e.target.value)}
                      required
                    >
                      <option value="startup-founder">Startup Founder</option>
                      <option value="entrepreneurial-pi">Entrepreneurial PI</option>
                      <option value="scientist-at-startup">Scientist at Startup</option>
                      <option value="product-manager">Product Manager</option>
                    </select>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Add Video
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>
                  Configure external service integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Attio CRM</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Connected
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    New signups are automatically added to your Attio CRM
                  </p>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Slack Notifications</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Connected
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Receive notifications about new signups in your Slack workspace
                  </p>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">YouTube Integration</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Connected
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Automatically import video metadata from YouTube
                  </p>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
