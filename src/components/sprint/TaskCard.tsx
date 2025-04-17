
import { Link } from "react-router-dom";
import { UserTaskProgress } from "@/types/sprint";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FileUp, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PATHS } from "@/lib/constants";

interface TaskCardProps {
  task: UserTaskProgress;
  disabled?: boolean;
}

const TaskCard = ({ task, disabled = false }: TaskCardProps) => {
  const isCompleted = task.progress?.completed || false;
  const requiresUpload = task.upload_required;
  
  return (
    <Card className={`overflow-hidden transition-all ${isCompleted ? 'border-green-200' : ''} ${disabled ? 'opacity-60' : 'hover:shadow-md'}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium">{task.title}</h3>
          {isCompleted && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Check className="mr-1 h-3 w-3" /> Completed
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-4">{task.description}</p>
        
        <div className="flex items-center text-sm text-gray-500">
          {requiresUpload && <FileUp className="h-4 w-4 mr-1" />}
          <span>
            {requiresUpload 
              ? "Requires file upload" 
              : "Complete interactive content"}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 bg-gray-50 border-t">
        {isCompleted ? (
          <div className="w-full">
            <Progress value={100} className="h-2 mb-2" />
            <Button variant="outline" asChild className="w-full">
              <Link to={`${PATHS.SPRINT_TASK}/${task.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        ) : (
          <Button 
            asChild 
            disabled={disabled}
            className="w-full flex justify-between items-center"
          >
            <Link to={`${PATHS.SPRINT_TASK}/${task.id}`}>
              <span>{task.progress ? 'Continue' : 'Start'}</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
