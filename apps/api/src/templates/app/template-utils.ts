import type { Result } from "@oppsys/shared";

export function fileMiddleware(
  file: File
): Result<File, Error, "INVALID_FILE" | "FILE_TOO_LARGE"> {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/pdf",
    "text/plain",
  ];

  if (allowedTypes.includes(file.type)) {
    return {
      success: false,
      kind: "INVALID_FILE",
      error: new Error("Unsupported file mimetype=" + file.type),
    } as const;
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      kind: "FILE_TOO_LARGE",
      error: new Error("File size exceeds 10MB limit"),
    } as const;
  }

  return {
    success: true,
    data: file,
  } as const;
}
