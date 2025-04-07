
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Briefcase, Book } from "lucide-react";

interface MemberCardProps {
  member: UserProfile;
}

const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border shadow">
            <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
            <AvatarFallback className="text-lg">
              {member.firstName[0]}{member.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">
              {member.firstName} {member.lastName}
            </h3>
            
            {member.expertise && (
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Briefcase className="h-4 w-4 mr-1 inline" />
                {member.expertise}
              </div>
            )}
            
            {member.institution && (
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Book className="h-4 w-4 mr-1 inline" />
                {member.institution}
              </div>
            )}
            
            {member.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1 inline" />
                {member.location}
              </div>
            )}
          </div>
        </div>
        
        {member.about && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 line-clamp-3">{member.about}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberCard;
