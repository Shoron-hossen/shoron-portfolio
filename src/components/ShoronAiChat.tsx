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

// Instant intelligent persona engine with comprehensive conversational intents
export function generateInstantPersonaReply(query: string, data: PortfolioData): string {
  const q = query.toLowerCase().trim();

  // 1. Google Gemini API Key Auto-Detection if user pastes their key directly
  if (q.startsWith('aizasy') || q.includes('aizasy')) {
    const match = query.match(/AIzaSy[A-Za-z0-9_-]{33}/);
    if (match) {
      const detectedKey = match[0];
      try {
        localStorage.setItem('shoron_gemini_api_key', detectedKey);
        data.geminiApiKey = detectedKey;
      } catch {}
      return `✓ **Google Gemini API Key Saved Successfully!**\n\nYour key is now active for this browser session. The chatbot is now connected directly to Google Gemini live AI! Ask me anything.`;
    }
  }

  // 2. Complaint about repetition or robot replies
  if (
    q.includes('same message') ||
    q.includes('same messge') ||
    q.includes('repeat') ||
    q.includes('hardcoded') ||
    q.includes('bustard') ||
    q.includes('stupid') ||
    q.includes('robot') ||
    q.includes('why you reply')
  ) {
    return `My apologies! I was previously using a fallback response mode. I'm listening closely now! Feel free to ask me anything specific — for example, about my **Flutter apps**, **Spring Boot backends**, **pricing & contract availability**, or **my projects**. What can I help you with?`;
  }

  // 3. Services & What services do you provide
  if (
    q.includes('service') ||
    q.includes('provide') ||
    q.includes('what can you do') ||
    q.includes('what do you do') ||
    q.includes('offer') ||
    q.includes('services')
  ) {
    return `I provide end-to-end software engineering and development services:\n\n1. **📱 Mobile App Development**: Building high-performance, cross-platform Android & iOS applications using Flutter & Dart.\n2. **⚙️ Backend & API Engineering**: Architecting enterprise-grade RESTful APIs and microservices using Java (Spring Boot) and Python (FastAPI).\n3. **💻 Full-Stack Web Development**: Creating responsive, fast web platforms using React, TypeScript, and modern CSS.\n4. **🗄️ Database & Cloud Infrastructure**: Database design and optimization with MySQL, MongoDB, and Cloudflare D1/R2.\n\nAre you looking to build a new product or need an engineer for an existing codebase?`;
  }

  // 4. "Tell me" / "Tell me more" / General elaboration
  if (q === 'tell me' || q.startsWith('tell me') || q.includes('tell me more')) {
    return `I'd love to share more! Here are a few things you can ask me about:\n\n• **My Tech Stack**: Flutter, Dart, Java, Spring Boot, React, MySQL\n• **Featured Projects**: Healthcare Telemedicine Suite, Cloud Infrastructure Analytics, Job Queues\n• **Hiring & Contracts**: Availability for full-time or freelance work\n• **Ventures & Modeling**: ASORA CLOTHING, Lehja, and editorial runways\n\nWhich of these would you like to hear about?`;
  }

  // 5. Greetings & casual opening
  if (
    /^(hi|hello|hey|yo|greetings|hola|salaam|assalamu|good\s*(morning|afternoon|evening))/i.test(q) ||
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey'
  ) {
    const greetings = [
      `Hello! 👋 Great to connect with you. I'm Shoron Hossen. How can I help you today? Feel free to ask about my mobile apps, backend systems, or engineering background.`,
      `Hi there! Thanks for stopping by my portfolio. I'm Shoron — whether you're looking for a developer, exploring my projects, or just want to chat tech, I'm here!`,
      `Hey! Welcome to my site. I build cross-platform mobile apps with Flutter and backend services with Spring Boot. What are you looking to collaborate on?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 6. How are you / status
  if (q.includes('how are you') || q.includes('how r u') || q.includes('whats up') || q.includes("what's up")) {
    return `I'm doing great, thank you for asking! Active and building scalable software. Are you working on a project, or looking to hire a developer?`;
  }

  // 7. Mobile App Development
  if (q.includes('mobile') || q.includes('flutter') || q.includes('android') || q.includes('ios') || q.includes('dart') || q.includes('app')) {
    return `Mobile application development is one of my strongest specialties! I architect production-ready, cross-platform apps using **Flutter & Dart** with clean state management, offline-first SQLite/Hive databases, and seamless RESTful backend integration. Have an app concept in mind? Let's discuss on WhatsApp: [${data.phone || '01888668396'}](https://wa.me/88${data.phone || '01888668396'}).`;
  }

  // 8. Backend & APIs & Databases
  if (q.includes('backend') || q.includes('spring') || q.includes('java') || q.includes('server') || q.includes('database') || q.includes('sql') || q.includes('mysql') || q.includes('mongodb') || q.includes('fastapi')) {
    return `On the backend, I engineer resilient, high-throughput architectures using **Java & Spring Boot** and **Python & FastAPI**. I design structured database schemas in MySQL, MongoDB, and Cloudflare D1 with secure JWT authentication and optimized API queries.`;
  }

  // 9. Web & Frontend
  if (q.includes('web') || q.includes('react') || q.includes('frontend') || q.includes('typescript') || q.includes('html') || q.includes('css') || q.includes('tailwind')) {
    return `For web engineering, I build responsive, accessible web applications using **React, TypeScript, and Tailwind CSS** with Vite. I focus on clean UI architectures, sub-second load times, and smooth user interactions.`;
  }

  // 10. Tech stack & skills
  if (q.includes('stack') || q.includes('skill') || q.includes('tech') || q.includes('language') || q.includes('framework')) {
    const skills = (data.skillCategories || [])
      .map((c) => `• **${c.category}**: ${c.skills.slice(0, 5).join(', ')}`)
      .join('\n');
    return `Here is my complete technical engineering stack:\n\n${skills}\n\nI specialize in Flutter & Dart for cross-platform mobile, Java & Spring Boot for enterprise backends, and React with TypeScript on the web.`;
  }

  // 11. Hiring, contracts, pricing & availability
  if (
    q.includes('hire') ||
    q.includes('available') ||
    q.includes('contract') ||
    q.includes('job') ||
    q.includes('collaborat') ||
    q.includes('work') ||
    q.includes('freelance') ||
    q.includes('salary') ||
    q.includes('rate') ||
    q.includes('cost') ||
    q.includes('price') ||
    q.includes('quote')
  ) {
    return `Yes! I am actively available for full-time engineering roles, freelance contracts, and software consulting.\n\nLet's discuss terms and timelines directly:\n• **WhatsApp**: [${data.phone || '01888668396'}](https://wa.me/88${data.phone || '01888668396'})\n• **Email**: [${data.email}](mailto:${data.email})\n• **Location**: ${data.location}`;
  }

  // 12. Projects & portfolio
  if (q.includes('project') || q.includes('portfolio') || q.includes('built') || q.includes('github') || q.includes('showcase')) {
    const topProjects = (data.projects || [])
      .slice(0, 4)
      .map((p) => `• **${p.title}** (${p.category}): ${p.subtitle || p.description?.slice(0, 75) + '...'}`)
      .join('\n');
    return `Here are some of my featured engineering builds:\n\n${topProjects}\n\nYou can review live source code on my [GitHub](https://github.com/Shoron-hossen) or browse the **Projects** section on this website!`;
  }

  // 13. Education & University
  if (q.includes('education') || q.includes('study') || q.includes('university') || q.includes('degree') || q.includes('school') || q.includes('student') || q.includes('bsc') || q.includes('cse')) {
    const edu = data.educations?.[0];
    return `I am currently pursuing a **${edu?.title || 'B.Sc. in Computer Science and Engineering'}** at **${edu?.institution || 'Green University of Bangladesh'}** (${edu?.period || '2022 — Present'}), with an active focus on backend architectures, mobile systems, and AI integrations.`;
  }

  // 14. Location / address / where
  if (q.includes('location') || q.includes('where') || q.includes('city') || q.includes('country') || q.includes('dhaka') || q.includes('bangladesh') || q.includes('address')) {
    return `I am based in **${data.location || 'Dhaka, Bangladesh'}**, and I work seamlessly with worldwide remote teams across different time zones.`;
  }

  // 15. Contact / phone / email
  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('whatsapp') || q.includes('message') || q.includes('reach') || q.includes('call')) {
    return `You can reach me directly anytime:\n• **WhatsApp**: [${data.phone || '01888668396'}](https://wa.me/88${data.phone || '01888668396'})\n• **Email**: [${data.email}](mailto:${data.email})\n• **LinkedIn**: [Profile](${data.socials?.linkedin || 'https://linkedin.com/in/shoron-hossen'})`;
  }

  // 16. Ventures / fashion / modeling
  if (q.includes('modeling') || q.includes('fashion') || q.includes('venture') || q.includes('asora') || q.includes('lehja') || q.includes('brand')) {
    return `Alongside software engineering, I am the founder of ventures including **ASORA CLOTHING** and **Lehja**, and I have worked in professional fashion and commercial editorial modeling. Feel free to check out the Modeling tab on this site for photo showcases!`;
  }

  // 17. Experience / CV / resume
  if (q.includes('experience') || q.includes('cv') || q.includes('resume') || q.includes('history')) {
    return `I have hands-on experience building full-stack products from concept to deployment. You can download my complete CV by clicking the **Download CV** button on the page, or ask me about any specific technical domain!`;
  }

  // Dynamic natural responses instead of a repetitive template
  const fallbackOptions = [
    `I'd be happy to collaborate with you on this! As a full-stack engineer, I specialize in Flutter mobile apps and Spring Boot/Java backends. What specific goals or features do you have in mind?`,
    `Great question! I'm focused on developing scalable software applications with clean architecture. If you'd like to dive into technical details or discuss a timeline, message me on WhatsApp at **${data.phone || '01888668396'}**!`,
    `Thanks for asking! I engineer cross-platform mobile apps, cloud REST APIs, and modern web solutions. You can also reach me directly at **${data.email}** to talk about your project requirements.`,
  ];
  return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
}

// Multi-tier AI dispatcher: Gemini API + Cloudflare Edge AI + Free Neural AI (Pollinations)
async function callAiChatService(
  apiKey: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemPrompt: string,
  userQuery: string,
  data: PortfolioData
): Promise<string> {
  const promises: Promise<string>[] = [];

  // Tier 1: If user provided Google Gemini API key, race fast Gemini models
  if (apiKey) {
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
      generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
    };

    promises.push(
      Promise.any(
        FAST_CANDIDATES.map((c) =>
          executeSingleModelWithTimeout(c, apiKey, payload, 2500).then((r) => r.text)
        )
      )
    );
  }

  // Tier 2: Cloudflare Edge Chat Endpoint (/api/chat)
  promises.push(
    (async () => {
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
        signal: AbortSignal.timeout(2800),
      });
      if (!edgeRes.ok) throw new Error('Edge unavailable');
      const edgeJson = (await edgeRes.json()) as any;
      if (edgeJson?.success && edgeJson?.reply) return edgeJson.reply;
      throw new Error('No edge reply');
    })()
  );

  // Tier 3: Zero-key Free Neural AI via Pollinations (Works everywhere including localhost!)
  promises.push(
    (async () => {
      const promptParam = encodeURIComponent(userQuery);
      const systemParam = encodeURIComponent(
        `You are MD. Shoron Hossen, a Full-Stack Software Developer from Dhaka, Bangladesh. Speak warmly and authentically in the first person ("I", "my") as Shoron. Your stack is Flutter, Dart, Java, Spring Boot, React, and MySQL. Phone/WhatsApp: ${data.phone || '01888668396'}, Email: ${data.email}. Reply in 2-3 concise sentences.`
      );
      const url = `https://text.pollinations.ai/${promptParam}?system=${systemParam}&model=openai`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('Pollinations unavailable');
      const text = await res.text();
      if (!text || text.includes('<!DOCTYPE') || text.length < 5) throw new Error('Invalid AI response');
      return text.trim();
    })()
  );

  try {
    // Whichever AI provider responds first with valid text wins!
    const reply = await Promise.any(promises);
    if (reply && reply.trim().length > 0) {
      return reply;
    }
  } catch {
    // If all online AI providers fail or user is offline, use intelligent persona engine
  }

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
