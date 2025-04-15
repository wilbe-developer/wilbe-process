
import { useVideos } from "@/hooks/useVideos";

const ProgressBar = () => {
  const { videos, getCompletedCount } = useVideos();
  
  const completedCount = getCompletedCount();
  const totalCount = videos.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
        <div className="h-2 w-full rounded-full bg-gray-200 sm:mr-4 flex-grow">
          <div 
            className="h-2 rounded-full bg-brand-pink" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="text-sm font-medium min-w-fit">
          You have completed {completedCount} out of {totalCount} items.
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
