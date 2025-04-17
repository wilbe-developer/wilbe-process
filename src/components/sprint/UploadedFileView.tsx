
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UploadedFile } from "@/types/sprint";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, File } from "lucide-react";

interface UploadedFileViewProps {
  fileId: string;
}

const UploadedFileView = ({ fileId }: UploadedFileViewProps) => {
  const { data: file, isLoading } = useQuery({
    queryKey: ["uploadedFile", fileId],
    queryFn: async (): Promise<UploadedFile | null> => {
      const { data, error } = await supabase
        .from("user_files")
        .select("*")
        .eq("id", fileId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6 flex items-center justify-center h-32">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="border rounded-lg p-6 text-center">
        <p className="text-gray-500">File not found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="bg-gray-100 rounded-full p-3 mr-4">
          <File className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <h3 className="font-medium">{file.file_name}</h3>
          <p className="text-sm text-gray-500">
            Uploaded on {new Date(file.uploaded_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={file.view_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            View File
          </a>
        </Button>
        
        <Button asChild variant="outline" size="sm">
          <a href={file.download_url} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </Button>
      </div>
    </div>
  );
};

export default UploadedFileView;
