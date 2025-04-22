
import React from "react";

// This component was moved out from sprint-task-logic/index.tsx
// Make sure to update its props interface if you need to.

interface SprintProfileShowOrAskProps {
  onShow: () => void;
  onAsk: () => void;
}

const SprintProfileShowOrAsk: React.FC<SprintProfileShowOrAskProps> = ({
  onShow,
  onAsk,
}) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      <button
        className="bg-primary text-primary-foreground rounded px-4 py-2"
        onClick={onShow}
      >
        Show Profile
      </button>
      <button
        className="bg-secondary text-secondary-foreground rounded px-4 py-2"
        onClick={onAsk}
      >
        Ask Question
      </button>
    </div>
  );
};

export default SprintProfileShowOrAsk;

