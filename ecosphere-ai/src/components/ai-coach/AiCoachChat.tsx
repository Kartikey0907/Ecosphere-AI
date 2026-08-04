"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  FileText, 
  MessageSquare,
  HelpCircle,
  TrendingDown,
  Globe
} from "lucide-react";
import { answerQuestion } from "@/lib/ai-engine";
import { cn } from "@/lib/utils";

interface AiCoachChatProps {
  weeklyReport: string;
}

interface ChatMessage {
  sender: "user" | "gaia";
  text: string;
  timestamp: Date;
}

export default function AiCoachChat({ weeklyReport }: AiCoachChatProps) {
  const [activeMode, setActiveMode] = useState<"chat" | "report">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "gaia",
      text: "Hello! I am Gaia, your AI sustainability coach. How can I help you reduce your environmental footprint today? You can ask me questions about carbon reduction, water conservation, or utility savings.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      const response = answerQuestion(text);
      const gaiaMsg: ChatMessage = {
        sender: "gaia",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, gaiaMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const suggestionChips = [
    "How do I reduce carbon footprint?",
    "Tips to save water",
    "How to recycle plastic?",
    "Ways to save electricity",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <button
          onClick={() => setActiveMode("chat")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold border transition-all duration-300",
            activeMode === "chat"
              ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10"
              : "bg-slate-905/40 border-slate-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Gaia Chat Assistant</span>
        </button>

        <button
          onClick={() => setActiveMode("report")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold border transition-all duration-300",
            activeMode === "report"
              ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10"
              : "bg-slate-905/40 border-slate-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Weekly Gaia Report</span>
        </button>

        {/* Informative widget */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 space-y-3.5 hidden lg:block">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Globe className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>AI Impact Metric</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Gaia models your consumption habits and projects your cumulative resource savings over a 12-month horizon.
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <TrendingDown className="w-3.5 h-3.5" /> 84 kg CO₂ annual forecast saved
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 min-h-[500px] flex flex-col justify-between backdrop-blur-md">
        
        {/* Chat Mode */}
        {activeMode === "chat" && (
          <div className="flex flex-col justify-between flex-1 gap-6">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-xs text-white">Gaia Coach</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Online
              </span>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto max-h-[350px] space-y-4 pr-1 scrollbar-thin">
              {messages.map((msg, index) => {
                const isGaia = msg.sender === "gaia";
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3 text-xs leading-relaxed max-w-[80%]",
                      isGaia ? "self-start" : "self-end flex-row-reverse ml-auto"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center font-bold border shrink-0 text-slate-950",
                      isGaia
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-gradient-to-tr from-emerald-500 to-cyan-500"
                    )}>
                      {isGaia ? <Bot className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4 text-slate-950" />}
                    </div>
                    
                    <div className={cn(
                      "p-3 rounded-2xl border",
                      isGaia 
                        ? "bg-slate-950/60 border-slate-900 text-slate-300" 
                        : "bg-slate-900 border-slate-805 text-white"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-3 text-xs text-slate-400 max-w-[80%]">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input & Suggestions Pane */}
            <div className="space-y-4">
              
              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2">
                {suggestionChips.map((chip, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSend(chip)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-850 hover:border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    {chip}
                  </button>
                ))}
              </div>

              {/* TextInput Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Gaia anything about sustainability..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
                  className="flex-1 bg-slate-950 border border-slate-805 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleSend(inputValue)}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 shrink-0"
                >
                  <Send className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* Report Mode */}
        {activeMode === "report" && (
          <div className="flex flex-col justify-between flex-1">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-6">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-xs text-white">Gaia Weekly Assessment Report</span>
            </div>

            <div className="prose prose-invert prose-xs text-slate-300 whitespace-pre-wrap leading-relaxed flex-1 overflow-y-auto max-h-[380px] bg-slate-950/40 border border-slate-900 rounded-2xl p-5">
              {weeklyReport}
            </div>

            <p className="text-[10px] text-slate-500 mt-4 leading-normal text-center border-t border-slate-900 pt-4">
              Gaia updates your sustainability metrics dynamically as you log activities. Review reports weekly to find footprint improvements.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
