"use client";

import { FormEvent, useRef, useState } from "react";
import { AlertCircle, Bot, Loader2, MessageCircle, Send, User, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { useAppStore } from "../../store/app-store";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

interface AssistantChatResponse {
  data: {
    answer: string;
    sources: Array<{ sourcePath: string; title?: string; score: number }>;
  };
}

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AssistantWidget() {
  const pathname = usePathname();
  const accessToken = useAppStore((state) => state.accessToken);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      content: "Summary\nI can help reason about the current ERP context.\n\nSuggested next steps\nAsk a focused operational question.\n\nRelevant records\nNo records loaded yet.",
    },
  ]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    const userMessage: ChatMessage = { id: nextId(), role: "user", content: message };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await apiFetch<AssistantChatResponse>("/assistant/chat", {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({ message, route: pathname }),
      });

      const sourceLine = response.data.sources.length
        ? `\n\nSources\n${response.data.sources.map((source) => `- ${source.sourcePath}`).join("\n")}`
        : "";
      setMessages((current) => [
        ...current,
        { id: nextId(), role: "assistant", content: `${response.data.answer}${sourceLine}` },
      ]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "Assistant request failed";
      setError(messageText);
      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: "assistant",
          content: `Summary\n${messageText}\n\nSuggested next steps\nRetry after the configuration or service issue is resolved.\n\nRelevant records\nNo records were changed.`,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-lg bg-accent text-white shadow-lg shadow-black/15 hover:bg-accent-hover inline-flex items-center justify-center transition-colors"
        aria-label="Open assistant"
        title="Open assistant"
      >
        <MessageCircle size={22} />
      </button>
    );
  }

  return (
    <section className="fixed bottom-5 right-5 z-40 w-[min(26rem,calc(100vw-2rem))] h-[min(34rem,calc(100vh-2rem))] rounded-lg border border-border bg-elevated shadow-2xl shadow-black/15 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-accent-light text-accent inline-flex items-center justify-center shrink-0">
            <Bot size={17} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text-1 truncate">SyncOps Assistant</h2>
            <p className="text-[11px] text-text-3 truncate">{pathname}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-8 w-8 rounded-lg text-text-3 hover:bg-surface hover:text-text-1 inline-flex items-center justify-center transition-colors"
          aria-label="Close assistant"
          title="Close assistant"
        >
          <X size={17} />
        </button>
      </header>

      {error && (
        <div className="mx-3 mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-bg">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="mt-1 h-7 w-7 rounded-lg bg-accent-light text-accent inline-flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-5 whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-accent text-white"
                  : "bg-elevated border border-border text-text-1"
              }`}
            >
              {message.content}
            </div>
            {message.role === "user" && (
              <div className="mt-1 h-7 w-7 rounded-lg bg-surface text-text-2 inline-flex items-center justify-center shrink-0">
                <User size={15} />
              </div>
            )}
          </article>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-text-3 px-2 py-1">
            <Loader2 size={14} className="animate-spin" />
            Thinking
          </div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-border bg-elevated p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Ask about operations"
            className="min-h-10 max-h-24 flex-1 resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-1 outline-none focus:ring-1 focus:ring-accent"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-10 w-10 rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-50 inline-flex items-center justify-center transition-colors shrink-0"
            aria-label="Send"
            title="Send"
          >
            {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          </button>
        </div>
      </form>
    </section>
  );
}
