import type { Result } from "@oppsys/shared";
import type {
  ScheduledTask,
  CreateScheduledTask,
  UpdateScheduledTask,
} from "./scheduled-task";

export type GetScheduledTasksResult = Result<
  ScheduledTask[],
  Error,
  "UNKNOWN_ERROR"
>;

export type GetScheduledTaskByIdResult = Result<
  ScheduledTask,
  Error,
  "UNKNOWN_ERROR" | "TASK_NOT_FOUND"
>;

export type CreateScheduledTaskResult = Result<
  ScheduledTask,
  Error,
  "UNKNOWN_ERROR"
>;

export type UpdateScheduledTaskResult = Result<
  ScheduledTask,
  Error,
  "UNKNOWN_ERROR" | "TASK_NOT_FOUND"
>;

export type DeleteScheduledTaskResult = Result<
  void,
  Error,
  "UNKNOWN_ERROR" | "TASK_NOT_FOUND"
>;

export type GetTasksToRunResult = Result<
  ScheduledTask[],
  Error,
  "UNKNOWN_ERROR"
>;

export interface ScheduledTaskRepo {
  getByUserId(
    userId: string,
    status?: string[]
  ): Promise<GetScheduledTasksResult>;
  getById(id: string, userId?: string): Promise<GetScheduledTaskByIdResult>;
  create(task: CreateScheduledTask): Promise<CreateScheduledTaskResult>;
  update(
    id: string,
    data: UpdateScheduledTask
  ): Promise<UpdateScheduledTaskResult>;
  delete(id: string, userId: string): Promise<DeleteScheduledTaskResult>;
  getTasksToRun(limit?: number): Promise<GetTasksToRunResult>;
}
