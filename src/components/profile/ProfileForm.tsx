
import { useState, useEffect } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface ProfileFormProps {
  user: UserProfile;
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const { updateProfile } = useAuth();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    linkedIn: user?.linkedIn || "",
    institution: user?.institution || "",
    location: user?.location || "",
    expertise: user?.expertise || "",
    about: user?.about || "",
    twitterHandle: user?.twitterHandle || "",
  });

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        linkedIn: user.linkedIn || "",
        institution: user.institution || "",
        location: user.location || "",
        expertise: user.expertise || "",
        about: user.about || "",
        twitterHandle: user.twitterHandle || "",
      });
      setAvatarUrl(user.avatar || null);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await updateProfile({
        ...formData,
        avatar: avatarUrl,
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    setUploading(true);
    
    try {
      // Create the avatars bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!avatarBucketExists) {
        // Create the avatars bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
          public: true
        });
        
        if (createBucketError) {
          console.error('Error creating avatars bucket:', createBucketError);
          throw createBucketError;
        }
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (data) {
        setAvatarUrl(data.publicUrl);
        await updateProfile({ avatar: data.publicUrl });
        
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully."
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl || undefined} alt={user.firstName} />
              <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                id="avatar"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
              <Label htmlFor="avatar" className="cursor-pointer">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="relative" 
                  disabled={uploading}
                  onClick={() => document.getElementById('avatar')?.click()}
                >
                  {uploading ? "Uploading..." : "Change Avatar"}
                </Button>
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedIn">LinkedIn Profile</Label>
            <Input
              id="linkedIn"
              name="linkedIn"
              value={formData.linkedIn}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourusername"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterHandle">X (Twitter) Handle</Label>
            <Input
              id="twitterHandle"
              name="twitterHandle"
              value={formData.twitterHandle}
              onChange={handleInputChange}
              placeholder="@yourusername"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Institution / University</Label>
            <Input
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Expertise</Label>
            <Input
              id="expertise"
              name="expertise"
              value={formData.expertise}
              onChange={handleInputChange}
              placeholder="Your area of expertise"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">About</Label>
            <textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              placeholder="Tell us about yourself, your research, and your interests..."
              className="w-full min-h-[120px] px-3 py-2 border rounded-md resize-y"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
