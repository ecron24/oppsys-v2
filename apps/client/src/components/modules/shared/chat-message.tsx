import { MdRenderer } from "@oppsys/ui/components/md-renderer";
import type { Message } from "../module-types";
import { Brain } from "lucide-react";

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.type === "bot";
  const messageId = `${message.type}-${message.timestamp.getTime()}`;
  return (
    <div
      key={messageId}
      className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}
    >
      <div
        className={`max-w-[85%] p-4 rounded-lg border shadow-sm ${
          isBot
            ? "bg-blue-50 border-blue-200 text-blue-900"
            : "bg-green-50 border-green-200 text-green-900"
        }`}
      >
        <div className="flex items-start space-x-3">
          {isBot && (
            <Brain className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm">
              <MdRenderer>{message.message}</MdRenderer>
            </div>
            <span className="text-xs opacity-60 mt-2 block">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

type ChatMessageProps = { message: Message };
