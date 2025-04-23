
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { TaskChallengeLink } from "@/components/sprint/TaskChallengeLink";

const TaskCard = ({ task, disabled }) => {
  const navigate = useNavigate();
  const isCompleted = task.progress?.completed || false;

  const handleClick = () => {
    if (!disabled) {
      navigate(`/sprint/task/${task.id}`);
    }
  };

  return (
    <div
      className={`rounded-lg overflow-hidden border transition-all bg-white ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:border-brand-pink"
      }`}
      onClick={handleClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          {task.category && (
            <Badge variant="outline" className="ml-2">
              {task.category}
            </Badge>
          )}
        </div>

        <p className="text-gray-600 mb-3 text-sm line-clamp-2">{task.description}</p>

        <div className="flex justify-between items-center mt-4">
          <Badge
            variant={isCompleted ? "default" : "secondary"}
            className={isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {isCompleted ? "Completed" : "Pending"}
          </Badge>
          
          <TaskChallengeLink taskId={task.id} />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
