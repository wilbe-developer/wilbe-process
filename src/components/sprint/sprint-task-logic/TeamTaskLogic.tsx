
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import StepBasedTaskLogic, { Step } from "../StepBasedTaskLogic";
import { useSprintProfileQuickEdit } from "@/hooks/useSprintProfileQuickEdit";
import VideoEmbed from "@/components/video-player/VideoEmbed";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  isCompleted: boolean;
  onComplete: (fileId?: string) => void;
  task: any;
  hideMainQuestion?: boolean;
  children?: React.ReactNode;
};

const TEAM_BUILDING_VIDEO_ID = "j5TEYCrLDYo";

interface TeamMember {
  name: string;
  profile: string;
  employmentStatus: string;
  triggerPoints: string;
}

const TeamTaskLogic: React.FC<Props> = ({ 
  isCompleted, 
  onComplete, 
  task,
  hideMainQuestion, 
  children 
}) => {
  const { sprintProfile } = useSprintProfileQuickEdit();
  const { user } = useAuth();
  const teamStatus = sprintProfile?.team_status;
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ 
    name: '', 
    profile: '', 
    employmentStatus: '',
    triggerPoints: '' 
  }]);
  const [neededSkills, setNeededSkills] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load previous answers if available
  useEffect(() => {
    const loadPreviousAnswers = async () => {
      if (!task?.id || !user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_sprint_progress')
          .select('task_answers')
          .eq('task_id', task.id)
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error loading previous answers:', error);
          return;
        }
        
        if (data?.task_answers) {
          if (data.task_answers.team_members) {
            setTeamMembers(data.task_answers.team_members);
          }
          
          if (data.task_answers.needed_skills) {
            setNeededSkills(data.task_answers.needed_skills);
          }
        }
      } catch (error) {
        console.error('Error loading previous answers:', error);
      }
    };
    
    loadPreviousAnswers();
  }, [task?.id, user?.id]);

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { 
      name: '', 
      profile: '', 
      employmentStatus: '',
      triggerPoints: '' 
    }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setTeamMembers(updatedMembers);
  };

  const saveTeamMembers = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to save team information");
      return;
    }
    
    setLoading(true);
    
    try {
      // Save answers to user_sprint_progress first
      const { error: progressError } = await supabase
        .from('user_sprint_progress')
        .update({
          task_answers: JSON.stringify({
            team_members: teamMembers,
            needed_skills: neededSkills
          })
        })
        .eq('task_id', task.id)
        .eq('user_id', user.id);

      if (progressError) throw progressError;
      
      // For non-solo teams, save team members to the database
      if (teamStatus !== "solo" && teamMembers.length > 0) {
        // Delete existing team members for this user (to handle removed members)
        const { error: deleteError } = await supabase
          .from('team_members')
          .delete()
          .eq('user_id', user.id);
          
        if (deleteError) throw deleteError;
        
        // Insert new team members
        for (const member of teamMembers) {
          if (!member.name.trim()) continue; // Skip empty entries
          
          const { error } = await supabase
            .from('team_members')
            .insert({
              user_id: user.id,
              name: member.name,
              profile_description: member.profile,
              employment_status: member.employmentStatus,
              trigger_points: member.triggerPoints
            });

          if (error) throw error;
        }
      }

      toast.success("Team information saved successfully!");
      onComplete();
    } catch (error) {
      console.error('Error saving team members:', error);
      toast.error("Failed to save team information");
    } finally {
      setLoading(false);
    }
  };

  // Define steps based on team status
  const buildSteps = (): Step[] => {
    if (teamStatus === "solo") {
      return [
        {
          type: "content",
          content: ["As a solo founder, it's crucial to understand the importance of team culture and future team building."]
        },
        {
          type: "content",
          content: [
            "Company Culture & Team Building",
            <div key="video" className="space-y-6">
              <VideoEmbed 
                youtubeEmbedId={TEAM_BUILDING_VIDEO_ID} 
                title="Company Culture and Team Building" 
              />
              <p className="text-sm text-gray-600 mt-2">
                Understanding how to build a strong team culture is essential, even as a solo founder planning for future growth.
              </p>
            </div>
          ]
        },
        {
          type: "content",
          content: [
            "What additional skills will you need on your team to complement your own expertise?",
            <div key="skills" className="space-y-4">
              <Textarea 
                value={neededSkills}
                onChange={(e) => setNeededSkills(e.target.value)}
                placeholder="Example: Technical co-founder with expertise in AI, Marketing professional with B2B SaaS experience, etc."
                rows={5}
                className="w-full"
              />
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium mb-2">Hiring Template</h4>
                <p className="text-sm text-gray-700">
                  When you're ready to expand your team, consider creating a clear job description that includes:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700 space-y-1">
                  <li>Role and responsibilities</li>
                  <li>Required skills and experience</li>
                  <li>Cultural fit indicators</li>
                  <li>Growth opportunities</li>
                  <li>Compensation structure</li>
                </ul>
              </div>
            </div>
          ]
        }
      ];
    } else {
      // For both employees and co-founders
      const memberType = teamStatus === "employees" ? "team member" : "co-founder";
      
      return [
        {
          type: "content",
          content: [
            `Tell us about your ${memberType}s`,
            <div key="members" className="space-y-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="space-y-4 border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{`${memberType} ${index + 1}`}</h3>
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamMember(index)}
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
                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`profile-${index}`} className="text-sm font-medium">Profile</label>
                      <Textarea
                        id={`profile-${index}`}
                        placeholder={`Why is this ${memberType} essential to your venture? Describe their personal and professional strengths.`}
                        value={member.profile}
                        onChange={(e) => updateTeamMember(index, 'profile', e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`status-${index}`} className="text-sm font-medium">Employment Status</label>
                      <Input
                        id={`status-${index}`}
                        placeholder="Full-time/Part-time status"
                        value={member.employmentStatus}
                        onChange={(e) => updateTeamMember(index, 'employmentStatus', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`triggers-${index}`} className="text-sm font-medium">Trigger Points</label>
                      <Input
                        id={`triggers-${index}`}
                        placeholder="Trigger points for going full-time"
                        value={member.triggerPoints}
                        onChange={(e) => updateTeamMember(index, 'triggerPoints', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addTeamMember}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another {memberType}
              </Button>
            </div>
          ]
        }
      ];
    }
  };

  return (
    <div>
      {children}
      <Card className="mb-8">
        <CardContent className="p-6">
          <StepBasedTaskLogic
            steps={buildSteps()}
            isCompleted={false} // Always allow editing by setting isCompleted to false
            onComplete={saveTeamMembers}
            conditionalFlow={{}}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamTaskLogic;
