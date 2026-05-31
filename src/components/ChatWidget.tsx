import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `/api/chat`;

const QUICK_QUESTIONS = [
  "🔥 What are Kitchub's best sellers?",
  "🚚 Tell me about Shipping & Delivery",
  "📦 How do I track my order?",
  "✨ Do you have smart kitchen tools?"
];

const ChatWidget = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! 👋 I'm Kitchub Store's AI assistant. I have live access to our product catalog! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendQuestion = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get response');
      }
      const json = await resp.json();
      const reply = json.reply || 'Sorry, I could not generate a response right now.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      toast.error(e.message || "Failed to send message");
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again." }]);
    }

    setIsLoading(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    await sendQuestion(text);
  };

  const handleQuickQuestionClick = (q: string) => {
    sendQuestion(q);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-15 h-15 rounded-full bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-elevated flex items-center justify-center transition-all duration-300"
          >
            <MessageCircle className="w-6.5 h-6.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-6rem)] bg-card/95 backdrop-blur-md rounded-3xl shadow-elevated border border-border/80 flex flex-col overflow-hidden"
          >
            {/* Header with high-end gradient */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold tracking-wide">Kitchub Store AI</p>
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                  <p className="text-[10px] text-white/85">Powered by Gemini 1.5 Flash</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm border border-primary/5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-soft ${msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-secondary text-foreground rounded-bl-none border border-border/50"
                      }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&_a]:text-primary [&_a]:font-semibold [&_a]:underline [&_ul]:pl-4 [&_ol]:pl-4">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => {
                              if (href?.startsWith("/")) {
                                return (
                                  <button
                                    onClick={() => { navigate(href); setOpen(false); }}
                                    className="text-primary font-semibold underline hover:opacity-85 transition-opacity text-left"
                                  >
                                    {children}
                                  </button>
                                );
                              }
                              return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm border border-accent/5">
                      <User className="w-3.5 h-3.5 text-accent" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Quick Questions on Welcome */}
              {messages.length === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2.5 mt-6 px-1"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Suggested Questions</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {QUICK_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestionClick(q)}
                        className="text-left text-xs px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-bl-none px-4 py-3 shadow-soft border border-border/50">
                    <div className="flex gap-1.5 py-1">
                      <span className="w-2.5 h-2.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2.5 h-2.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2.5 h-2.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/80 bg-background/50">
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex items-center gap-2.5"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about products, orders..."
                  className="flex-1 px-4.5 py-3 rounded-2xl bg-background border border-border/80 text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/80 shadow-inner"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-95 transition-all disabled:opacity-40 shadow-soft"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
