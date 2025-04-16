
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMembers } from "@/hooks/useMembers";
import { UserProfile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PATHS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Users, Building2, MapPin, Briefcase } from "lucide-react";

const MemberPreview = () => {
  const { members, loading } = useMembers();
  const [featuredMembers, setFeaturedMembers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!loading && members.length > 0) {
      // Get members with avatars, sorted by newest first
      const membersWithAvatars = members
        .filter(member => member.avatar)
        .sort((a, b) => {
          // Sort by creation date, newest first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, 4); // Get top 4 for preview
      
      setFeaturedMembers(membersWithAvatars);
    }
  }, [members, loading]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((_, index) => (
          <div key={index} className="flex flex-col items-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gray-200 mb-3"></div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-24 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {featuredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredMembers.map(member => (
            <Link 
              key={member.id} 
              to={`${PATHS.MEMBER_DIRECTORY}`} 
              className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col items-center">
                <Avatar className="w-20 h-20 border-2 border-white shadow-md group-hover:border-brand-pink transition-colors">
                  <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
                  <AvatarFallback className="text-lg">
                    {member.firstName[0]}{member.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-medium mt-3 text-center group-hover:text-brand-pink transition-colors">
                  {member.firstName} {member.lastName}
                </h3>
                
                <div className="mt-4 space-y-2 w-full text-sm text-gray-600">
                  {member.expertise && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{member.expertise}</span>
                    </div>
                  )}
                  {member.institution && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{member.institution}</span>
                    </div>
                  )}
                  {member.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{member.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No members with profile pictures found</p>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <Button asChild variant="outline">
          <Link to={PATHS.MEMBER_DIRECTORY}>
            View All Members
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MemberPreview;
