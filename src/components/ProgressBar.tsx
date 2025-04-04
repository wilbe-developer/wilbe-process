
import { useVideos } from "@/hooks/useVideos";

const ProgressBar = () => {
  const { videos, getCompletedCount } = useVideos();
  
  const completedCount = getCompletedCount();
  const totalCount = videos.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <div className="h-2 w-full rounded-full bg-gray-200 mr-4">
          <div 
            className="h-2 rounded-full bg-brand-pink" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="text-sm font-medium whitespace-nowrap">
          You have completed {completedCount} out of {totalCount} items.
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
