import { describe, expect, it, vi, beforeEach } from "vitest";
import { chatWithModuleUseCase } from "../chat-with-module-use-case";
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
      expect(res.data.message).toBe("hi");
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
    if (res.success) {
      expect(res.data.nextStep).toBe("next");
      expect(res.data.isComplete).toBe(true);
    }
  });
});
