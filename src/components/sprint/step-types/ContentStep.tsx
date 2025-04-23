
import React from "react";

interface ContentStepProps {
  content: string | string[];
}

const ContentStep: React.FC<ContentStepProps> = ({ content }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h3 className="font-medium mb-2">Information:</h3>
      {Array.isArray(content) ? (
        <ul className="list-disc list-inside space-y-2">
          {content.map((item, idx) => (
            <li key={idx} className="text-gray-700">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700">{content}</p>
      )}
    </div>
  );
};

export default ContentStep;
