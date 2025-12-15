import { toast } from "@oppsys/ui/lib/sonner";
import type { UploadBody } from "./storage-type";

type Opts = {
  allowedTypes: string[];
  labelAcceptedFormats: string;
  fileSizeMaxBytes: number;
};

export function validateFile<TBucket extends UploadBody["bucket"]>(
  file: File,
  opts: Opts
) {
  const allowedTypes = opts.allowedTypes;
  const fileSizeMaxBytes = opts.fileSizeMaxBytes;

  if (!allowedTypes.includes(file.type)) {
    toast.error(`Format non supporté: ${file.name}`, {
      description: `Formats acceptés: ${opts.labelAcceptedFormats}`,
    });
    return {
      success: false,
      error: "Format not supported",
    } as const;
  }

  if (file.size > fileSizeMaxBytes) {
    toast.error(`Fichier trop volumineux: ${file.name}`, {
      description: `Taille maximale: ${fileSizeMaxBytes / (1024 * 1024)}MB`,
    });
    return {
      success: false,
      error: "File size exceeds maximum limit",
    } as const;
  }
  type Body = Extract<UploadBody, { bucket: TBucket }>;

  return {
    success: true,
    data: {
      fileName: file.name,
      fileType: file.type as Body["fileType"],
      fileSize: file.size,
    },
  };
}

export function validateDocumentFile(file: File) {
  const defaultAllowedTypes = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const defaultSileSizeMaxBytes = 10 * 1024 * 1024; // 10Mb
  return validateFile<"documents-rag">(file, {
    allowedTypes: defaultAllowedTypes,
    fileSizeMaxBytes: defaultSileSizeMaxBytes,
    labelAcceptedFormats: "PDF, TXT, DOC, DOCX",
  });
}

export function validateTalentAnalyzerFile(file: File) {
  const defaultAllowedTypes = [
    "application/pdf",
    "text/plain",
    "application/json",
  ];
  const defaultSileSizeMaxBytes = 5 * 1024 * 1024; // 5MB
  return validateFile<"talent-analyzer">(file, {
    allowedTypes: defaultAllowedTypes,
    fileSizeMaxBytes: defaultSileSizeMaxBytes,
    labelAcceptedFormats: "PDF, TXT, JSON",
  });
}
