
import React from "react";

interface ContentStepProps {
  content: string | React.ReactNode | (string | React.ReactNode)[];
}

const ContentStep: React.FC<ContentStepProps> = ({ content }) => {
  if (Array.isArray(content)) {
    const [title, ...restContent] = content;
    
    return (
      <div className="space-y-4">
        {title && (
          <h3 className="text-lg font-semibold">{title}</h3>
        )}
        
        {restContent.length > 0 && (
          <div className="space-y-4">
            {restContent.map((item, idx) => (
              <div key={idx}>
                {typeof item === 'string' ? (
                  <p className="text-gray-700">{item}</p>
                ) : (
                  item
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      {typeof content === 'string' ? (
        <p className="text-gray-700">{content}</p>
      ) : (
        content
      )}
    </div>
  );
};

export default ContentStep;
