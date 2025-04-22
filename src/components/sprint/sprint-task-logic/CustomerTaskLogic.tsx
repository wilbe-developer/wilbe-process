
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/sprint/FileUploader";

const options = [
  {
    label: "Yes",
    uploads: ["Evidence of conversations", "CRM file for customer engagement", "Doc summarizing findings"]
  },
  {
    label: "No",
    action: "Explain"
  },
  {
    label: "It’s too early",
    action: "Explain"
  }
];

const CustomerTaskLogic = ({ isCompleted, onComplete }: any) => {
  const [selected, setSelected] = useState<string | null>(null);

  const opt = options.find(o => o.label === selected);

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-6">
        <h2 className="text-lg font-semibold mb-4">
          Have you spoken to your customers yet?
        </h2>
        <div className="flex gap-3 mb-4">
          {options.map(opt => (
            <Button
              key={opt.label}
              variant={selected === opt.label ? "default" : "outline"}
              onClick={() => setSelected(opt.label)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        {opt?.uploads && (
          <div>
            <div className="mb-2 font-medium">Required uploads:</div>
            <ul className="list-disc list-inside mb-2">
              {opt.uploads.map(u => <li key={u}>{u}</li>)}
            </ul>
            <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
          </div>
        )}
        {opt?.action === "Explain" && (
          <div>
            <div className="mb-2">Please explain your progress below.</div>
            <FileUploader isCompleted={isCompleted} onFileUploaded={() => onComplete()} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerTaskLogic;
