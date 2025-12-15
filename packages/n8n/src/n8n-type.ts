export interface N8nModule {
  id: string;
  name: string;
  slug: string;
  endpoint: string;
  n8nTriggerType: "CHAT" | "STANDARD";
}

export type N8nInput = {
  sessionId?: string;
  message?: string;
  context?: Record<string, any>;
};

// Résultat typé pour l'appel n8n
export type N8nResult =
  | {
      module_type: "unknown";
    }
  | AiWriterOutput
  | DocumentGenerator
  | SocialFactory
  | EmailCampaignOutput
  | TalentAnalyserOutput;

export type DocumentGenerator = {
  module_type: "document-generator";
  output: {};
};

export type SocialFactory = {
  module_type: "social-factory";
  output: {};
};

export type AiWriterOutput = {
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

export type EmailCampaignOutput = {
  module_type: "email-campaign";
  output: {
    state: "missing" | "ready_for_confirmation" | "confirmed";
    missing_field: string | null;
    question: string | null;

    result_partial: {
      campaign: {
        name: string | null;
        objective: string | null;
        type: string | null;
        style: string | null;
        call_to_action: string | null;
        key_messages: string[] | null;
      } | null;
      audience: {
        type: string | null;
        size: number | null;
      } | null;
    } | null;

    result: {
      campaign: {
        name: string;
        objective: string;
        type: string;
        style: string;
        call_to_action: string;
        key_messages: string[];
      };
      audience: {
        type: string;
        size: number;
      };
    } | null;
    errors: string[] | null;
  };
};

export type TalentAnalyserOutput = {
  module_type: "talent-analyzer";
  output: {
    state: "missing" | "ready_for_confirmation" | "confirmed";
    missing_field: string | null;
    question: string | null;
    result_partial: {
      jobPosition: string | null;
      jobDescription: string | null;
      objective: string | null;
    } | null;
    result: {
      jobPosition: string;
      jobDescription: string;
      objective: string;
    } | null;
    errors: string[] | null;
  };
};
