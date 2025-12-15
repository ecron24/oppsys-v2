import type { N8nInput } from "@oppsys/n8n";
import { buildUseCase } from "../../lib/use-case-builder";
import z from "zod";

export const RunScheduledTasksUseCaseInput = z.object({
  limit: z.coerce.number().int().min(1).max(10).default(10),
});

export const runScheduledTasksUseCase = buildUseCase()
  .input(RunScheduledTasksUseCaseInput)
  .handle(async (ctx, input) => {
    const { limit } = input;

    // Get tasks to run
    const tasksResult = await ctx.scheduledTaskRepo.getTasksToRun(limit);
    if (!tasksResult.success) return tasksResult;

    const tasks = tasksResult.data;
    if (tasks.length === 0) {
      return { success: true, data: { processedTasks: 0 } };
    }

    const executions = tasks.map(async (task) => {
      // Update status to running
      await ctx.scheduledTaskRepo.update(task.id, {
        status: "running",
        startedAt: new Date().toISOString(),
      });
      // Get module details
      if (!task.modules) return;
      const module = task.modules;
      const n8nModule = {
        id: module.id,
        name: module.name,
        slug: module.slug,
        endpoint: module.endpoint,
        n8nTriggerType: "STANDARD" as const,
      };
      const n8nInput: N8nInput = {
        context: { ...(task.payload || {}) },
      };
      // Execute workflow
      const resultN8n = await ctx.n8n.executeWorkflow({
        module: n8nModule,
        input: n8nInput,
        userId: task.userId,
        userEmail: task.profiles?.email || "",
      });
      if (!resultN8n.success) {
        // Update status to failed and refund credits
        await ctx.scheduledTaskRepo.update(task.id, {
          status: "failed",
          completedAt: new Date().toISOString(),
          result: resultN8n.data,
        });
        // Refund credits if module has credit cost
        await ctx.profileRepo.addCredits(task.userId, module.creditCost);
        return resultN8n;
      }

      // Update status to completed
      await ctx.scheduledTaskRepo.update(task.id, {
        status: "completed",
        completedAt: new Date().toISOString(),
        result: resultN8n.data,
      });
      return;
    });

    await Promise.all(executions);

    return { success: true, data: { processedTasks: tasks.length } };
  });
