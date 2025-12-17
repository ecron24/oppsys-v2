import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type { BucketStorage, SignedUrlBody, UploadBody } from "./storage-type";

export class StorageService {
  generateSignedUrl = async (body: SignedUrlBody) => {
    return handleApiCall(
      await honoClient.api.storage["signed-url"].$post({ json: body })
    );
  };
  generateSignedUrlAndDownloadFile = async (
    body: SignedUrlBody,
    opts?: { fileName?: string | null }
  ) => {
    const signedUrlResponse = await this.generateSignedUrl(body);
    if (!signedUrlResponse.success) return signedUrlResponse;

    const { signedUrl } = signedUrlResponse.data;

    const downloadResponse = await fetch(signedUrl);
    if (!downloadResponse.ok) {
      return {
        success: false,
        error: "Erreur de téléchargement",
      } as const;
    }

    const fileBlob = await downloadResponse.blob();
    const url = window.URL.createObjectURL(fileBlob);
    const a = document.createElement("a");

    a.href = url;
    const filename =
      opts?.fileName ||
      body.filePath.split("/").pop() ||
      `document_${Date.now()}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      data: {
        signedUrl,
        fileBlob,
      },
    } as const;
  };

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
