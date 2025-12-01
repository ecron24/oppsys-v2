import { honoClient } from "@/lib/hono-client";
import type { InferRequestType, InferResponseType } from "hono";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userTask = honoClient.api.schedule["user-tasks"].$get;
export type UserTask = InferResponseType<typeof userTask, 200>["data"][number];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateTask = honoClient.api.schedule["update-task"][":taskId"].$put;
export type UpdateTaskBody = InferRequestType<typeof updateTask>["json"];

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: UserTask;
  color: string;
}
