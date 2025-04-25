
import { useSprintTasks } from "@/hooks/useSprintTasks.tsx";
import TaskCard from "@/components/sprint/TaskCard";
import { useIsMobile } from "@/hooks/use-mobile";

const SprintDashboardPage = () => {
  const { tasksWithProgress, isLoading } = useSprintTasks();
  const isMobile = useIsMobile();

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
      <div className={isMobile ? "mb-4" : "mb-8"}>
        <h1 className={`${isMobile ? 'text-2xl mb-1' : 'text-3xl mb-2'} font-bold`}>Your Sprint Journey</h1>
        <p className={`text-gray-600 ${isMobile ? 'text-sm mb-3' : 'mb-4'}`}>
          Complete all tasks to finish your sprint and develop your full project plan.
        </p>
        
        <div className={`bg-white rounded-lg shadow-sm border ${isMobile ? 'p-4 mb-4' : 'p-6 mb-6'}`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>Overall Progress</h2>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
              {completedTasks} of {totalTasks} tasks completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-brand-pink h-3 rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
            {completionPercentage}% complete
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
        {tasksWithProgress.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            disabled={false} // All tasks are now enabled
          />
        ))}
      </div>
    </div>
  );
};

export default SprintDashboardPage;
