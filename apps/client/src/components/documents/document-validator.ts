import { toast } from "@oppsys/ui";

const allowedTypes = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
type AllowedType = (typeof allowedTypes)[number];

const fileSizeMaxBytes = 10 * 1024 * 1024; // 10Mb

export function validateDocumentFile(file: File) {
  if (!allowedTypes.includes(file.type as AllowedType)) {
    toast.error(`Format non supporté: ${file.name}`, {
      description: "Formats acceptés: PDF, TXT, DOC, DOCX",
    });
    return {
      success: false,
      error: "Format not supported",
    } as const;
  }

  if (file.size > fileSizeMaxBytes) {
    toast.error(`Fichier trop volumineux: ${file.name}`, {
      description: "Taille maximale: 10MB",
    });
    return {
      success: false,
      error: "File size exceeds maximum limit",
    } as const;
  }

  return {
    success: true,
    data: {
      fileName: file.name,
      fileType: file.type as AllowedType,
      fileSize: file.size,
    },
  };
}
