import type { Result } from "@oppsys/types";
import type { Transcription } from "./transcription";

export type CreateTranscriptionResult = Result<
  Transcription,
  Error,
  "UNKNOWN_ERROR" | "INVALID_INPUT"
>;

export type GetTranscriptionByIdResult = Result<
  Transcription,
  Error,
  "UNKNOWN_ERROR" | "NOT_FOUND"
>;

export type ListTranscriptionsResult = Result<
  {
    transcriptions: Transcription[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  },
  Error,
  "UNKNOWN_ERROR"
>;

export type UpdateTranscriptionResult = Result<
  Transcription,
  Error,
  "UNKNOWN_ERROR" | "NOT_FOUND"
>;

export type DeleteTranscriptionResult = Result<
  void,
  Error,
  "UNKNOWN_ERROR" | "NOT_FOUND"
>;

export interface TranscriptionRepo {
  createTranscription(
    transcription: Omit<Transcription, "id" | "createdAt" | "updatedAt">
  ): Promise<CreateTranscriptionResult>;
  getTranscriptionById(
    id: string,
    userId?: string
  ): Promise<GetTranscriptionByIdResult>;
  listTranscriptions(
    userId: string,
    options: {
      limit: number;
      offset: number;
      status?: string;
      type?: string;
      createdAt?: string;
      expiresAt?: string;
    }
  ): Promise<ListTranscriptionsResult>;
  updateTranscription(
    id: string,
    updates: Partial<Transcription>
  ): Promise<UpdateTranscriptionResult>;
  deleteTranscription(where: {
    id?: string;
    userId?: string;
    expiresAt?: string;
  }): Promise<DeleteTranscriptionResult>;
}
