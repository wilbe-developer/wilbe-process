
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

interface TeamMember {
  name: string;
  profile: string;
  employmentStatus: string;
  triggerPoints: string;
}

interface TeamMemberFormProps {
  teamMembers: TeamMember[];
  memberType: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof TeamMember, value: string) => void;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  teamMembers,
  memberType,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  return (
    <div className="space-y-6">
      {teamMembers.map((member, index) => (
        <div key={index} className="space-y-4 border p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{`${memberType} ${index + 1}`}</h3>
            {index > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <label htmlFor={`name-${index}`} className="text-sm font-medium">Name</label>
              <Input
                id={`name-${index}`}
                placeholder="Name"
                value={member.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`profile-${index}`} className="text-sm font-medium">Profile</label>
              <Textarea
                id={`profile-${index}`}
                placeholder={`Why is this ${memberType} essential to your venture? Describe their personal and professional strengths.`}
                value={member.profile}
                onChange={(e) => onUpdate(index, 'profile', e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`status-${index}`} className="text-sm font-medium">Employment Status</label>
              <Input
                id={`status-${index}`}
                placeholder="Full-time/Part-time status"
                value={member.employmentStatus}
                onChange={(e) => onUpdate(index, 'employmentStatus', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`triggers-${index}`} className="text-sm font-medium">Trigger Points</label>
              <Input
                id={`triggers-${index}`}
                placeholder="Trigger points for going full-time"
                value={member.triggerPoints}
                onChange={(e) => onUpdate(index, 'triggerPoints', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="w-full"
      >
        Add Another {memberType}
      </Button>
    </div>
  );
};

export default TeamMemberForm;
