
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSprintFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const uploadFileToStorage = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-cv.${fileExt}`;
      const filePath = `cvs/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('sprint-uploads')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }
      
      const { data } = supabase.storage
        .from('sprint-uploads')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error in file upload:', error);
      return null;
    }
  };

  return {
    uploadedFile,
    setUploadedFile,
    handleFileUpload,
    uploadFileToStorage
  };
};
