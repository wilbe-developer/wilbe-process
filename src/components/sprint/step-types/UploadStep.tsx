
import React from "react";
import FileUploader from "../FileUploader";

interface UploadStepProps {
  action?: string;
  uploads?: string[];
  isCompleted: boolean;
  onComplete: () => void;
}

const UploadStep: React.FC<UploadStepProps> = ({
  action,
  uploads,
  isCompleted,
  onComplete,
}) => {
  return (
    <div>
      {action && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-700">{action}</p>
        </div>
      )}
      
      {uploads && uploads.length > 0 && (
        <>
          <div className="mb-2 font-medium">Required uploads:</div>
          <ul className="list-disc list-inside mb-4">
            {uploads.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </>
      )}
      
      <FileUploader
        isCompleted={isCompleted}
        onFileUploaded={() => onComplete()}
      />
    </div>
  );
};

export default UploadStep;
