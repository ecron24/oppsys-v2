import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type { BucketStorage, UploadBody } from "./storage-type";

export class StorageService {
  generateUploadUrl = async (body: UploadBody) => {
    return handleApiCall(
      await honoClient.api.storage["create-upload-url"].$post({ json: body })
    );
  };
  generateUrlAndUploadFile = async (bucket: BucketStorage, file: File) => {
    const uploadUrlResponse = await this.generateUploadUrl({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      bucket,
    } as UploadBody);
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

export const storageService = new StorageService();
