// Résultat typé pour l'appel n8n
export type N8nResult =
  | {
      module_type: "unknown";
      message?: string;
      output?: string;
      response?: string;
      data?: {
        output?: string;
        message?: string;
        response?: string;
        [key: string]: unknown;
      };
      options?: unknown;
      nextStep?: unknown;
      next_step?: unknown;
      type?: string;
      context?: Record<string, undefined>;
      is_complete?: boolean;
      isComplete?: boolean;
      content?: unknown;
      text?: unknown;
      result?: unknown;
      generated_content?: unknown;
      title?: unknown;
      name?: unknown;
      subject?: unknown;
      content_type?: unknown;
      url?: unknown;
      link?: unknown;
      metadata?: Record<string, unknown>;
    }
  | AiWriterOutput;

type AiWriterOutput = {
  module_type: "ai-writer";
  output: {
    state: "missing" | "ready_for_confirmation" | "confirmed";
    missing_field: string | null;
    question: string | null;

    result_partial: {
      subject: string | null;
      audience: string | null;
      keywords: string[] | null;
      contentType: string | null;
      tone: string | null;
      length: string | null;
      language: string | null;
      userPlan: string | null;
    } | null;

    result: {
      subject: string;
      audience: string;
      keywords: string[];
      combined_text: string;
      contentType: string | null;
      tone: string | null;
      length: string | null;
      language: string | null;
      userPlan: string | null;
    } | null;

    errors: string[] | null;
  };
};

export interface N8nModule {
  id: string;
  name: string;
  slug: string;
  endpoint: string;
  n8n_trigger_type?: "CHAT" | "STANDARD";
}

export type N8nInput = {
  isChatMode?: boolean;
  sessionId?: string;
  message?: string;
  context?: Record<string, any>;
  moduleType?: string;
  timestamp?: string;
  // real-estate-lease-generator
  [key: string]: any;
  // social-factory
  networks?: string[];
  postType?: string;
  contentStyle?: string;
  objective?: string;
  topic?: string;
  keywords?: string;
  callToAction?: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  autoGenerateHashtags?: boolean;
  mentions?: string;
  addCTA?: boolean;
  ctaType?: string;
  ctaUrl?: string;
  schedulePost?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  media?: { imageCount: number; hasVideo: boolean };
  // email-campaign
  campaign?: Record<string, any>;
  audience?: Record<string, any>;
  content?: Record<string, any>;
  ai?: any;
  scheduling?: Record<string, any>;
  testing?: Record<string, any>;
  tracking?: Record<string, any>;
  integration?: any;
  userPlan?: string;
  n8nSessionId?: string;
  n8nContext?: Record<string, any>;
  // article-writer
  article?: {
    title?: string;
    description?: string;
    contentType?: string;
    tone?: string;
    length?: number;
    language?: string;
    seoLevel?: string;
  };
  seo?: {
    targetKeywords?: string;
    audience?: string;
    seoOptimize?: boolean;
    customOutline?: string;
  };
  options?: {
    includeIntro?: boolean;
    includeConclusion?: boolean;
    includeCallToAction?: boolean;
    includeImages?: boolean;
    includeFAQ?: boolean;
    ragDocuments?: any[];
  };
  user?: {
    plan?: string;
    isPremium?: boolean;
    balance?: number;
  };
  conversation?: {
    currentStep?: number;
    isComplete?: boolean;
    hasPreConfig?: boolean;
  };
  metadata?: {
    sessionId?: string;
    timestamp?: string;
    moduleType?: string;
    currentCost?: number;
    n8nWebhookUrl?: string;
  };
  chatContext?: any;
  n8nWebhookUrl?: string;
  title?: string;
  description?: string;
  contentType?: string;
  tone?: string;
  length?: number;
  targetKeywords?: string;
  seoLevel?: string;
  language?: string;
  currentStep?: number;
};
