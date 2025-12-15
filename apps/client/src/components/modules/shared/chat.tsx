import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { Message } from "../module-types";
import { Brain, Send } from "lucide-react";
import { Button, Input, toast } from "@oppsys/ui";
import { LoadingSpinner } from "@/components/loading";
import type { Result } from "@oppsys/shared";
import { ChatMessage } from "./chat-message";

export type ChatRef = {
  addMessage: (msg: Omit<Message, "timestamp">) => void;
  sendInputMessage: (userInput: string) => Promise<void>;
};

export const Chat = forwardRef(function Chat(
  { onSubmit, conversationHistory, setConversationHistory }: ChatProps,
  ref
) {
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () =>
      ({
        addMessage: (msg: Omit<Message, "timestamp">) => {
          setConversationHistory((prev) => [
            ...prev,
            { ...msg, timestamp: new Date() },
          ]);
        },
        sendInputMessage: async (input: string) => sendMessage(input),
      }) as ChatRef
  );

  const handleSubmit = async () => {
    sendMessage(userInput);
  };

  const sendMessage = async (userInput: string) => {
    const currentMessage = userInput.trim();
    if (!currentMessage || isSubmitting) return;

    if (isSubmittingRef.current) {
      toast.warning("Soumission ignorée (déjà en cours)");
      return;
    }
    isSubmittingRef.current = true;

    setConversationHistory((prev) => [
      ...prev,
      {
        type: "user",
        message: currentMessage,
        timestamp: new Date(),
        data: null,
      },
    ]);

    setUserInput("");
    setIsSubmitting(true);
    setIsTyping(true);

    const result = await onSubmit({
      message: currentMessage,
      history: conversationHistory,
    });

    setIsTyping(false);
    setIsSubmitting(false);
    isSubmittingRef.current = false;

    if (result.success) {
      setConversationHistory((prev) => [
        ...prev,
        {
          type: "bot",
          message: result.data.aiResponse,
          timestamp: new Date(),
          data: null,
        },
      ]);
      return;
    }
    setConversationHistory((prev) => [
      ...prev,
      {
        type: "bot",
        message:
          "❌ **Erreur de connexion**\n\nImpossible de communiquer avec l'assistant IA.",
        timestamp: new Date(),
        data: null,
      },
    ]);
  };

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory, isTyping]);

  return (
    <>
      <div className="border rounded-lg min-h-[400px] max-h-[600px] overflow-y-auto p-4 bg-gradient-to-b from-blue-50/30 to-white">
        <div className="space-y-4">
          {conversationHistory.map((msg) => (
            <ChatMessage
              message={msg}
              key={`${msg.type}-${msg.timestamp.getTime()}`}
            />
          ))}

          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-gray-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="flex space-x-2">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Décrivez votre contenu ou posez une question..."
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          disabled={isSubmitting}
          className="flex-1"
        />
        <Button
          onClick={handleSubmit}
          disabled={!userInput.trim() || isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );
});

type ChatProps = {
  welcomeMessage: string;
  conversationHistory: Message[];
  setConversationHistory: (
    value: Message[] | ((prev: Message[]) => Message[])
  ) => void;
  onSubmit: (params: {
    message: string;
    history: Message[];
  }) => Promise<Result<{ aiResponse: string }>>;
};
