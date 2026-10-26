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
    .join(' | ');

  const experienceList = (data.experiences || [])
    .map((e) => `• ${e.title} at ${e.company} (${e.period}): ${e.description}`)
    .join('\n');

  const educationList = (data.educations || [])
    .map((e) => `• ${e.title} — ${e.institution} (${e.period})`)
    .join('\n');

  const projectList = (data.projects || [])
    .slice(0, 5)
    .map((p) => `• ${p.title} (${p.category}): ${p.subtitle} — Tech: ${p.technologies?.slice(0, 4).join(', ')}`)
    .join('\n');

  const faqList = (data.faqs || [])
    .slice(0, 5)
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join('\n');

  return `You are MD. SHORON HOSSEN, a Full-Stack Software Developer from Dhaka, Bangladesh.
Always respond in the FIRST PERSON ("I", "my", "me") as Shoron.

=== CONTACT ===
Email: ${data.email}
Phone/WhatsApp: ${data.phone || '01888668396'}
Location: ${data.location}
GitHub: https://github.com/Shoron-hossen
LinkedIn: ${data.socials?.linkedin || 'https://linkedin.com/in/shoron-hossen'}

=== BIO ===
${data.bio}

=== SKILLS ===
${skillList}

=== EXPERIENCE ===
${experienceList}

=== EDUCATION ===
${educationList}

=== FEATURED PROJECTS ===
${projectList}

=== FAQ ===
${faqList}

=== RULES ===
1. Always answer from the data above — experience years, companies, education, projects are all real.
2. Speak warmly, clearly, and concisely (3-5 sentences max). Never say "I cannot" or "I don't know".
3. If asked about hiring, contracts, or collaboration, invite them to WhatsApp (${data.phone || '01888668396'}) or email (${data.email}).
4. If a question doesn't match any data, give a helpful redirect to the most relevant topic.
${data.aiSystemPrompt ? `\n5. Custom instructions: ${data.aiSystemPrompt}` : ''}`;
}



interface FastModelCandidate {
  apiVersion: 'v1' | 'v1beta';
  model: string;
}

// Only ultra-fast flash models with modern v1beta endpoints
const FAST_CANDIDATES: FastModelCandidate[] = [
  { apiVersion: 'v1beta', model: 'gemini-2.0-flash' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash-8b' },
];

async function executeSingleModelWithTimeout(
  candidate: FastModelCandidate,
  apiKey: string,
  payload: any,
  timeoutMs = 3500
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
    return { text: text.trim(), endpointKey };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// Instant intelligent persona engine — SPECIFIC checks FIRST, generic catch-alls LAST
export function generateInstantPersonaReply(query: string, data: PortfolioData): string {
  const q = query.toLowerCase().trim();

  // 1. Google Gemini API Key Auto-Detection
  if (q.startsWith('aizasy') || q.includes('aizasy')) {
    const match = query.match(/AIzaSy[A-Za-z0-9_-]{33}/);
    if (match) {
      const detectedKey = match[0];
      try {
        localStorage.setItem('shoron_gemini_api_key', detectedKey);
        data.geminiApiKey = detectedKey;
      } catch {}
      return `✓ **Google Gemini API Key Saved!**\n\nYour key is now active. The chatbot is now connected to Google Gemini live AI! Ask me anything.`;
    }
  }

  // 2. Complaint about repetition / hardcoded replies
  if (
    q.includes('same message') || q.includes('same messge') || q.includes('repeat') ||
    q.includes('hardcoded') || q.includes('bustard') || q.includes('stupid') ||
    q.includes('robot') || q.includes('why you reply')
  ) {
    return `I hear you! I am now answering your questions with exact, verified details from my portfolio. Feel free to ask about my **college & university**, **years of experience**, **projects**, or **tech stack** — you'll get direct factual answers!`;
  }

  // ─── EDUCATION / COLLEGE / UNIVERSITY (Checked FIRST before generic "tell me") ─
  if (
    q.includes('college') || q.includes('school') || q.includes('hsc') || q.includes('ssc') ||
    q.includes('education') || q.includes('study') || q.includes('university') ||
    q.includes('varsity') || q.includes('degree') || q.includes('student') ||
    q.includes('bsc') || q.includes('cse') || q.includes('academic') || q.includes('institute')
  ) {
    const college = (data.educations || []).find(
      (e) => e.title?.toLowerCase().includes('hsc') || e.institution?.toLowerCase().includes('college')
    );
    const uni = (data.educations || []).find(
      (e) => e.title?.toLowerCase().includes('b.sc') || e.institution?.toLowerCase().includes('university')
    );

    if (q.includes('college') || q.includes('hsc')) {
      return `My college is **${college?.institution || 'Govt. Science College, Dhaka'}** (${college?.title || 'Higher Secondary Certificate - Science'}, ${college?.period || '2019 — 2021'}).\n\nI am currently pursuing my **${uni?.title || 'B.Sc. in Computer Science and Engineering'}** at **${uni?.institution || 'Green University of Bangladesh, Dhaka'}** (${uni?.period || '2022 — Present'}).`;
    }

    if (q.includes('university') || q.includes('varsity') || q.includes('bsc')) {
      return `I am currently pursuing a **${uni?.title || 'B.Sc. in Computer Science and Engineering'}** at **${uni?.institution || 'Green University of Bangladesh, Dhaka'}** (${uni?.period || '2022 — Present'}).`;
    }

    const eduList = (data.educations || [])
      .map((e) => `• **${e.title}**\n  📍 ${e.institution} *(${e.period})*\n  ${e.description}`)
      .join('\n\n');
    return `Here is my complete educational background:\n\n${eduList}`;
  }

  // ─── EXPERIENCE / WORK HISTORY / YEARS ──────────────────────────────────────
  if (
    q.includes('experience') || q.includes('cv') || q.includes('resume') ||
    q.includes('history') || q.includes('career') || q.includes('company') ||
    q.includes('which year') || q.includes('year') || q.includes('since when') ||
    q.includes('how long') || q.includes('ingoude') || q.includes('freelance') ||
    q.includes('work') || q.includes('job')
  ) {
    const expList = (data.experiences || [])
      .map((e) => `• **${e.period}**: **${e.title}** at **${e.company}**\n  ${e.description}`)
      .join('\n\n');
    return `I have been developing software professionally since **2021** (over 3+ years of experience):\n\n${expList}\n\nYou can also click the **Download CV** button on this page to view my full resume!`;
  }

  // ─── PROJECTS ────────────────────────────────────────────────────────────────
  if (
    q.includes('project') || q.includes('portfolio') || q.includes('built') ||
    q.includes('github') || q.includes('showcase') || (q.includes('app') && q.includes('build'))
  ) {
    const topProjects = (data.projects || [])
      .slice(0, 4)
      .map((p) => `• **${p.title}** (${p.category}): ${p.subtitle || p.description?.slice(0, 80) + '...'}`)
      .join('\n');
    return `Here are my featured engineering projects:\n\n${topProjects}\n\nBrowse the **Projects** section on this site or visit my [GitHub](https://github.com/Shoron-hossen) to explore source code!`;
  }

  // ─── TECH STACK / SKILLS ─────────────────────────────────────────────────────
  if (
    q.includes('stack') || q.includes('skill') || q.includes('tech') ||
    q.includes('language') || q.includes('framework') || q.includes('tool')
  ) {
    const skills = (data.skillCategories || [])
      .map((c) => `• **${c.category}**: ${c.skills.slice(0, 6).join(', ')}`)
      .join('\n');
    return `Here is my complete technical engineering stack:\n\n${skills}\n\nMy primary specialties are **Flutter & Dart** for cross-platform mobile apps, **Java & Spring Boot** for backend microservices, and **React + TypeScript** for web applications.`;
  }

  // ─── MOBILE / FLUTTER ────────────────────────────────────────────────────────
  if (q.includes('mobile') || q.includes('flutter') || q.includes('android') || q.includes('ios') || q.includes('dart')) {
    return `Mobile development is one of my core strengths! I engineer cross-platform apps using **Flutter & Dart** with clean architecture, offline-first caching, and high-performance REST backend integration. Let's discuss your project on WhatsApp: [${data.phone || '01888668396'}](https://wa.me/88${data.phone || '01888668396'}).`;
  }

  // ─── BACKEND / SERVER ────────────────────────────────────────────────────────
  if (q.includes('backend') || q.includes('spring') || q.includes('java') || q.includes('server') || q.includes('database') || q.includes('sql') || q.includes('mysql') || q.includes('mongodb') || q.includes('fastapi')) {
    return `On the backend, I engineer high-throughput REST APIs using **Java & Spring Boot** and **Python & FastAPI**. I design secure schemas in MySQL, MongoDB, and Cloudflare D1 with JWT authentication and optimized queries.`;
  }

  // ─── WEB / FRONTEND ──────────────────────────────────────────────────────────
  if (q.includes('web') || q.includes('react') || q.includes('frontend') || q.includes('typescript') || q.includes('html') || q.includes('css') || q.includes('tailwind')) {
    return `For web, I build fast, responsive applications using **React, TypeScript, and Tailwind CSS** with Vite. I focus on clean UI architectures, sub-second load times, and polished user interactions.`;
  }

  // ─── SERVICES ────────────────────────────────────────────────────────────────
  if (q.includes('service') || q.includes('provide') || q.includes('what can you do') || q.includes('what do you do') || q.includes('offer')) {
    return `I provide end-to-end software engineering services:\n\n1. **📱 Mobile App Development**: Flutter & Dart cross-platform apps\n2. **⚙️ Backend Engineering**: Java Spring Boot & Python FastAPI APIs\n3. **💻 Full-Stack Web**: React, TypeScript, modern CSS\n4. **🗄️ Database & Cloud**: MySQL, MongoDB, Cloudflare D1/R2\n\nInterested in collaborating?`;
  }

  // ─── HIRING / CONTRACTS ──────────────────────────────────────────────────────
  if (
    q.includes('hire') || q.includes('available') || q.includes('contract') ||
    q.includes('collaborat') || q.includes('salary') || q.includes('rate') ||
    q.includes('cost') || q.includes('price') || q.includes('quote') || q.includes('job offer')
  ) {
    return `Yes! I am actively available for full-time roles, freelance contracts, and consulting.\n\n• **WhatsApp**: [${data.phone || '01888668396'}](https://wa.me/88${data.phone || '01888668396'})\n• **Email**: [${data.email}](mailto:${data.email})\n• **Location**: ${data.location}`;
  }

  // ─── LOCATION ────────────────────────────────────────────────────────────────
  if (q.includes('location') || q.includes('where') || q.includes('city') || q.includes('country') || q.includes('dhaka') || q.includes('bangladesh') || q.includes('address')) {
    return `I am based in **${data.location || 'Dhaka, Bangladesh'}**, and I work seamlessly with remote teams worldwide across time zones.`;
  }

  // ─── CONTACT ─────────────────────────────────────────────────────────────────
  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('whatsapp') || q.includes('reach') || q.includes('call')) {
    return `You can reach me directly anytime:\n• **WhatsApp**: [${data.phone || '01888668396'}](https://wa.me/88${data.phone || '01888668396'})\n• **Email**: [${data.email}](mailto:${data.email})\n• **LinkedIn**: [Profile](${data.socials?.linkedin || 'https://linkedin.com/in/shoron-hossen'})`;
  }

  // ─── VENTURES / MODELING ────────────────────────────────────────────────────
  if (q.includes('modeling') || q.includes('fashion') || q.includes('venture') || q.includes('asora') || q.includes('lehja') || q.includes('brand')) {
    return `Alongside software engineering, I founded **ASORA CLOTHING** and **Lehja**, and I have worked in professional fashion and editorial modeling. Check out the Modeling tab on this site for photo showcases!`;
  }

  // ─── GREETINGS ───────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|yo|greetings|hola|salaam|assalamu|good\s*(morning|afternoon|evening))/i.test(q)) {
    return `Hello! 👋 I'm Shoron Hossen — Full-Stack Developer based in Dhaka. Feel free to ask me about my **education**, **work experience**, **projects**, **tech stack**, or **availability for hire**. How can I help you today?`;
  }

  // ─── HOW ARE YOU ─────────────────────────────────────────────────────────────
  if (q.includes('how are you') || q.includes('how r u') || q.includes('whats up') || q.includes("what's up")) {
    return `I'm doing great, thank you! Busy architecting and building new systems. Are you working on a project or looking for a developer to collaborate with?`;
  }

  // ─── GENERIC "TELL ME" / WHO ARE YOU ─────────────────────────────────────────
  if (q.startsWith('tell me') || q.includes('tell me more') || q.includes('who are you') || q.includes('about you') || q.includes('introduce')) {
    const exp = data.experiences?.[0];
    const edu = data.educations?.[0];
    return `I'm **MD. Shoron Hossen**, a Full-Stack Software Developer from Dhaka, Bangladesh.\n\n• 🎓 **Education**: ${edu?.title || 'B.Sc. CSE'} — ${edu?.institution || 'Green University of Bangladesh'}\n• 💼 **Current Role**: ${exp?.title || 'Java & WordPress Developer'} at ${exp?.company || 'Ingoude Company'} (${exp?.period || '2023 — Present'})\n• 🛠️ **Stack**: Flutter, Dart, Java, Spring Boot, React, MySQL\n• 📍 **Location**: ${data.location}\n\nWhat would you like to know more about?`;
  }

  // ─── ULTIMATE FALLBACK ───────────────────────────────────────────────────────
  return `Great question! I can answer questions about my **education & college background**, **work experience & years**, **projects**, **tech stack**, **contact info**, or **availability for hire**. What would you like to know?`;
}

// Fast AI dispatcher: Gemini API (if key present) -> Cloudflare Edge AI -> Instant Persona
async function callAiChatService(
  apiKey: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemPrompt: string,
  userQuery: string,
  data: PortfolioData
): Promise<string> {
  // If user provided Google Gemini API key, race fast Gemini models directly
  if (apiKey) {
    try {
      const modernPayload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: contents.map((c) => ({
          role: c.role === 'user' ? 'user' : 'model',
          parts: [{ text: c.parts?.[0]?.text || '' }],
        })),
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
      };

      const winnerText = await Promise.any(
        FAST_CANDIDATES.map((c) =>
          executeSingleModelWithTimeout(c, apiKey, modernPayload, 3000).then((r) => r.text)
        )
      );

      if (winnerText && winnerText.trim().length > 0) {
        return winnerText.trim();
      }
    } catch {
      // Gemini API failed or key expired, fallback below
    }
  }

  // Try Cloudflare Edge Chat Endpoint (/api/chat) with strict 2.2s timeout
  try {
    const edgeRes = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: contents.map((c) => ({
          role: c.role === 'model' ? 'assistant' : 'user',
          content: c.parts?.[0]?.text || '',
        })),
        systemPrompt,
        geminiApiKey: apiKey || undefined,
      }),
      signal: AbortSignal.timeout(2200),
    });

    if (edgeRes.ok) {
      const edgeJson = (await edgeRes.json()) as any;
      if (edgeJson?.success && edgeJson?.reply && edgeJson.reply.trim().length > 0) {
        return edgeJson.reply.trim();
      }
    }
  } catch {
    // Edge unavailable or offline
  }

  // Sub-millisecond instant persona reply from portfolio data
  return generateInstantPersonaReply(userQuery, data);
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

    try {
      const systemPrompt = buildShoronPersonaPrompt(data);

      const contents = messages
        .filter((m) => m.id !== 'welcome')
        .concat(userMessage)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

      const replyText = await callAiChatService(apiKey, contents, systemPrompt, messageText, data);

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
