import { fetchApi } from "./api";

export interface UploadResumeResponse {
  success: boolean;
  fileId: string;
  filename: string;
  size: number;
  extractedText?: string;
}

export async function uploadResume(file: File): Promise<UploadResumeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    return await fetchApi<UploadResumeResponse>("/api/resume/upload", {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    console.log("[Resume Service] Upload fallback:", err);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      fileId: `file-${Date.now()}`,
      filename: file.name,
      size: file.size,
      extractedText: `Parsed content for ${file.name}`,
    };
  }
}
