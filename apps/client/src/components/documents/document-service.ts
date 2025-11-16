import { handleApiCall } from "@/lib/handle-api-call";
import type { RagUploadBody } from "./document-types";
import { honoClient } from "@/lib/hono-client";

export class DocumentService {
  generateRagUploadUrl = async (body: RagUploadBody) => {
    return handleApiCall(
      await honoClient.api.documents["rag-upload-url"].$post({ json: body })
    );
  };
  generateUrlAndUploadFile = async (file: File) => {
    const uploadUrlResponse = await this.generateRagUploadUrl({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    } as RagUploadBody);
    if (!uploadUrlResponse.success) return uploadUrlResponse;

    const { uploadUrl, filePath } = uploadUrlResponse.data;

    // Upload du fichier
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadResponse.ok) {
      return {
        success: false,
        error: "Erreur d'upload",
      } as const;
    }

    return {
      success: true,
      data: {
        uploadUrl,
        filePath,
      },
    } as const;
  };
}

export const documentService = new DocumentService();
