
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSprintFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
  };

  const uploadFounderProfile = async (userId: string) => {
    if (!uploadedFile) {
      console.log("No file to upload");
      return null;
    }

    setIsUploading(true);
    try {
      const fileExt = uploadedFile.name.split('.').pop();
      const filePath = `founder-profiles/${userId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('sprint-storage')
        .upload(filePath, uploadedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("File upload error:", error);
        toast.error("Failed to upload file.");
        return null;
      }

      console.log("File uploaded successfully:", data);
      return filePath;
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
      toast.error("Unexpected error during file upload.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadedFile,
    isUploading,
    handleFileUpload,
    uploadFounderProfile
  };
};
