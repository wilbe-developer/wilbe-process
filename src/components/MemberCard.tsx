
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Briefcase, Book, Linkedin, Twitter } from "lucide-react";
import { Button } from "./ui/button";

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
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPin className="h-4 w-4 mr-1 inline" />
                {member.location}
              </div>
            )}
            
            <div className="flex gap-2 mt-2">
              {member.linkedIn && (
                <a 
                  href={member.linkedIn.startsWith('http') ? member.linkedIn : `https://linkedin.com/in/${member.linkedIn}`} 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="LinkedIn Profile"
                >
                  <Button variant="ghost" size="sm" className="px-2 h-8">
                    <Linkedin className="h-4 w-4 text-[#0077B5]" />
                  </Button>
                </a>
              )}
              
              {member.twitterHandle && (
                <a 
                  href={member.twitterHandle.startsWith('http') ? member.twitterHandle : `https://twitter.com/${member.twitterHandle}`} 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="Twitter Profile"
                >
                  <Button variant="ghost" size="sm" className="px-2 h-8">
                    <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                  </Button>
                </a>
              )}
            </div>
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
