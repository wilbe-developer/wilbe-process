
import React from "react";

interface EmptyStateProps {
  message?: string;
}

const EmptyState = ({ message = "No users found" }: EmptyStateProps) => {
  return (
    <div className="text-center py-6">
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default EmptyState;
