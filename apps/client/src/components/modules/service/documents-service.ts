import { honoClient } from "@/lib/hono-client";

type RagUploadUrlRequest = {
  fileName: string;
  fileType:
    | "application/pdf"
    | "text/plain"
    | "application/msword"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  fileSize: number;
};

type RagUploadUrlResponse =
  | { data: { uploadUrl: string; filePath: string } }
  | { error: string; details: string };

export const documentsService = {
  getRagUploadUrl: async (
    data: RagUploadUrlRequest
  ): Promise<RagUploadUrlResponse> => {
    const response = await honoClient.api.documents["rag-upload-url"].$post({
      json: data,
    });
    const result = (await response.json()) as RagUploadUrlResponse;
    return result;
  },
};
