
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VideoInfoProps {
  title: string;
  duration: string;
  description: string;
  moduleTitle: string;
  isCompleted: boolean;
  onCompletionToggle: () => void;
}

const VideoInfo = ({
  title,
  duration,
  description,
  moduleTitle,
  isCompleted,
  onCompletionToggle,
}: VideoInfoProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="text-gray-500">{duration}</div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="completed"
          checked={isCompleted}
          onCheckedChange={onCompletionToggle}
        />
        <Label htmlFor="completed" className="text-sm">
          I Completed This
        </Label>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{moduleTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{description}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://creativecommons.org/images/deed/cc-logo.jpg"
              alt="Creative Commons License"
              className="h-4"
            />
            <span className="text-gray-500 text-xs">
              BY-NC-SA 4.0 LICENSE
            </span>
          </div>
          <div className="text-gray-500 text-sm">{duration}</div>
        </CardFooter>
      </Card>
    </>
  );
};

export default VideoInfo;
