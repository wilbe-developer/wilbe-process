
import React from "react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Loading users..." }: LoadingStateProps) => {
  return (
    <div className="text-center py-6">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default LoadingState;
