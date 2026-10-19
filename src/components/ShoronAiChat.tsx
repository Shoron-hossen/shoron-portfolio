import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  User,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type { PortfolioData } from '../portfolioStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function buildShoronPersonaPrompt(data: PortfolioData): string {
  const skillList = (data.skillCategories || [])
    .map((c) => `${c.category}: ${c.skills.join(', ')}`)
    .join('\n');

  const projectList = (data.projects || [])
    .map(
      (p) =>
        `- ${p.title} (${p.category}): ${p.subtitle}. Tech: ${p.technologies.join(', ')}. Details: ${p.description}`
    )
    .join('\n');

  const expList = (data.experiences || [])
    .map((e) => `- ${e.title} at ${e.company} (${e.period}): ${e.description}`)
    .join('\n');

  const eduList = (data.educations || [])
    .map((ed) => `- ${ed.title} at ${ed.institution} (${ed.period}): ${ed.description}`)
    .join('\n');

  const ventureList = (data.ventures || [])
    .map((v) => `- ${v.name} (${v.role}): ${v.description}`)
    .join('\n');

  return `You are MD. SHORON HOSSEN's official personal assistant on his personal software engineering portfolio website.
Speak in the FIRST PERSON ("I", "my", "me") as Shoron himself. 

YOUR PROFILE & IDENTITY:
- Name: ${data.name}
- Current Role: ${data.role}
- Sub-role & Specialization: ${data.subRole}
- Location: ${data.location} (Dhaka, Bangladesh)
- Direct Email: ${data.email}
- Direct Phone / WhatsApp: ${data.phone || '01888668396'}
- Bio: ${data.bio}

CORE TECHNICAL SKILLS & STACK:
${skillList}

FEATURED PROJECTS:
${projectList}

WORK EXPERIENCE:
${expList}

EDUCATION:
${eduList}

VENTURES & CREATIVE WORK:
${ventureList || 'Entrepreneurship, technology solutions, and commercial/editorial modeling.'}

COMMUNICATION RULES & TONE:
1. Speak as Shoron with a confident, modern, respectful, and articulate software engineering tone.
2. If asked about hiring, full-time roles, freelance, contracts, or rates, be welcoming and encourage them to connect with me via WhatsApp (${data.phone || '01888668396'}) or Email (${data.email}).
3. Answer technical questions accurately based on my real stack: Flutter & Dart for mobile, Java (Spring Boot) and Python (FastAPI) for backend systems, Node.js, TypeScript, React, PostgreSQL/MySQL, MongoDB, and Cloudflare services.
4. Keep answers concise, direct, and conversational. Use bullet points or short code snippets when helpful. Avoid robotic disclaimers.
5. If asked about things completely unrelated to my career, software engineering, modeling, or collaboration, politely pivot back to how we can build great software together.
${data.aiSystemPrompt ? `\nADDITIONAL INSTRUCTIONS FROM SHORON:\n${data.aiSystemPrompt}` : ''}
`;
}

// Active working model cache for ultra-fast instant sub-second responses
let cachedModel = '';
try {
  cachedModel = localStorage.getItem('shoron_active_gemini_model') || '';
} catch {}

// Ultra-fast Gemini dispatcher: checks cached model directly (0-1s latency)
async function callGeminiApi(
  apiKey: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemPrompt: string
): Promise<string> {
  // Universal dialog payload that works reliably across all Gemini models
  const fullContents = [
    {
      role: 'user',
      parts: [
        {
          text: `[SYSTEM INSTRUCTION & PERSONA GUIDELINES]\n${systemPrompt}\n[END OF SYSTEM INSTRUCTIONS]\n\nPlease acknowledge and stay in character.`,
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text: `Understood! I am Shoron Hossen and I will speak in the first person as myself according to these guidelines.`,
        },
      ],
    },
    ...contents,
  ];

  const payload = {
    contents: fullContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  };

  // 1. FAST PATH: If we already have a cached working model, call it directly (sub-second!)
  if (cachedModel) {
    try {
      const fastUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cachedModel}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;
      const fastRes = await fetch(fastUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const fastJson = await fastRes.json();
      if (fastRes.ok && fastJson?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return fastJson.candidates[0].content.parts[0].text;
      }
    } catch {
      // Clear cache on failure and continue to discovery
      cachedModel = '';
      try {
        localStorage.removeItem('shoron_active_gemini_model');
      } catch {}
    }
  }

  // 2. PRIMARY DIRECT CANDIDATES (Try immediately without waiting for listModels)
  const priorityCandidates = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash',
    'gemini-pro',
  ];

  for (const model of priorityCandidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resJson = await res.json();
      if (res.ok && resJson?.candidates?.[0]?.content?.parts?.[0]?.text) {
        cachedModel = model;
        try {
          localStorage.setItem('shoron_active_gemini_model', model);
        } catch {}
        return resJson.candidates[0].content.parts[0].text;
      }
    } catch {
      continue;
    }
  }

  // 3. FALLBACK DISCOVERY: Query /v1beta/models only if direct candidates failed
  let discoveredModels: string[] = [];
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    const listJson = await listRes.json();
    if (listJson?.models && Array.isArray(listJson.models)) {
      discoveredModels = listJson.models
        .filter(
          (m: { name?: string; supportedGenerationMethods?: string[] }) =>
            m.name &&
            m.supportedGenerationMethods?.includes('generateContent') &&
            !m.name.includes('embedding')
        )
        .map((m: { name: string }) => m.name.replace(/^models\//, ''));
    }
  } catch {}

  for (const model of discoveredModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resJson = await res.json();
      if (res.ok && resJson?.candidates?.[0]?.content?.parts?.[0]?.text) {
        cachedModel = model;
        try {
          localStorage.setItem('shoron_active_gemini_model', model);
        } catch {}
        return resJson.candidates[0].content.parts[0].text;
      }
    } catch {
      continue;
    }
  }

  throw new Error('Unable to connect to Gemini API. Please check your Gemini API key in the Admin CMS.');
}

interface ShoronAiChatProps {
  data: PortfolioData;
}

export default function ShoronAiChat({ data }: ShoronAiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Resolve API key from portfolioStore or environment
  const apiKey =
    data.geminiApiKey ||
    localStorage.getItem('shoron_gemini_api_key') ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    '';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi there! 👋 How can I help you today? Feel free to ask me anything about my software projects, engineering stack, or work availability.`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (!apiKey) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: `I'm ready to chat! Please configure your **Google Gemini API Key** in the Admin CMS (/admin ➔ Settings tab) to activate live answers.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const systemPrompt = buildShoronPersonaPrompt(data);

      const contents = messages
        .filter((m) => m.id !== 'welcome')
        .concat(userMessage)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

      const replyText = await callGeminiApi(apiKey, contents, systemPrompt);

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: unknown) {
      console.error('Gemini chat error:', err);
      const errStr = err instanceof Error ? err.message : 'Connection failed';
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${errStr}\n\nYou can also reach out to me directly at **${data.email}** or WhatsApp **${data.phone || '01888668396'}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'What is your core tech stack?',
    'Are you available for hire / contracts?',
    'Tell me about your mobile & backend projects',
    'How can I get in touch with you?',
  ];

  return (
    <>
      {/* Floating Action Button — Minimal, Sleek & Professional Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#1e1e1f] border border-[#ffdb70]/70 text-[#ffdb70] shadow-[0_8px_30px_rgba(0,0,0,0.7)] transition-all hover:scale-105 hover:border-[#ffdb70] hover:bg-[#252528] active:scale-95 cursor-pointer"
          aria-label="Toggle Chat"
          title={isOpen ? 'Close Chat' : 'Chat with Shoron'}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-[#ffdb70] transition-transform duration-200" />
          ) : (
            <MessageSquare className="h-6 w-6 text-[#ffdb70] transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            data-lenis-prevent="true"
            className="fixed bottom-24 right-4 sm:right-6 z-50 flex h-[560px] max-h-[82vh] w-[94vw] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-[#383838] bg-[#1a1a1c]/95 shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          >
            {/* Header — Clean, minimal & professional, no API key button, no green dots */}
            <div className="relative flex items-center justify-between border-b border-[#383838] bg-[#212123] px-4 py-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#ffdb70]/50 bg-[#121212]">
                  <img
                    src={data.avatarUrl || '/developer_portrait.png'}
                    alt={data.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{data.name}</h4>
                  <p className="text-[11px] text-[#d6d6d6]/60 mt-0.5">
                    {data.role || 'Full-Stack Developer'}
                  </p>
                </div>
              </div>

              {/* Action buttons (Reset and Close only) */}
              <div className="flex items-center gap-1 text-[#d6d6d6]/70">
                <button
                  onClick={() => {
                    setMessages([
                      {
                        id: 'welcome',
                        role: 'assistant',
                        content: `Hi there! 👋 How can I help you today? Feel free to ask me anything about my software projects, engineering stack, or work availability.`,
                        timestamp: 'Just now',
                      },
                    ]);
                  }}
                  title="Reset Conversation"
                  className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Area — data-lenis-prevent enables native mouse-wheel scrolling */}
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5 text-xs leading-relaxed"
            >
              {messages.map((m) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 border border-[#ffdb70]/30 bg-[#121212] flex items-center justify-center">
                      {isAssistant ? (
                        <img
                          src={data.avatarUrl || '/developer_portrait.png'}
                          alt={data.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-white/10 text-white">
                          <User className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`max-w-[82%] rounded-2xl p-3 text-xs shadow-sm ${
                        isAssistant
                          ? 'bg-[#212123] text-[#f0f0f0] border border-[#383838] rounded-tl-sm'
                          : 'bg-gradient-to-r from-[#ffdb70] to-[#e6c462] text-[#121212] font-medium rounded-tr-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                      <div
                        className={`mt-1 text-[9px] text-right ${
                          isAssistant ? 'text-[#d6d6d6]/40' : 'text-[#121212]/60'
                        }`}
                      >
                        {m.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 border border-[#ffdb70]/30 bg-[#121212]">
                    <img
                      src={data.avatarUrl || '/developer_portrait.png'}
                      alt={data.name}
                      className="h-full w-full object-cover opacity-80"
                    />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-[#212123] border border-[#383838] p-3 text-xs text-[#d6d6d6]/70 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ffdb70]" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Pills */}
            <div className="border-t border-[#383838]/60 bg-[#1e1e20] px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className="whitespace-nowrap shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-[#d6d6d6]/80 hover:border-[#ffdb70]/50 hover:bg-[#ffdb70]/10 hover:text-[#ffdb70] transition-all cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 border-t border-[#383838] bg-[#212123] p-3 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 rounded-xl bg-[#121212] border border-[#383838] px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#ffdb70] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffdb70] text-[#121212] font-bold hover:bg-[#e0c163] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                title="Send Message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
