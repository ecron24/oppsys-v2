import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { OppSysContext } from "src/get-context";
import { mockCtx } from "../../../tests/mock-ctx";
import { executeModuleUseCase } from "../execute-module-use-case";
// note: no direct import of exception types needed in these tests

type Module = {
  id: string;
  slug: string;
  name: string;
  endpoint?: string;
  creditCost: number;
};

const makeModule = (overrides?: Partial<Module>): Module => ({
  id: "mod1",
  slug: "mod-slug",
  name: "My Module",
  endpoint: "http://example.local",
  creditCost: 1,
  ...overrides,
});

const DEFAULT_BODY = {
  input: {},
  saveOutput: false,
  timeout: 30000,
  priority: "normal" as const,
};

type UseCaseResult = {
  success: boolean;
  error?: { message: string };
  kind?: string;
  data?: unknown;
};

describe("executeModuleUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("continues when module exists", async () => {
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
      checkCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      getByIdWithPlan: vi.fn(() => ({
        success: true,
        data: { creditBalance: 0 },
      })),
    } as unknown as OppSysContext["profileRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, profileRepo, n8n });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
    expect(moduleRepo.findByIdOrSlug).toHaveBeenCalledWith("mod-slug");
  });

  it("propagates moduleRepo error and performs no side-effects", async () => {
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({
        success: false,
        error: new Error("db err"),
      })),
    } as unknown as OppSysContext["moduleRepo"];

    const notificationRepo = {
      create: vi.fn(),
    } as unknown as OppSysContext["notificationRepo"];
    const profileRepo = {
      checkCredits: vi.fn(),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, notificationRepo, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as UseCaseResult).error?.message).toBe("db err");
    expect(notificationRepo.create).not.toHaveBeenCalled();
    expect(profileRepo.checkCredits).not.toHaveBeenCalled();
  });

  it("propagates checkCredits error and does no side-effects", async () => {
    const module = makeModule();
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
    } as unknown as OppSysContext["moduleRepo"];
    const profileRepo = {
      checkCredits: vi.fn(async () => ({
        success: false,
        error: new Error("profile fail"),
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as UseCaseResult).error?.message).toBe(
      "profile fail"
    );
  });

  it("handles insufficient credits: notifies and returns INSUFFICIENT_CREDITS without side-effects", async () => {
    const module = makeModule({ creditCost: 5 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
    } as unknown as OppSysContext["moduleRepo"];
    const notificationRepo = {
      create: vi.fn(),
    } as unknown as OppSysContext["notificationRepo"];
    const profileRepo = {
      checkCredits: vi.fn(async () => ({
        success: true,
        data: { hasEnoughCredits: false, currentBalance: 1, shortfall: 4 },
      })),
      deductCredits: vi.fn(),
    } as unknown as OppSysContext["profileRepo"];

    const n8n = { executeWorkflow: vi.fn() } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, profileRepo, notificationRepo, n8n });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as UseCaseResult).kind).toBe("INSUFFICIENT_CREDITS");
    expect(notificationRepo.create).toHaveBeenCalled();
    expect(profileRepo.deductCredits).not.toHaveBeenCalled();
    expect((n8n.executeWorkflow as unknown as Mock).mock.calls.length).toBe(0);
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
      checkCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      deductCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      getByIdWithPlan: vi.fn(() => ({
        success: true,
        data: { creditBalance: 0 },
      })),
    } as unknown as OppSysContext["profileRepo"];
    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { message: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, profileRepo, n8n });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(profileRepo.deductCredits).not.toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it("propagates deductCredits failure and notifies", async () => {
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
    const notificationRepo = {
      create: vi.fn(),
    } as unknown as OppSysContext["notificationRepo"];

    const ctx = mockCtx({ moduleRepo, profileRepo, notificationRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as UseCaseResult).error?.message).toBe(
      "deduct failed"
    );
    expect(notificationRepo.create).toHaveBeenCalled();
  });

  it("refunds credits when createUsage fails (creditCost > 0)", async () => {
    const module = makeModule({ creditCost: 3 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({
        success: false,
        error: new Error("create fail 123"),
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

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect(profileRepo.addCredits).toHaveBeenCalledWith("u1", 3);
  });

  it("returns MODULE_INVALID when user.email is missing after usage creation", async () => {
    const module = makeModule({ creditCost: 0 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({
        success: true,
        data: { id: "usage1", usedAt: new Date().toISOString() },
      })),
    } as unknown as OppSysContext["moduleRepo"];

    const ctx = mockCtx({ moduleRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "", role: "client" },
    });

    expect(res.success).toBe(false);
    expect((res as unknown as UseCaseResult).kind).toBe("VALIDATION_ERROR");
  });

  it("handles execution failure: notifies and updates usage as failed", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage = { id: "usage-123", usedAt: new Date().toISOString() };
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: false,
        error: new Error("run err"),
      })),
    } as unknown as OppSysContext["n8n"];
    const notificationRepo = {
      create: vi.fn(),
    } as unknown as OppSysContext["notificationRepo"];
    const profileRepo = {
      checkCredits: vi.fn(async () => ({
        success: true,
        data: { hasEnoughCredits: true, currentBalance: 5 },
      })),
      deductCredits: vi.fn(async () => ({ success: true, data: null })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, n8n, notificationRepo, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    expect(notificationRepo.create).toHaveBeenCalled();
    expect(moduleRepo.updateUsage).toHaveBeenCalled();
  });

  it("on successful execution updates usage and notifies success", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage = { id: "usage-555", usedAt: new Date().toISOString() };
    const out = { content: "hello world", title: "T", type: "text" };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: out })),
    } as unknown as OppSysContext["n8n"];
    const notificationRepo = {
      create: vi.fn(),
    } as unknown as OppSysContext["notificationRepo"];
    const contentRepo = {
      create: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["contentRepo"];
    const profileRepo = {
      checkCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      deductCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      getByIdWithPlan: vi.fn(() => ({
        success: true,
        data: { creditBalance: 0 },
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({
      moduleRepo,
      n8n,
      notificationRepo,
      contentRepo,
      profileRepo,
    });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { ...DEFAULT_BODY, saveOutput: true },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(moduleRepo.updateUsage).toHaveBeenCalled();
    expect(notificationRepo.create).toHaveBeenCalled();
    expect(contentRepo.create).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it("does not save output when saveOutput is false", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage = { id: "usage-x", usedAt: new Date().toISOString() };
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { result: "ok" },
      })),
    } as unknown as OppSysContext["n8n"];
    const contentRepo = {
      create: vi.fn(),
    } as unknown as OppSysContext["contentRepo"];
    const profileRepo = {
      checkCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      deductCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      getByIdWithPlan: vi.fn(() => ({
        success: true,
        data: { creditBalance: 0 },
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, n8n, contentRepo, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(contentRepo.create).not.toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it("truncates content/title and enriches metadata when saving output", async () => {
    const module = makeModule({ creditCost: 0, name: "Article Generator" });
    const usage = { id: "usage-ttl", usedAt: new Date().toISOString() };
    const big = "x".repeat(60000);
    const out = {
      content: big,
      title: "T".repeat(300),
      url: "http://ok.example",
    };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: out })),
    } as unknown as OppSysContext["n8n"];
    const contentRepo = {
      create: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["contentRepo"];
    const profileRepo = {
      checkCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      deductCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      getByIdWithPlan: vi.fn(() => ({
        success: true,
        data: { creditBalance: 0 },
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, n8n, contentRepo, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { ...DEFAULT_BODY, saveOutput: true },
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(contentRepo.create).toHaveBeenCalled();
    const calledWith = (contentRepo.create as unknown as Mock).mock.calls[0][0];
    expect(calledWith.contentData.title.length).toBeLessThanOrEqual(200);
    expect(calledWith.contentData.url).toBe("http://ok.example");
    expect(calledWith.contentData.metadata.original_output).toBeDefined();
    expect(res.success).toBe(true);
  });

  it("propagates getByIdWithPlan error", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage = { id: "u-final", usedAt: new Date().toISOString() };
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const profileRepo = {
      checkCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      getByIdWithPlan: vi.fn(async () => ({
        success: false,
        error: new Error("profile fetch fail"),
      })),
    } as unknown as OppSysContext["profileRepo"];
    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { result: "yay" },
      })),
    } as unknown as OppSysContext["n8n"];

    const ctx = mockCtx({ moduleRepo, profileRepo, n8n });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error?.message).toBe("profile fetch fail");
    }
  });

  it("returns camelCased success response with proper fields", async () => {
    const module = makeModule({ creditCost: 1 });
    const usage = { id: "usage-ok", usedAt: new Date().toISOString() };
    const out = { result: "yay" };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];

    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: out })),
    } as unknown as OppSysContext["n8n"];
    const profileRepo = {
      getByIdWithPlan: vi.fn(async () => ({
        success: true,
        data: { creditBalance: 42 },
      })),
      checkCredits: vi.fn(async () => ({
        success: true,
        data: { hasEnoughCredits: true, currentBalance: 10 },
      })),
      deductCredits: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, n8n, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(res.success).toBe(true);
    if (res.success) {
      const data = res.data;
      expect(data.usageId).toBe("usage-ok");
      expect(data.creditsUsed).toBe(1);
      expect(data.output).toEqual(out);
      expect(data.remainingCredits).toBe(42);
    }
  });

  it("does not call n8n when createUsage fails (ensures ordering)", async () => {
    const module = makeModule({ creditCost: 1 });
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({
        success: false,
        error: new Error("create fail"),
      })),
    } as unknown as OppSysContext["moduleRepo"];
    const n8n = { executeWorkflow: vi.fn() } as unknown as OppSysContext["n8n"];

    const profileRepo = {
      checkCredits: vi.fn(async () => ({
        success: true,
        data: { hasEnoughCredits: true, currentBalance: 10 },
      })),
      deductCredits: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, n8n, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(n8n.executeWorkflow).not.toHaveBeenCalled();
    expect(res.success).toBe(false);
  });

  it("metadata defaults and has expected keys when saving", async () => {
    const module = makeModule({ creditCost: 0 });
    const usedAt = new Date().toISOString();
    const usage = { id: "u-meta", usedAt };
    const out = { content: "hi", title: "t" };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];
    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: out })),
    } as unknown as OppSysContext["n8n"];
    const contentRepo = {
      create: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["contentRepo"];
    const profileRepo = {
      checkCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      deductCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      getByIdWithPlan: vi.fn(() => ({
        success: true,
        data: { creditBalance: 0 },
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, n8n, contentRepo, profileRepo });

    await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: { ...DEFAULT_BODY, saveOutput: true },
      user: { id: "u1", email: "udj@e.com", role: "client" },
    });

    const call = (contentRepo.create as unknown as Mock).mock.calls[0][0];
    const meta = call.contentData.metadata;

    expect(meta.output_keys).toBeDefined();
    expect(typeof meta.content_length).toBe("number");
    expect(typeof meta.word_count).toBe("number");
    expect(new Date(meta.created_at).toString()).not.toBe("Invalid Date");
  });

  it("handles createUsage success when id is missing (does not crash, attempts update)", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage = { usedAt: new Date().toISOString() } as Record<
      string,
      unknown
    >; // missing id
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
    const profileRepo = {
      checkCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      deductCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      getByIdWithPlan: vi.fn(() => ({
        success: true,
        data: { creditBalance: 0 },
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, n8n, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(moduleRepo.updateUsage).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it("calculates executionTime roughly from usage.usedAt", async () => {
    const module = makeModule({ creditCost: 0 });
    const usedAt = new Date(Date.now() - 2000).toISOString();
    const usage = { id: "u-time", usedAt };
    const out = { result: "ok" };

    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];
    const n8n = {
      executeWorkflow: vi.fn(async () => ({ success: true, data: out })),
    } as unknown as OppSysContext["n8n"];
    const profileRepo = {
      checkCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      deductCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      getByIdWithPlan: vi.fn(() => ({
        success: true,
        data: { creditBalance: 0 },
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, n8n, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(moduleRepo.updateUsage).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it("when usage.usedAt missing executionTime is non-negative", async () => {
    const module = makeModule({ creditCost: 0 });
    const usage = { id: "u-no-time" };
    const moduleRepo = {
      findByIdOrSlug: vi.fn(async () => ({ success: true, data: module })),
      createUsage: vi.fn(async () => ({ success: true, data: usage })),
      updateUsage: vi.fn(async () => ({ success: true })),
    } as unknown as OppSysContext["moduleRepo"];
    const n8n = {
      executeWorkflow: vi.fn(async () => ({
        success: true,
        data: { foo: "bar" },
      })),
    } as unknown as OppSysContext["n8n"];
    const profileRepo = {
      checkCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      deductCredits: vi.fn(() => ({
        success: true,
        data: { hasEnoughCredits: true },
      })),
      getByIdWithPlan: vi.fn(() => ({
        success: true,
        data: { creditBalance: 0 },
      })),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, n8n, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(moduleRepo.updateUsage).toHaveBeenCalled();
    expect(res.success).toBe(true);
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
      deductCredits: vi.fn(),
      addCredits: vi.fn(),
    } as unknown as OppSysContext["profileRepo"];

    const ctx = mockCtx({ moduleRepo, profileRepo });

    const res = await executeModuleUseCase(ctx, {
      params: { id: "mod-slug" },
      body: DEFAULT_BODY,
      user: { id: "u1", email: "u@example.com", role: "client" },
    });

    expect(profileRepo.addCredits).not.toHaveBeenCalled();
    expect(res.success).toBe(false);
  });
});
