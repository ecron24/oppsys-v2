import type { OppSysSupabaseClient } from "@oppsys/supabase";
import type {
  ScheduledTaskRepo,
  GetScheduledTasksResult,
  GetScheduledTaskByIdResult,
  CreateScheduledTaskResult,
  UpdateScheduledTaskResult,
  DeleteScheduledTaskResult,
  GetTasksToRunResult,
} from "../domain/scheduled-task-repo";
import {
  ScheduledTaskSchema,
  type CreateScheduledTask,
  type ScheduledTask,
  type UpdateScheduledTask,
} from "../domain/scheduled-task";
import { tryCatch } from "src/lib/try-catch";
import type { Json } from "@oppsys/supabase";
import { toCamelCase } from "src/lib/to-camel-case";
import type { Logger } from "src/logger/domain/logger";

export class ScheduledTaskRepoSupabase implements ScheduledTaskRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async getByUserId(
    userId: string,
    status?: string[]
  ): Promise<GetScheduledTasksResult> {
    return tryCatch(async () => {
      let query = this.supabase
        .from("scheduled_tasks")
        .select(
          `
          *,
          modules(id, endpoint,name, slug, credit_cost),
          generated_content(
            id,
            title,
            type,
            html_preview,
            status,
            metadata
          )
        `
        )
        .eq("user_id", userId);

      if (status && status.length > 0) {
        query = query.in("status", status);
      }

      query = query.order("execution_time", { ascending: true });

      const { data, error } = await query;

      if (error) {
        this.logger.error("[getByUserId]: Failed to fetch tasks", error, {
          userId,
          status,
        });
        throw error;
      }

      const tasks = toCamelCase(data) as ScheduledTask[];
      return {
        success: true,
        data: ScheduledTaskSchema.array().parse(tasks),
      } as const;
    });
  }

  async getById(
    id: string,
    userId?: string
  ): Promise<GetScheduledTaskByIdResult> {
    return tryCatch(async () => {
      let query = this.supabase
        .from("scheduled_tasks")
        .select(
          `
          *,
          modules(id, endpoint,name, slug, credit_cost),
          generated_content(
            id,
            title,
            type,
            html_preview,
            status,
            metadata
          )
        `
        )
        .eq("id", id);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        this.logger.error("[getById]: ", error, { id, userId });
        throw error;
      }

      if (!data) {
        return {
          success: false,
          kind: "TASK_NOT_FOUND",
          error: new Error("Task not found id=" + id),
        } as const;
      }

      const task = toCamelCase(data) as ScheduledTask;
      return { success: true, data: ScheduledTaskSchema.parse(task) };
    });
  }

  async create(task: CreateScheduledTask): Promise<CreateScheduledTaskResult> {
    return tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("scheduled_tasks")
        .insert({
          user_id: task.userId,
          module_id: task.moduleId,
          execution_time: task.executionTime,
          payload: task.payload as Json,
          status: "scheduled",
        })
        .select(
          `
          *,
          modules(id, endpoint,name, slug, credit_cost),
          generated_content(
            id,
            title,
            type,
            html_preview,
            status,
            metadata
          )`
        )
        .single();

      if (error) {
        this.logger.error("[create]: Failed to create task", error, { task });
        throw error;
      }

      const createdTask = toCamelCase(data) as ScheduledTask;
      return { success: true, data: ScheduledTaskSchema.parse(createdTask) };
    });
  }

  async update(
    id: string,
    data: UpdateScheduledTask
  ): Promise<UpdateScheduledTaskResult> {
    return tryCatch(async () => {
      const updatePayload = {
        ...data,
        result: data.result as Json,
      };

      const { data: updatedData, error } = await this.supabase
        .from("scheduled_tasks")
        .update(updatePayload)
        .eq("id", id)
        .select(
          `
          *,
          modules(id, endpoint,name, slug, credit_cost),
          generated_content(
            id,
            title,
            type,
            html_preview,
            status,
            metadata
          )
        `
        )
        .maybeSingle();

      if (error) {
        this.logger.error("[update]: Failed to update task", error, {
          id,
          data,
        });
        throw error;
      }

      if (!updatedData) {
        return {
          success: false,
          kind: "TASK_NOT_FOUND",
          error: new Error("Task not found id=" + id),
        } as const;
      }

      const task = toCamelCase(updatedData) as ScheduledTask;
      return { success: true, data: ScheduledTaskSchema.parse(task) };
    });
  }

  async delete(id: string, userId: string): Promise<DeleteScheduledTaskResult> {
    return tryCatch(async () => {
      const { error } = await this.supabase
        .from("scheduled_tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        this.logger.error("[delete]: Failed to delete task", error, {
          id,
          userId,
        });
        throw error;
      }

      return { success: true, data: undefined };
    });
  }

  async getTasksToRun(limit: number = 10): Promise<GetTasksToRunResult> {
    return tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("scheduled_tasks")
        .select(
          `
          *,
          modules(id, endpoint,name, slug, credit_cost),
          profiles(email)
        `
        )
        .eq("status", "scheduled")
        .lte("execution_time", new Date().toISOString())
        .limit(limit);

      if (error) {
        this.logger.error(
          "[getTasksToRun]: Failed to fetch tasks to run",
          error,
          { limit }
        );
        throw error;
      }

      const tasks = toCamelCase(data) as ScheduledTask[];
      return {
        success: true,
        data: ScheduledTaskSchema.array().parse(tasks),
      } as const;
    });
  }
}
