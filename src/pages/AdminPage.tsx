import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

const AdminPage = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoLink, setVideoLink] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [modules, setModules] = useState<{id: string, title: string}[]>([]);
  const [presenter, setPresenter] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('approved', false);

        if (profileError) {
          throw profileError;
        }

        if (profileData) {
          const userProfiles: UserProfile[] = profileData.map(profile => ({
            id: profile.id,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || '',
            linkedIn: profile.linked_in,
            institution: profile.institution,
            location: profile.location,
            role: profile.role,
            bio: profile.bio,
            approved: profile.approved || false,
            createdAt: new Date(profile.created_at || Date.now()),
            avatar: profile.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
          }));
          setPendingUsers(userProfiles);
        }

        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('id, title')
          .order('title');

        if (modulesError) {
          throw modulesError;
        }

        if (modulesData) {
          setModules(modulesData);
          if (modulesData.length > 0) {
            setModuleId(modulesData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, toast]);

  if (!isAdmin) {
    navigate(PATHS.HOME);
    return null;
  }

  const handleApprovalAction = async (userId: string, status: ApprovalStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approved: status === 'approved' })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      
      toast({
        title: status === 'approved' ? "User Approved" : "User Rejected",
        description: `User has been ${status}. ${status === 'approved' ? 'They will be notified by email.' : ''}`,
      });
      
      console.log(`User ${userId} ${status}. This would trigger a notification to the user.`);
    } catch (error) {
      console.error('Error updating user approval status:', error);
      toast({
        title: "Error",
        description: "Failed to update user approval status",
        variant: "destructive"
      });
    }
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (!videoTitle || !videoLink || !videoDescription || !moduleId) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      const youtubeId = extractYoutubeId(videoLink);
      if (!youtubeId) {
        toast({
          title: "Invalid YouTube URL",
          description: "Please enter a valid YouTube video URL",
          variant: "destructive"
        });
        return;
      }
      
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert({
          title: videoTitle,
          description: videoDescription,
          youtube_id: youtubeId,
          thumbnail_url: thumbnailUrl,
          presenter: presenter,
          duration: duration,
          status: 'published'
        })
        .select()
        .single();
      
      if (videoError) throw videoError;
      
      const { error: moduleVideoError } = await supabase
        .from('module_videos')
        .insert({
          module_id: moduleId,
          video_id: videoData.id
        });
      
      if (moduleVideoError) throw moduleVideoError;
      
      toast({
        title: "Video Added",
        description: "The video has been added to the knowledge center.",
      });
      
      setVideoLink("");
      setVideoTitle("");
      setVideoDescription("");
      setPresenter("");
      setDuration("");
      
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!moduleName) {
        toast({
          title: "Module Name Required",
          description: "Please enter a module name",
          variant: "destructive"
        });
        return;
      }
      
      const slug = moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const { data, error } = await supabase
        .from('modules')
        .insert({
          title: moduleName,
          slug: slug,
          description: `Content related to ${moduleName}`
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setModules([...modules, { id: data.id, title: data.title }]);
      
      toast({
        title: "Module Added",
        description: "The new module has been created.",
      });
      
      setModuleName("");
      
    } catch (error) {
      console.error("Error adding module:", error);
      toast({
        title: "Error",
        description: "Failed to add module. Please try again.",
        variant: "destructive"
      });
    }
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
              {loading ? (
                <div className="text-center py-6">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading pending approvals...</p>
                </div>
              ) : pendingUsers.length > 0 ? (
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
                    <Label htmlFor="presenter">Presenter</Label>
                    <Input
                      id="presenter"
                      placeholder="Name of presenter"
                      value={presenter}
                      onChange={(e) => setPresenter(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g. 10:30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
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
                      {modules.map(module => (
                        <option key={module.id} value={module.id}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    Add Video
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Add Module</CardTitle>
                <CardDescription>
                  Create a new module to organize videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddModule} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="moduleName">Module Name</Label>
                    <Input
                      id="moduleName"
                      placeholder="E.g. Lab Skills, Research Funding"
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    Add Module
                  </Button>
                </form>
                
                <div className="mt-8">
                  <h3 className="font-medium mb-2">Available Modules</h3>
                  {modules.length > 0 ? (
                    <div className="space-y-2">
                      {modules.map(module => (
                        <div key={module.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{module.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No modules created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
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
