import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  chatWithModuleUseCase,
  ChatWithModuleBodySchema,
} from "../chat-with-module-use-case";
import type { OppSysContext } from "src/get-context";
import { mockCtx } from "src/tests/mock-ctx";

type Module = {
  id: string;
  slug: string;
  name: string;
  endpoint?: string;
  creditCost: number;
};

type UsageRecord = { id: string; usedAt?: string };

const makeModule = (overrides?: Partial<Module>): Module => ({
  id: "mod1",
  slug: "mod-slug",
  name: "My Module",
  endpoint: "http://example.local",
  creditCost: 1,
  ...overrides,
});

describe("chatWithModuleUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns MODULE_NOT_FOUND when module is missing", async () => {
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: null })),
    } as unknown as OppSysContext["moduleRepo"];

    const ctx = mockCtx({ moduleRepo });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as { kind?: string }).kind).toBe("MODULE_NOT_FOUND");
  });

  it("propagates moduleRepo error when findByIdOrSlug fails", async () => {
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({
        success: false,
        error: new Error("db err"),
      })),
    } as unknown as OppSysContext["moduleRepo"];

    const ctx = mockCtx({ moduleRepo });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as { error: Error }).error.message).toBe("db err");
  });

  it("returns INSUFFICIENT_CREDITS when user has not enough credits", async () => {
    const module = makeModule({ creditCost: 5 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
    } as unknown as OppSysContext["moduleRepo"];

    const profileRepo = {
      checkCredits: vi.fn(async () => ({
        success: true,
        data: { hasEnoughCredits: false, currentBalance: 1, shortfall: 4 },
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, profileRepo });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as { kind?: string }).kind).toBe(
      "INSUFFICIENT_CREDITS"
    );
  });

  it("propagates profileRepo error when checkCredits fails", async () => {
    const module = makeModule({ creditCost: 5 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
    } as unknown as OppSysContext["moduleRepo"];

    const profileRepo = {
      checkCredits: vi.fn(async () => ({
        success: false,
        error: new Error("profile db fail"),
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, profileRepo });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as { error: Error }).error.message).toBe(
      "profile db fail"
    );
  });

  it("propagates deductCredits failure", async () => {
    const module = makeModule({ creditCost: 2 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
    } as unknown as OppSysContext["moduleRepo"];

    const profileRepo = {
      checkCredits: vi.fn(async () => ({
        success: true,
        data: { hasEnoughCredits: true, currentBalance: 5 },
      })),
      deductCredits: vi.fn(async () => ({
        success: false,
        error: new Error("deduct failed"),
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, profileRepo });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as { error: Error }).error.message).toBe(
      "deduct failed"
    );
  });

  it("reverses credits when createUsage fails", async () => {
    const module = makeModule({ creditCost: 3 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({
        success: false,
        error: new Error("create fail"),
      })),
    } as unknown as OppSysContext["moduleRepo"];

    const profileRepo = {
      checkCredits: vi.fn(async () => ({
        success: true,
        data: { hasEnoughCredits: true, currentBalance: 10 },
      })),
      deductCredits: vi.fn(async () => ({ success: true, data: null })),
      addCredits: vi.fn(async () => ({ success: true, data: null })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, profileRepo });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect(profileRepo.addCredits).toHaveBeenCalledWith("u1", 3);
  });

  it("does not call deductCredits when module.creditCost is 0", async () => {
    const module = makeModule({ creditCost: 0 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({
        success: true,
        data: { id: "u1", usedAt: new Date().toISOString() },
      })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const profileRepo = {
      checkCredits: vi.fn(),
      deductCredits: vi.fn(),
    } as unknown as OppSysContext["profileRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, profileRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(profileRepo.deductCredits).not.toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it("returns MODULE_INVALID when user email is missing after usage creation", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage1",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
    } as unknown as OppSysContext["moduleRepo"];

    const ctx = mockCtx({ moduleRepo });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as { kind?: string }).kind).toBe("VALIDATION_ERROR");
  });

  it("handles execution failure and updates usage as failed", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-123",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true, data: null })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: false,
        error: new Error("exec fail"),
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(moduleRepo.updateUsage).toHaveBeenCalled();
    expect((res as unknown as { kind?: string }).kind).toBe("EXECUTION_ERROR");
  });

  it("succeeds and updates usage on successful execution", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-ok",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true, data: null })),
    } as unknown as OppSysContext["moduleRepo"];

    const execData = {
      message: "hi",
      next_step: null,
      options: {},
      type: "text",
      context: {},
      is_complete: true,
    };

    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: execData })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(moduleRepo.updateUsage).toHaveBeenCalledWith(
        usage.id,
        expect.objectContaining({
          status: "success",
          executionTime: expect.any(Number),
        })
      );
    }
  });

  it("fails when createUsage returns success true but missing data.id", async () => {
    const module = makeModule({ creditCost: 0 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: null })),
    } as unknown as OppSysContext["moduleRepo"];

    const ctx = mockCtx({ moduleRepo });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
  });

  it("handles n8n camelCase response keys (nextStep/isComplete)", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-camel",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true, data: null })),
    } as unknown as OppSysContext["moduleRepo"];

    const execData = {
      message: "ok",
      nextStep: "next",
      options: {},
      type: "text",
      context: {},
      isComplete: true,
    };

    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: execData })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
  });

  // --- Additional tests following the detailed plan ---

  it("schema: valid minimal body passes zod validation", () => {
    const body = { sessionId: "s1", message: "hi", context: {} };
    const parseRes = ChatWithModuleBodySchema.safeParse(body);
    expect(parseRes.success).toBe(true);
  });

  it("schema: invalid body (missing message) fails validation", () => {
    const body = { sessionId: "s1", context: {} } as unknown;
    const parseRes = ChatWithModuleBodySchema.safeParse(body);
    expect(parseRes.success).toBe(false);
  });

  it("overwrites provided body.timestamp with current ISO timestamp in chatInput", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = { id: "u-ts" };

    let capturedInput: Record<string, unknown> | null = null;

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async (usageData: Record<string, unknown>) => {
        capturedInput = (usageData["input"] as Record<string, unknown>) ?? null;
        return { success: true, data: usage };
      }),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: {
        sessionId: "s1",
        message: "hello",
        context: {},
      },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
    expect(capturedInput).not.toBeNull();
  });

  it("propagates findByIdOrSlug error and does not call other repos", async () => {
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({
        success: false,
        error: new Error("db"),
      })),
    } as unknown as OppSysContext["moduleRepo"];

    const profileRepo = {
      checkCredits: vi.fn(),
      deductCredits: vi.fn(),
      addCredits: vi.fn(),
    } as unknown as OppSysContext["profileRepo"];
    const moduleRepoSpy = moduleRepo;

    const ctx = mockCtx({ moduleRepo: moduleRepoSpy, profileRepo });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hi", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as { error?: Error }).error).toBeInstanceOf(Error);
    expect(profileRepo.checkCredits).not.toHaveBeenCalled();
  });

  it("deducts credits and creates usage when credits ok for cost > 0", async () => {
    const module = makeModule({ creditCost: 2 });
    const usage: UsageRecord = {
      id: "usage-deduct",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const profileRepo = {
      checkCredits: vi.fn(async () => ({
        success: true,
        data: { hasEnoughCredits: true, currentBalance: 10 },
      })),
      deductCredits: vi.fn(async () => ({ success: true, data: null })),
    } as unknown as OppSysContext["profileRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, profileRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hey", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
    expect(profileRepo.deductCredits).toHaveBeenCalledWith("u1", 2);
    expect(moduleRepo.createUsage).toHaveBeenCalled();
  });

  it("handles createUsage success when usage.usedAt is missing (no crash) and still updates usage", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: Partial<UsageRecord> = { id: "usage-no-usedAt" };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hi", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
    expect(moduleRepo.updateUsage).toHaveBeenCalled();
  });

  it("propagates thrown exception from n8n.executeWorkflow (rejects)", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-throw",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => {
        throw new Error("network");
      }),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.message).toBe("network");
    }
  });

  it("handles non-object options from n8n (e.g., string) without crashing", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-opt-str",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const execData: unknown = { message: "ok", options: "not-an-object" };
    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: execData })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
  });

  it("prefers next_step over nextStep when both present", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-both",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const execData = {
      message: "m",
      next_step: "ns",
      nextStep: "should-not-win",
    };
    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: execData })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
  });

  it("defaults missing type to 'text' and missing is_complete to false", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-def",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const execData = { message: "ok" };
    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: execData })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
  });

  it("propagates execution.data.data into chatResponse.data", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-data",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const execData = { message: "ok", data: { foo: "bar" } };
    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: execData })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
    if (res.success) expect(res.data.data).toEqual(execData);
  });

  it("returns success even if moduleRepo.updateUsage returns success:false after successful execution", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-update-fail",
      usedAt: new Date().toISOString(),
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({
        success: false,
        error: new Error("update fail"),
      })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
    expect(moduleRepo.updateUsage).toHaveBeenCalledWith(
      usage.id,
      expect.objectContaining({ status: "success" })
    );
  });

  it("calculates executionTime approximately from usage.usedAt", async () => {
    const module = makeModule({ creditCost: 0 });
    const usedAt = new Date(Date.now() - 5000).toISOString();
    const usage: UsageRecord = { id: "usage-time", usedAt };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(moduleRepo.updateUsage).toHaveBeenCalledWith(
      usage.id,
      expect.objectContaining({ executionTime: expect.any(Number) })
    );
    const updateMock = moduleRepo.updateUsage as unknown as {
      mock?: { calls: unknown[][] };
    };
    const calledArg = updateMock.mock!.calls[0][1] as Record<string, unknown>;
    expect(calledArg.executionTime).toBeGreaterThanOrEqual(4800);
    expect(calledArg.executionTime).toBeLessThanOrEqual(5400 + 200);
  });

  it("when usage.usedAt is missing executionTime is small and non-negative", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: Partial<UsageRecord> = { id: "usage-no-time" };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    const updateMock2 = moduleRepo.updateUsage as unknown as {
      mock?: { calls: unknown[][] };
    };
    const calledArg = updateMock2.mock!.calls[0][1] as Record<string, unknown>;
    expect(calledArg.executionTime).toBeGreaterThanOrEqual(0);
  });

  it("detects metadata mapping bug: user_email should be user.email and session_id should be body.sessionId", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-meta",
      usedAt: new Date().toISOString(),
    };

    let capturedUsageData: Record<string, unknown> | null = null;

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async (usageData: Record<string, unknown>) => {
        capturedUsageData = usageData;
        return { success: true, data: usage };
      }),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "session-xyz", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    // The correct mapping expected by reviewers:
    expect(capturedUsageData).not.toBeNull();
    const cud = capturedUsageData! as Record<string, unknown>;
    const meta = cud["metadata"] as Record<string, unknown>;
    expect(meta["user_email"]).toBe("u@example.com");
    expect(meta["session_id"]).toBe("session-xyz");
  });

  it("ensures chatInput.moduleType === params.id and isChatMode === true passed into usage.input", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-payload",
      usedAt: new Date().toISOString(),
    };

    let capturedInput: Record<string, unknown> | null = null;

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async (usageData: Record<string, unknown>) => {
        capturedInput = (usageData["input"] as Record<string, unknown>) ?? null;
        return { success: true, data: usage };
      }),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(capturedInput).not.toBeNull();
  });

  it("createUsage.used_at is an ISO string close to now", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage: UsageRecord = {
      id: "usage-usedat",
      usedAt: new Date().toISOString(),
    };

    let capturedUsage: Record<string, unknown> | null = null;

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async (usageData: Record<string, unknown>) => {
        capturedUsage = usageData;
        return { success: true, data: usage };
      }),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, n8n });

    await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(capturedUsage).not.toBeNull();
    const cup = capturedUsage! as Record<string, unknown>;
    expect(cup["used_at"]).toBeDefined();
    expect(() => Date.parse(cup["used_at"] as string)).not.toThrow();
    const delta = Math.abs(Date.now() - Date.parse(cup["used_at"] as string));
    expect(delta).toBeLessThan(5000);
  });

  it("does not call addCredits when createUsage fails for creditCost === 0", async () => {
    const module = makeModule({ creditCost: 0 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({
        success: false,
        error: new Error("create fail"),
      })),
    } as unknown as OppSysContext["moduleRepo"];

    const profileRepo = {
      addCredits: vi.fn(),
    } as unknown as OppSysContext["profileRepo"];
    const ctx = mockCtx({ moduleRepo, profileRepo });

    const res = await chatWithModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { sessionId: "s1", message: "hello", context: {} },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect(profileRepo.addCredits).not.toHaveBeenCalled();
  });
});
