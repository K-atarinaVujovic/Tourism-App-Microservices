import { useState } from "react";

type UploadFn = (file: File) => Promise<string>;

export function useImageUpload(uploadFn: UploadFn) {
  const [isUploading, setIsUploading] = useState(false);

  async function upload(file: File): Promise<string | null> {
    setIsUploading(true);
    try {
      const url = await uploadFn(file);
      return url;
    } catch {
      alert("Image upload failed.");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading };
}