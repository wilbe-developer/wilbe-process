
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { UploadedFile } from "@/types/sprint";
import { useToast } from "@/components/ui/use-toast";

export const useFileUpload = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedFile> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      setIsUploading(true);
      setProgress(10);

      try {
        // Create form data for the API
        const formData = new FormData();
        formData.append('file', file);

        setProgress(25);

        // Upload file to API endpoint
        const response = await fetch('/api/upload-file', {
          method: 'POST',
          body: formData,
        });

        setProgress(75);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload file');
        }

        const uploadResult = await response.json();
        
        // Save file metadata to Supabase
        const { data, error } = await supabase
          .from('user_files')
          .insert({
            user_id: user.id,
            file_name: uploadResult.fileName,
            drive_file_id: uploadResult.fileId,
            view_url: uploadResult.viewLink,
            download_url: uploadResult.downloadLink
          })
          .select()
          .single();

        if (error) throw error;

        setProgress(100);
        
        return data;
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "File uploaded successfully",
        description: `${data.file_name} has been uploaded.`,
      });
      queryClient.invalidateQueries({ queryKey: ["userFiles"] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  return {
    uploadFile: uploadFileMutation.mutate,
    isUploading,
    progress,
    error: uploadFileMutation.error
  };
};
