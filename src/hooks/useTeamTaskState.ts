
import { useState, useEffect } from 'react';
import { TeamMember } from '@/hooks/useTeamMembers';

export const useTeamTaskState = (task: any, sprintProfile: any) => {
  const [neededSkills, setNeededSkills] = useState('');
  const [uploadedFileId, setUploadedFileId] = useState<string | undefined>();
  const [hiringPlanStep, setHiringPlanStep] = useState<'download' | 'upload'>('download');
  const teamStatus = sprintProfile?.team_status;

  // Load needed skills from task answers if available
  useEffect(() => {
    if (task?.progress?.task_answers?.needed_skills) {
      setNeededSkills(task.progress.task_answers.needed_skills);
    }
  }, [task?.progress?.task_answers]);

  // Load uploaded file ID if available
  useEffect(() => {
    if (task?.progress?.file_id) {
      setUploadedFileId(task.progress.file_id);
    }
  }, [task?.progress?.file_id]);

  return {
    neededSkills,
    setNeededSkills,
    uploadedFileId,
    setUploadedFileId,
    hiringPlanStep,
    setHiringPlanStep,
    teamStatus
  };
};
