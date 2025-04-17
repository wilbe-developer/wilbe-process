
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/card";
import { useSprintTasks } from "@/hooks/useSprintTasks";
import { SprintTask, UserSprintProgress } from "@/types/sprint";
import FileUploader from "@/components/sprint/FileUploader";
import UploadedFileView from "@/components/sprint/UploadedFileView";
import QuestionForm from "@/components/sprint/QuestionForm";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/lib/constants";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SprintTaskPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'content' | 'question' | 'upload' | 'completed'>('content');
  
  // Query for task details
  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ["sprintTask", taskId],
    queryFn: async (): Promise<SprintTask | null> => {
      if (!taskId) return null;
      
      const { data, error } = await supabase
        .from("sprint_tasks")
        .select("*")
        .eq("id", taskId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!taskId
  });
  
  // Query for user progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["taskProgress", user?.id, taskId],
    queryFn: async (): Promise<UserSprintProgress | null> => {
      if (!user || !taskId) return null;
      
      const { data, error } = await supabase
        .from("user_sprint_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("task_id", taskId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!taskId
  });
  
  const { updateProgress } = useSprintTasks();
  
  // Determine initial step based on progress
  useEffect(() => {
    if (progress?.completed) {
      setStep('completed');
    } else if (task && !isLoadingProgress) {
      if (progress?.file_id) {
        setStep('completed');
      } else if (progress?.answers && task.upload_required) {
        setStep('upload');
      } else if (progress?.answers || !task.question) {
        if (task.upload_required) {
          setStep('upload');
        } else {
          setStep('completed');
        }
      } else if (task.question && !progress?.answers) {
        if (task.content) {
          setStep('content');
        } else {
          setStep('question');
        }
      }
    }
  }, [task, progress, isLoadingProgress]);
  
  const handleContentComplete = () => {
    if (task?.question) {
      setStep('question');
    } else if (task?.upload_required) {
      setStep('upload');
    } else {
      // Mark as completed
      updateProgress.mutate(
        { taskId: task?.id || "", completed: true },
        {
          onSuccess: () => {
            setStep('completed');
            toast({
              title: "Task completed!",
              description: "You've successfully completed this task.",
            });
          }
        }
      );
    }
  };
  
  const handleQuestionSubmit = (answers: Record<string, any>) => {
    if (!task) return;
    
    updateProgress.mutate(
      { 
        taskId: task.id, 
        answers,
        completed: !task.upload_required
      },
      {
        onSuccess: () => {
          if (task.upload_required) {
            setStep('upload');
          } else {
            setStep('completed');
            toast({
              title: "Task completed!",
              description: "You've successfully completed this task.",
            });
          }
        }
      }
    );
  };
  
  const handleFileUploaded = (fileId: string) => {
    if (!task) return;
    
    updateProgress.mutate(
      { 
        taskId: task.id, 
        fileId, 
        completed: true 
      },
      {
        onSuccess: () => {
          setStep('completed');
          toast({
            title: "File uploaded successfully!",
            description: "You've completed this task.",
          });
        }
      }
    );
  };
  
  if (isLoadingTask || isLoadingProgress) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Task not found</h2>
        <Button onClick={() => navigate(PATHS.SPRINT_DASHBOARD)}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate(PATHS.SPRINT_DASHBOARD)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <p className="text-gray-600">{task.description}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        {step === 'content' && task.content && (
          <div className="space-y-6">
            <div className="prose max-w-none">
              <p>{task.content}</p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleContentComplete}>
                {task.question ? 'Continue' : (task.upload_required ? 'Proceed to Upload' : 'Complete')}
              </Button>
            </div>
          </div>
        )}
        
        {step === 'question' && (
          <QuestionForm 
            task={task} 
            initialAnswers={progress?.answers || {}} 
            onSubmit={handleQuestionSubmit} 
          />
        )}
        
        {step === 'upload' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Upload Your File</h3>
            <p className="text-gray-600">
              Please upload the required file to complete this task.
            </p>
            
            {progress?.file_id ? (
              <UploadedFileView fileId={progress.file_id} />
            ) : (
              <FileUploader onFileUploaded={handleFileUploaded} />
            )}
          </div>
        )}
        
        {step === 'completed' && (
          <div className="text-center py-8">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Task Completed!</h3>
            <p className="text-gray-600 mb-6">
              Great job! You've successfully completed this task.
            </p>
            
            {progress?.file_id && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Your Uploaded File</h4>
                <UploadedFileView fileId={progress.file_id} />
              </div>
            )}
            
            <Button 
              onClick={() => navigate(PATHS.SPRINT_DASHBOARD)}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintTaskPage;
