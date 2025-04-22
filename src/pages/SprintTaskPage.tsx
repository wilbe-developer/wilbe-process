
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSprintTasks } from '@/hooks/useSprintTasks.tsx';
import { SprintTask, UserTaskProgress } from '@/types/sprint';
import { QuestionForm } from '@/components/sprint/QuestionForm';
import { FileUploader } from '@/components/sprint/FileUploader';
import { UploadedFileView } from '@/components/sprint/UploadedFileView';

const SprintTaskPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { tasksWithProgress, updateProgress, isLoading } = useSprintTasks();
  
  // Find the current task
  const currentTask = tasksWithProgress.find(task => task.id === taskId) as UserTaskProgress;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!currentTask) {
    return <div className="text-center p-8">Task not found</div>;
  }
  
  const isCompleted = currentTask.progress?.completed || false;
  const hasUploadedFile = !!currentTask.progress?.file_id;
  
  const handleTaskCompletion = async (fileId?: string) => {
    await updateProgress.mutateAsync({
      taskId: currentTask.id,
      completed: true,
      fileId
    });
  };
  
  const handleAnswerSubmission = async (answers: Record<string, any>) => {
    await updateProgress.mutateAsync({
      taskId: currentTask.id,
      completed: true,
      answers
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{currentTask.title}</h1>
      <p className="text-gray-600 mb-8">{currentTask.description}</p>
      
      {currentTask.content && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentTask.content }} />
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        {currentTask.upload_required ? (
          hasUploadedFile ? (
            <UploadedFileView 
              fileId={currentTask.progress?.file_id} 
              isCompleted={isCompleted}
            />
          ) : (
            <FileUploader 
              taskId={currentTask.id} 
              onUploadComplete={handleTaskCompletion}
              isCompleted={isCompleted}
            />
          )
        ) : (
          currentTask.question && (
            <QuestionForm 
              task={currentTask} 
              onSubmit={handleAnswerSubmission}
              isCompleted={isCompleted}
            />
          )
        )}
      </div>
    </div>
  );
};

export default SprintTaskPage;
