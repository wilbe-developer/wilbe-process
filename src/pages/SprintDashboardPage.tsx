
import { useSprintTasks } from "@/hooks/useSprintTasks.tsx";
import TaskCard from "@/components/sprint/TaskCard";

const SprintDashboardPage = () => {
  const { tasksWithProgress, isLoading } = useSprintTasks();

  // Calculate overall completion percentage
  const completedTasks = tasksWithProgress.filter(task => task.progress?.completed).length;
  const totalTasks = tasksWithProgress.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Sprint Journey</h1>
        <p className="text-gray-600 mb-4">
          Complete all tasks to finish your sprint and develop your full project plan.
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Overall Progress</h2>
            <span className="text-sm font-medium">
              {completedTasks} of {totalTasks} tasks completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-brand-pink h-4 rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            {completionPercentage}% complete
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasksWithProgress.map((task, index) => {
          // Determine if the task should be disabled (all previous tasks must be completed first)
          const previousTasksCompleted = tasksWithProgress
            .slice(0, index)
            .every(t => t.progress?.completed);
          
          const disabled = index > 0 && !previousTasksCompleted;
          
          return (
            <TaskCard 
              key={task.id} 
              task={task} 
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SprintDashboardPage;
