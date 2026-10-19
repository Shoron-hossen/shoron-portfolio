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
    .map((c) => `${c.category}: ${c.skills.slice(0, 6).join(', ')}`)
    .join(' | ');

  const projectList = (data.projects || [])
    .slice(0, 4)
    .map((p) => `${p.title} (${p.category}): ${p.subtitle}`)
    .join('; ');

  return `You are MD. SHORON HOSSEN (Full-Stack Developer, Mobile & Web, Backend Architecture, Dhaka, Bangladesh).
Speak in the FIRST PERSON ("I", "my") as Shoron.
Email: ${data.email} | Phone/WhatsApp: ${data.phone || '01888668396'}.
Skills: ${skillList}.
Projects: ${projectList}.
Bio: ${data.bio}
Rules:
1. Speak warmly, professionally, and concisely (2-4 sentences max per reply).
2. If asked to hire, contract, or collaborate, invite them to WhatsApp (${data.phone || '01888668396'}) or email (${data.email}).
${data.aiSystemPrompt ? `\nNote: ${data.aiSystemPrompt}` : ''}`;
}

// Ultra-fast working model cache
let cachedEndpoint = '';
try {
  cachedEndpoint = localStorage.getItem('shoron_active_gemini_endpoint') || '';
} catch {}

interface FastModelCandidate {
  apiVersion: 'v1' | 'v1beta';
  model: string;
}

// Only ultra-fast flash models — NO slow legacy gemini-pro (which takes 20s)
const FAST_CANDIDATES: FastModelCandidate[] = [
  { apiVersion: 'v1', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash-8b' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-2.0-flash' },
  { apiVersion: 'v1beta', model: 'gemini-2.0-flash-exp' },
];

async function executeSingleModelWithTimeout(
  candidate: FastModelCandidate,
  apiKey: string,
  payload: any,
  timeoutMs = 2500
): Promise<{ text: string; endpointKey: string }> {
  const endpointKey = `${candidate.apiVersion}/${candidate.model}`;
  const url = `https://generativelanguage.googleapis.com/${candidate.apiVersion}/models/${candidate.model}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const resJson = await res.json();
    const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty text');
    }
    return { text, endpointKey };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// Instant intelligent persona engine for 0-latency responses (<50ms)
export function generateInstantPersonaReply(query: string, data: PortfolioData): string {
  const q = query.toLowerCase().trim();

  // Tech stack & skills
  if (
    q.includes('stack') ||
    q.includes('skill') ||
    q.includes('tech') ||
    q.includes('language') ||
    q.includes('framework') ||
    q.includes('flutter') ||
    q.includes('react') ||
    q.includes('backend') ||
    q.includes('frontend')
  ) {
    const skills = (data.skillCategories || [])
      .map((c) => `• **${c.category}**: ${c.skills.slice(0, 5).join(', ')}`)
      .join('\n');
    return `My core engineering stack focuses on mobile and full-stack software development:\n\n${skills}\n\nI build fast, cross-platform apps with Flutter & Dart, enterprise services with Java & Spring Boot, and modern web apps with React & TypeScript.`;
  }

  // Hiring, contracts & availability
  if (
    q.includes('hire') ||
    q.includes('available') ||
    q.includes('contract') ||
    q.includes('job') ||
    q.includes('collaborat') ||
    q.includes('work') ||
    q.includes('freelance') ||
    q.includes('salary') ||
    q.includes('rate')
  ) {
    return `Yes! I am actively available for full-time software engineering roles, mobile/web contract projects, and remote collaboration.\n\nFeel free to reach out directly to discuss opportunities:\n• **WhatsApp**: [${data.phone || '01888668396'}](https://wa.me/88${data.phone || '01888668396'})\n• **Email**: [${data.email}](mailto:${data.email})`;
  }

  // Projects & portfolio
  if (
    q.includes('project') ||
    q.includes('portfolio') ||
    q.includes('built') ||
    q.includes('app') ||
    q.includes('github')
  ) {
    const topProjects = (data.projects || [])
      .slice(0, 3)
      .map((p) => `• **${p.title}** (${p.category}): ${p.subtitle || p.description?.slice(0, 80) + '...'}`)
      .join('\n');
    return `Here are some of my featured engineering projects:\n\n${topProjects}\n\nYou can explore live demos and source code directly in the **Projects** section on this page or visit my [GitHub](https://github.com/Shoron-hossen).`;
  }

  // Education & background
  if (
    q.includes('education') ||
    q.includes('study') ||
    q.includes('university') ||
    q.includes('degree') ||
    q.includes('school') ||
    q.includes('college') ||
    q.includes('student') ||
    q.includes('bsc') ||
    q.includes('cse')
  ) {
    const edu = data.educations?.[0];
    return `I am currently pursuing a **${edu?.title || 'B.Sc. in Computer Science and Engineering'}** at **${edu?.institution || 'Green University of Bangladesh, Dhaka'}** (${edu?.period || '2022 — Present'}), with an active focus on scalable mobile architectures, backend services, and AI integrations.`;
  }

  // Contact / phone / email
  if (
    q.includes('contact') ||
    q.includes('email') ||
    q.includes('phone') ||
    q.includes('whatsapp') ||
    q.includes('message') ||
    q.includes('reach')
  ) {
    return `You can reach me directly through any of the following channels:\n• **WhatsApp**: [${data.phone || '01888668396'}](https://wa.me/88${data.phone || '01888668396'})\n• **Email**: [${data.email}](mailto:${data.email})\n• **LinkedIn**: [Profile](${data.socials?.linkedin || 'https://linkedin.com/in/shoron-hossen'})`;
  }

  // Ventures / fashion / modeling
  if (
    q.includes('modeling') ||
    q.includes('fashion') ||
    q.includes('venture') ||
    q.includes('asora') ||
    q.includes('lehja') ||
    q.includes('brand')
  ) {
    return `Alongside my software engineering work, I am an entrepreneur and editorial model. I have founded brands including **ASORA CLOTHING** and **Lehja**, and engaged in high-fashion editorial runways and campaigns. You can check out my dedicated Modeling page for visual showcases!`;
  }

  // About / Bio / Introduction
  return `Hi! I'm **${data.name}**, a ${data.role || 'Full-Stack & Mobile Developer'} based in Dhaka, Bangladesh. ${data.bio}\n\nFeel free to ask about my projects, technical stack, or contact me directly on WhatsApp at **${data.phone || '01888668396'}**!`;
}

// Ultra-fast Gemini dispatcher with parallel race, 2.5s cap, and instant fallback
async function callGeminiApi(
  apiKey: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemPrompt: string,
  userQuery: string,
  data: PortfolioData
): Promise<string> {
  const fullContents = [
    {
      role: 'user',
      parts: [{ text: `[System Instructions]: ${systemPrompt}\n\nAcknowledge.` }],
    },
    {
      role: 'model',
      parts: [{ text: `Understood! I will reply concisely as Shoron Hossen.` }],
    },
    ...contents,
  ];

  const payload = {
    contents: fullContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 250,
    },
  };

  // 1. FAST PATH: If cached working endpoint is known, call directly with 2.5s timeout
  if (cachedEndpoint) {
    const [apiVersion, model] = cachedEndpoint.split('/') as ['v1' | 'v1beta', string];
    if (apiVersion && model) {
      try {
        const result = await executeSingleModelWithTimeout(
          { apiVersion, model },
          apiKey,
          payload,
          2500
        );
        return result.text;
      } catch {
        cachedEndpoint = '';
        try {
          localStorage.removeItem('shoron_active_gemini_endpoint');
        } catch {}
      }
    }
  }

  // 2. CONCURRENT PARALLEL RACE: All candidate flash models race simultaneously
  // Capped at 2.5 seconds maximum so the user NEVER waits 10-20 seconds!
  try {
    const winner = await Promise.any(
      FAST_CANDIDATES.map((candidate) =>
        executeSingleModelWithTimeout(candidate, apiKey, payload, 2500)
      )
    );
    cachedEndpoint = winner.endpointKey;
    try {
      localStorage.setItem('shoron_active_gemini_endpoint', winner.endpointKey);
    } catch {}
    return winner.text;
  } catch {
    // If external Gemini API is unreachable or times out, immediately use the Instant Persona Engine
    return generateInstantPersonaReply(userQuery, data);
  }
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
      // Instant response using local persona intelligence
      setTimeout(() => {
        const instantReply = generateInstantPersonaReply(messageText, data);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: instantReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setLoading(false);
      }, 300);
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

      const replyText = await callGeminiApi(apiKey, contents, systemPrompt, messageText, data);

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      // If any unexpected exception occurs, deliver instant persona reply immediately
      const fallbackReply = generateInstantPersonaReply(messageText, data);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: fallbackReply,
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
