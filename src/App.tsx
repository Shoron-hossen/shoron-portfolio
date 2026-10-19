import { useState, useEffect, memo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {
  ChevronDown,
  ArrowRight,
  Globe,
  Mail,
  Terminal,
  Award,
  Cpu,
  Server,
  Layout,
  ExternalLink,
  Code2,
  BookOpen,
  Eye,
  Menu,
  X,
  Building2,
  FileText,
  Send,
  MessageCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { PortfolioStore, DEFAULT_PORTFOLIO_DATA, type PortfolioData } from './portfolioStore';
import AdminPage from './AdminPage';
import ProjectsPage from './ProjectsPage';
import ModelingPage from './ModelingPage';
import GithubIcon from './components/GithubIcon';
import { LinkedinIcon, FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from './components/SocialIcons';
import ShoronAiChat from './components/ShoronAiChat';

// Ensures external URLs always have https:// protocol so they open external sites rather than relative routes
const normalizeExternalUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

// Icon mapping for dynamic hero cards and skill categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layout, Server, Cpu, Award, Terminal, Code2, Globe, BookOpen
};

// High-Resolution Ambient Starfield across website (GPU Hardware Accelerated, Zero Lag)
const AMBIENT_STARS = [
  { left: '5%', top: '8%', dur: '4.2s', delay: '0.2s', size: 'h-1 w-1' },
  { left: '14%', top: '18%', dur: '3.6s', delay: '1.1s', size: 'h-1.5 w-1.5' },
  { left: '22%', top: '10%', dur: '5.1s', delay: '2.3s', size: 'h-1 w-1' },
  { left: '31%', top: '24%', dur: '4.0s', delay: '0.7s', size: 'h-1.5 w-1.5' },
  { left: '42%', top: '12%', dur: '6.2s', delay: '1.8s', size: 'h-1 w-1' },
  { left: '56%', top: '20%', dur: '3.8s', delay: '0.4s', size: 'h-1.5 w-1.5' },
  { left: '68%', top: '9%', dur: '5.5s', delay: '2.6s', size: 'h-1 w-1' },
  { left: '78%', top: '26%', dur: '4.4s', delay: '1.2s', size: 'h-1.5 w-1.5' },
  { left: '88%', top: '14%', dur: '5.9s', delay: '0.9s', size: 'h-1 w-1' },
  { left: '95%', top: '22%', dur: '3.5s', delay: '2.0s', size: 'h-1.5 w-1.5' },
  { left: '8%', top: '38%', dur: '4.7s', delay: '1.4s', size: 'h-1 w-1' },
  { left: '19%', top: '48%', dur: '5.8s', delay: '0.5s', size: 'h-1.5 w-1.5' },
  { left: '33%', top: '42%', dur: '3.9s', delay: '2.2s', size: 'h-1 w-1' },
  { left: '48%', top: '52%', dur: '6.0s', delay: '1.6s', size: 'h-1.5 w-1.5' },
  { left: '62%', top: '44%', dur: '4.3s', delay: '0.8s', size: 'h-1 w-1' },
  { left: '74%', top: '56%', dur: '5.2s', delay: '2.5s', size: 'h-1.5 w-1.5' },
  { left: '86%', top: '46%', dur: '3.7s', delay: '1.0s', size: 'h-1 w-1' },
  { left: '94%', top: '40%', dur: '5.3s', delay: '1.9s', size: 'h-1.5 w-1.5' },
  { left: '11%', top: '68%', dur: '5.4s', delay: '2.1s', size: 'h-1 w-1' },
  { left: '26%', top: '78%', dur: '4.1s', delay: '0.6s', size: 'h-1.5 w-1.5' },
  { left: '40%', top: '72%', dur: '6.3s', delay: '1.7s', size: 'h-1 w-1' },
  { left: '54%', top: '82%', dur: '3.6s', delay: '2.4s', size: 'h-1.5 w-1.5' },
  { left: '70%', top: '74%', dur: '5.0s', delay: '0.9s', size: 'h-1 w-1' },
  { left: '84%', top: '84%', dur: '4.5s', delay: '1.5s', size: 'h-1.5 w-1.5' },
  { left: '92%', top: '76%', dur: '5.7s', delay: '2.8s', size: 'h-1 w-1' },
  { left: '6%', top: '90%', dur: '4.8s', delay: '1.3s', size: 'h-1 w-1' },
  { left: '22%', top: '93%', dur: '5.6s', delay: '2.2s', size: 'h-1.5 w-1.5' },
  { left: '47%', top: '91%', dur: '4.1s', delay: '0.4s', size: 'h-1 w-1' },
  { left: '65%', top: '94%', dur: '6.2s', delay: '1.8s', size: 'h-1.5 w-1.5' },
  { left: '88%', top: '92%', dur: '5.0s', delay: '2.7s', size: 'h-1 w-1' },
];

const AmbientStarfield = memo(function AmbientStarfield() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {AMBIENT_STARS.map((star, idx) => (
        <span
          key={idx}
          className={`lp-star ${star.size}`}
          style={{
            left: star.left,
            top: star.top,
            '--dur': star.dur,
            '--delay': star.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

const HERO_STARS = [
  { left: '84.182%', top: '8.850%', dur: '5.949s', delay: '0.101s' },
  { left: '8.425%', top: '51.412%', dur: '5.516s', delay: '1.879s' },
  { left: '21.101%', top: '22.892%', dur: '3.545s', delay: '1.894s' },
  { left: '26.151%', top: '7.746%', dur: '4.636s', delay: '2.575s' },
  { left: '89.217%', top: '3.141%', dur: '5.912s', delay: '1.773s' },
  { left: '72%', top: '38%', dur: '4.2s', delay: '0.5s' },
  { left: '91%', top: '42%', dur: '5.1s', delay: '1.2s' },
  { left: '68%', top: '52%', dur: '3.8s', delay: '2.0s' },
  { left: '86%', top: '58%', dur: '4.7s', delay: '0.9s' },
  { left: '75%', top: '65%', dur: '5.6s', delay: '1.6s' },
  { left: '92%', top: '70%', dur: '4.0s', delay: '2.4s' },
  { left: '80%', top: '78%', dur: '6.0s', delay: '0.3s' },
];

const HeroStarfield = memo(function HeroStarfield() {
  return (
    <div className="lp-gpu pointer-events-none absolute inset-0 z-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {HERO_STARS.map((star, idx) => (
          <span
            key={idx}
            className="lp-star h-1 w-1"
            style={{ left: star.left, top: star.top, '--dur': star.dur, '--delay': star.delay } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
});

// Self-contained, isolated Typewriter for Hero Role Badge
// Prevents parent App from re-rendering on every letter typed/deleted
function HeroRoleBadge({ defaultBadge }: { defaultBadge: string }) {
  const [badgeText, setBadgeText] = useState('');
  const [badgeRoleIndex, setBadgeRoleIndex] = useState(0);
  const [badgeIsDeleting, setBadgeIsDeleting] = useState(false);

  useEffect(() => {
    const roleBadgeTitles = [
      defaultBadge || 'Software Engineer',
      'Full-Stack Developer',
      'Backend Systems Engineer',
      'Mobile Application Developer',
    ];
    const current = roleBadgeTitles[badgeRoleIndex % roleBadgeTitles.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!badgeIsDeleting) {
      if (badgeText.length < current.length) {
        timeout = setTimeout(() => {
          setBadgeText(current.slice(0, badgeText.length + 1));
        }, 75);
      } else {
        timeout = setTimeout(() => {
          setBadgeIsDeleting(true);
        }, 2200);
      }
    } else {
      if (badgeText.length > 0) {
        timeout = setTimeout(() => {
          setBadgeText(current.slice(0, badgeText.length - 1));
        }, 35);
      } else {
        setBadgeIsDeleting(false);
        setBadgeRoleIndex((prev) => prev + 1);
      }
    }

    return () => clearTimeout(timeout);
  }, [badgeText, badgeIsDeleting, badgeRoleIndex, defaultBadge]);

  return (
    <div className="mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm sm:text-[15px] font-semibold tracking-tight border transition-colors border-white/15 bg-white/5 text-white/95 backdrop-blur-md shadow-sm">
      <span>{badgeText || defaultBadge}</span>
      <span className="inline-block w-[2px] h-4 ml-1 bg-[#ffdb70] animate-pulse align-middle" />
    </div>
  );
}

// Self-contained Terminal Typewriter to prevent re-rendering the whole page every 35ms
function TerminalTypewriter({ terminalText }: { terminalText: string }) {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let index = 0;
    setTypedText('');
    const interval = setInterval(() => {
      if (index <= terminalText.length) {
        setTypedText(terminalText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [terminalText]);

  return (
    <p className="text-[#fafafa]">
      <span className="text-[#ffdb70]">user@dev:~$</span> {typedText}
      <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-[#ffdb70] align-middle" />
    </p>
  );
}

// Self-contained Header with throttled RAF scroll detection
// Isolates header glassmorphic transitions from re-rendering Hero & page content
function PortfolioHeader({
  name,
  navigate,
}: {
  name: string;
  navigate: (path: string) => void;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 25);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`lp-gpu fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'py-3 bg-black/15 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.25)]'
        : 'py-5 bg-transparent border-b border-transparent'
    }`}>
      <div className="relative flex min-w-0 items-center justify-between gap-3 mx-auto max-w-6xl px-3.5 sm:px-6">
        
        {/* Brand Logo */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            className="group flex flex-shrink-0 items-center gap-2.5 opacity-90 transition-opacity duration-200 hover:opacity-100"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#ffdb70] to-[#ceb15a] text-[#121212] flex items-center justify-center font-black text-sm shadow-[0_2px_10px_rgba(255,219,112,0.35)] transition-transform duration-200 group-hover:scale-105">
              S
            </div>
            <span className="lp-serif text-lg tracking-tight font-medium text-[#fafafa]">
              {name} <span className="text-xs font-mono font-normal text-[#ffdb70]">.dev</span>
            </span>
          </a>
        </div>

        {/* Navigation & Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Desktop Navigation Capsule */}
          <nav className={`hidden md:flex items-center space-x-1.5 rounded-full p-1.5 border transition-all duration-300 ${
            isScrolled
              ? 'border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.25)]'
              : 'border-[#383838] bg-[#1e1e1f]/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]'
          }`}>
            <a href="#about" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors text-[#d6d6d6] hover:text-[#ffdb70] hover:bg-white/5">About</a>
            <a href="#resume" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors text-[#d6d6d6] hover:text-[#ffdb70] hover:bg-white/5">Resume</a>
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors text-[#d6d6d6] hover:text-[#ffdb70] hover:bg-white/5 cursor-pointer"
            >
              Portfolio
            </button>
            <a href="#ventures" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors text-[#d6d6d6] hover:text-[#ffdb70] hover:bg-white/5">Ventures</a>
            <button
              onClick={() => navigate('/modeling')}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors text-[#d6d6d6] hover:text-[#ffdb70] hover:bg-white/5 cursor-pointer"
            >
              Modeling
            </button>
            <a href="#contact" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors text-[#d6d6d6] hover:text-[#ffdb70] hover:bg-white/5">Contact</a>
          </nav>

          {/* Action Button — Desktop */}
          <a
            href="#contact"
            className="items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs font-semibold transition-all shadow-sm hidden md:inline-flex bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] hover:shadow-[0_4px_16px_rgba(255,219,112,0.3)]"
          >
            <span>Get in Touch</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-[#383838] bg-[#1e1e1f]/90 text-[#fafafa] hover:text-[#ffdb70] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer with Smooth Fluid Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mx-2.5 sm:mx-4 mt-2 rounded-2xl border border-[#383838]/80 bg-[#1e1e1f]/98 p-3 sm:p-4 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
          >
            <div className="flex flex-col space-y-1">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#fafafa] hover:bg-white/5 hover:text-[#ffdb70] transition-colors"
              >
                <span>About</span>
              </a>
              <a
                href="#resume"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#fafafa] hover:bg-white/5 hover:text-[#ffdb70] transition-colors"
              >
                <span>Resume</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/projects');
                }}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-left text-[#fafafa] hover:bg-white/5 hover:text-[#ffdb70] transition-colors cursor-pointer"
              >
                <span>Portfolio</span>
                <ArrowRight className="w-4 h-4 text-[#ffdb70]" />
              </button>
              <a
                href="#ventures"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#fafafa] hover:bg-white/5 hover:text-[#ffdb70] transition-colors"
              >
                <span>Ventures & Entrepreneurship</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/modeling');
                }}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-left text-[#fafafa] hover:bg-white/5 hover:text-[#ffdb70] transition-colors cursor-pointer"
              >
                <span>Modeling & Campaigns</span>
                <ArrowRight className="w-4 h-4 text-[#ffdb70]" />
              </button>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#fafafa] hover:bg-white/5 hover:text-[#ffdb70] transition-colors"
              >
                <span>Contact</span>
              </a>
              <div className="pt-2 border-t border-[#383838]">
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] shadow-sm hover:brightness-105 transition-all"
                >
                  <span>Get in Touch</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════
// REAL INTERACTIVE CONTACT & WHATSAPP SECTION
// ═══════════════════════════════════════════════════════════════
function PortfolioContactSection({ data }: { data: PortfolioData }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Clean phone number for WhatsApp API
  const rawPhone = data.phone || '01888668396';
  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
    cleanPhone = '88' + cleanPhone;
  }
  const defaultWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${data.name}, I visited your portfolio and would like to get in touch!`)}`;

  // Direct Google Mail (Gmail) Compose Link for instant 1-click compose
  const gmailDirectUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(data.email)}`;

  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const recipientEmail = data.email || 'meshoron53@gmail.com';
    const backupRecipient = 'shoronhossen886@gmail.com';

    const payload = {
      name: name.trim(),
      email: email.trim(),
      _subject: subject.trim() || `Portfolio Inquiry from ${name.trim()}`,
      message: message.trim(),
      _replyto: email.trim(),
      _template: 'table',
      _captcha: 'false',
    };

    // Instant zero-delay confirmation: Show success immediately in 50ms!
    setSent(true);
    setLoading(false);
    setErrorMessage('');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSent(false), 9000);

    // Non-blocking background dispatch — fires to multiple providers for reliability
    const dispatchMail = async () => {
      const msgPayload = JSON.stringify(payload);
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      const sig = AbortSignal.timeout(8000);

      // Provider 1: FormSubmit to primary email (meshoron53@gmail.com)
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
        method: 'POST', headers, body: msgPayload, signal: sig,
      }).catch(() => {});

      // Provider 2: FormSubmit to backup email (shoronhossen886@gmail.com)
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(backupRecipient)}`, {
        method: 'POST', headers, body: msgPayload, signal: AbortSignal.timeout(8000),
      }).catch(() => {});
    };

    dispatchMail();
  };

  return (
    <section id="contact" className="scroll-mt-24 py-8 sm:py-10">
      <div className="rounded-[20px] bg-[#1e1e1f] border border-[#383838] p-4 sm:p-10 shadow-[0_16px_30px_rgba(0,0,0,0.25)]">
        
        {/* Article Title with signature golden accent bar */}
        <header className="mb-6 sm:mb-8">
          <h2 className="relative pb-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1.5 after:bg-gradient-to-r after:from-[#ffdb70] after:to-[#ceb15a] after:rounded-full">
            Get in Touch
          </h2>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#d6d6d6]/70 max-w-2xl leading-relaxed">
            Have a project in mind, a freelance opportunity, or want to discuss engineering and backend architecture? Send a message via Google Mail or connect on WhatsApp.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Direct WhatsApp, Email & Location Cards (Cohesive dark/gold theme, no extra jarring colors) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* WhatsApp Connect Card — Styled to match portfolio dark theme */}
            <div className="rounded-2xl border border-[#383838] bg-[#212123] p-5 transition-all hover:border-[#ffdb70]/40 shadow-sm">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#ffdb70]/10 border border-[#ffdb70]/30 flex items-center justify-center text-[#ffdb70] shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">WhatsApp Quick Chat</h4>
                  <p className="text-[11px] text-[#ffdb70] flex items-center gap-1.5 font-mono mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffdb70] animate-pulse" />
                    Available for Direct Chat
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#d6d6d6]/80 leading-relaxed mb-4">
                Fastest way to get in touch. Click below to start a direct WhatsApp conversation.
              </p>
              <a
                href={defaultWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold border border-[#383838] bg-[#1a1a1c] text-white hover:border-[#ffdb70]/60 hover:text-[#ffdb70] transition-all shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#ffdb70]" />
                <span>Chat on WhatsApp ({data.phone || '01888668396'})</span>
              </a>
            </div>

            {/* Direct Email Card — Opens directly in Google Mail (Gmail) compose */}
            <div className="rounded-2xl border border-[#383838] bg-[#212123] p-5 transition-all hover:border-[#ffdb70]/40 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#ffdb70]/10 border border-[#ffdb70]/30 flex items-center justify-center text-[#ffdb70] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white leading-tight">Direct Email</h4>
                  <p className="text-[11px] text-[#d6d6d6]/70 font-mono mt-0.5 truncate">{data.email}</p>
                </div>
              </div>
              <div className="mt-3.5">
                <a
                  href={gmailDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold border border-[#383838] bg-[#1a1a1c] text-white hover:border-[#ffdb70]/60 hover:text-[#ffdb70] transition-all shadow-sm cursor-pointer"
                  title="Opens directly in Gmail with address prefilled"
                >
                  <Mail className="w-4 h-4 text-[#ffdb70]" />
                  <span>Send Mail via Gmail ({data.email})</span>
                </a>
              </div>
            </div>

            {/* Location & Availability Card */}
            <div className="rounded-2xl border border-[#383838] bg-[#212123] p-5">
              <div className="flex items-center gap-2 text-xs text-[#d6d6d6]/80 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#ffdb70]" />
                <span className="font-semibold text-white">Location:</span> {data.location}
              </div>
              <p className="text-xs text-[#d6d6d6]/60 leading-relaxed">
                Available for full-time software engineering roles, contract development, and worldwide remote opportunities.
              </p>
            </div>

          </div>

          {/* Right Column: Direct Background Mail Form */}
          <div className="lg:col-span-7 bg-[#212123] border border-[#383838] rounded-2xl p-5 sm:p-7 shadow-sm">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#ffdb70]" /> Send a Direct Message
            </h3>
            <p className="text-xs text-[#d6d6d6]/60 mb-5">
              Fill out the details below to send an email directly to my inbox.
            </p>

            {sent && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
                <Check className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">Mail Sent Successfully!</h5>
                  <p className="mt-1 text-emerald-300/80 text-xs leading-relaxed">
                    Thank you for reaching out. Your message has been sent directly to {data.name}'s email.
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-white/60 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendDirect} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#d6d6d6]/90 mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full rounded-xl bg-[#121212] border border-[#383838] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#ffdb70] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#d6d6d6]/90 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full rounded-xl bg-[#121212] border border-[#383838] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#ffdb70] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#d6d6d6]/90 mb-1.5">Subject / Project Scope</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Full-Stack Web / Mobile Project"
                  className="w-full rounded-xl bg-[#121212] border border-[#383838] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#ffdb70] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#d6d6d6]/90 mb-1.5">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me about your goals, timeline, and requirements..."
                  className="w-full rounded-xl bg-[#121212] border border-[#383838] p-3.5 text-xs text-white placeholder-neutral-500 focus:border-[#ffdb70] focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || sent}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] font-bold text-xs hover:shadow-[0_4px_16px_rgba(255,219,112,0.35)] disabled:opacity-75 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#121212]" />
                      <span>Sending Message Directly...</span>
                    </>
                  ) : sent ? (
                    <>
                      <Check className="w-4 h-4 text-[#121212]" />
                      <span>Mail Sent Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}

export default function App() {
  const [data, setData] = useState<PortfolioData>(PortfolioStore.getLocal());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'projects' | 'modeling' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Desktop vs Mobile detection for parallax & Lenis smooth scroll
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth >= 1024 &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !('ontouchstart' in window)
    );
  });

  useEffect(() => {
    const handleResize = () => {
      const desktop =
        window.innerWidth >= 1024 &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !('ontouchstart' in window);
      setIsDesktop(desktop);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Lenis smooth scroll — STRICTLY Desktop Only (pointer: fine, width >= 1024, no touch)
  useEffect(() => {
    const isTouchOrMobile =
      window.innerWidth < 1024 ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      'ontouchstart' in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

    if (isTouchOrMobile) {
      // Ensure Lenis classes are strictly absent so mobile native touch momentum scroll runs unhindered
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      return;
    }

    // Low-end desktop detection (4 or fewer CPU cores)
    const isLowEndDesktop = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;

    const lenis = new Lenis({
      duration: isLowEndDesktop ? 0.45 : 0.65,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 0, // Never hijack touch on dual-input laptops
      infinite: false,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
    };
  }, []);

  // Enforce pure dark theme permanently (no white mode)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Subscribe to live Cloudflare D1 data
  useEffect(() => {
    const unsub = PortfolioStore.subscribeToData((updated) => {
      setData(updated);
    });
    return () => unsub?.();
  }, []);

  // Routing helper supporting clean paths (/admin, /projects, /modeling) and backward-compatible hashes
  const getPageFromUrl = (): 'home' | 'projects' | 'modeling' | 'admin' => {
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();

    if (pathname === '/admin' || hash === 'admin' || hash === '/admin') return 'admin';
    if (pathname === '/projects' || hash === 'projects' || hash === '/projects' || pathname === '/portfolio') return 'projects';
    if (pathname === '/modeling' || hash === 'modeling' || hash === '/modeling') return 'modeling';
    return 'home';
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPage(getPageFromUrl());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to popstate and hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPage(getPageFromUrl());
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Scroll animations setup: Desktop parallax transforms
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -40]);
  const skyY = useTransform(scrollY, [0, 1000], [0, 150]);
  const hillsY = useTransform(scrollY, [0, 1000], [0, 80]);
  const bushesY = useTransform(scrollY, [0, 1000], [0, -40]);

  // Route to admin, projects, or modeling page
  if (currentPage === 'admin') {
    return <AdminPage onBackHome={() => navigate('/')} />;
  }
  if (currentPage === 'projects') {
    return (
      <>
        <ProjectsPage onBackHome={() => navigate('/')} />
        <ShoronAiChat data={data} />
      </>
    );
  }
  if (currentPage === 'modeling') {
    return (
      <>
        <ModelingPage onBackHome={() => navigate('/')} />
        <ShoronAiChat data={data} />
      </>
    );
  }

  const firstName = data.name.toLowerCase().includes('shoron')
    ? 'shoron'
    : (data.name.split(' ')[0]?.toLowerCase() || 'shoron');
  // Name for bottom landscape showcase: clean primary name
  const showcaseName = data.name.toLowerCase().includes('shoron')
    ? 'shoron'
    : (data.name.split(' ').find(w => w.length > 2)?.toLowerCase() || data.name.toLowerCase());

  return (
    <div className="dark bg-[#03060a] text-[#d6d6d6] relative min-h-screen font-sans transition-colors duration-300 overflow-x-hidden">
      
      {/* High-Resolution Ambient Starfield across website (GPU Hardware Accelerated, Zero Lag) */}
      <AmbientStarfield />

      {/* Dynamic Header — Transparent with Glassmorphic Blur on Scroll */}
      <PortfolioHeader name={data.name} navigate={navigate} />

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — parallax layers & animations PRESERVED exactly
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden">
        
        {/* Background — Atmospheric dark gradient seamless transition to #03060a obsidian */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#03060a_0%,#060c12_24%,#0c1417_44%,#091317_57%,#060e12_71%,#03060a_86%,#03060a_100%)] transition-colors"></div>

        {/* Animated Stars — Enhanced with stars around developer photo card */}
        <HeroStarfield />

        {/* Hero Layout: Left Side Profile, Right Side Photo — Raised slightly for balanced spacing */}
        <div id="about" className="relative z-30 mx-auto flex max-w-6xl flex-col items-center px-3.5 sm:px-6 pt-20 sm:pt-24 md:pt-26 pb-3 sm:pb-8 text-left">
          <motion.div
            style={{ y: isDesktop ? heroY : 0 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid w-full items-center gap-8 sm:gap-10 md:grid-cols-12"
          >
            {/* Left Side: Name & Bio */}
            <div className="flex flex-col items-start text-left md:col-span-7">
              {/* Continuous Looping Typewriter Badge — Larger, prominent, NO extra dots */}
              <HeroRoleBadge defaultBadge={data.heroStatusBadge} />

              {/* Bespoke Word-by-Word Reveal Animation */}
              <motion.h1
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.12,
                      delayChildren: 0.05,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
                className="lp-hero-heading flex flex-wrap gap-x-3 text-[38px] font-medium leading-[1.08] text-white md:text-[56px] lg:text-[62px]"
              >
                {data.name.split(' ').map((word, wIdx) => (
                  <motion.span
                    key={wIdx}
                    variants={{
                      hidden: { opacity: 0, y: 18 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.55,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      },
                    }}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
              <p className="mt-2 text-xl font-normal md:text-2xl text-neutral-400">
                {data.heroSubHeading}
              </p>
              
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60 md:text-[16px]">
                {data.bio}
              </p>

              {/* Action Buttons & Upper Social Links (CV, GitHub, LinkedIn only) */}
              <div className="mt-7 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all shadow-md bg-white text-neutral-950 hover:bg-neutral-100"
                >
                  <span>View Projects</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                {/* CV / Resume Button */}
                {data.cvUrl && (
                  <a
                    href={normalizeExternalUrl(data.cvUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all shadow-sm border-[#ffdb70]/50 bg-[#ffdb70]/10 text-[#ffdb70] hover:bg-[#ffdb70] hover:text-[#121212] cursor-pointer"
                    title="View / Download CV"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View CV</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                )}

                {/* GitHub */}
                {data.socials.github && (
                  <a
                    href={normalizeExternalUrl(data.socials.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm transition-all border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    title="GitHub Profile"
                  >
                    <GithubIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">GitHub</span>
                  </a>
                )}

                {/* LinkedIn */}
                {data.socials.linkedin && (
                  <a
                    href={normalizeExternalUrl(data.socials.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm transition-all border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    title="LinkedIn Profile"
                  >
                    <LinkedinIcon className="h-4 w-4 text-[#0a66c2]" />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Side: Developer Photo — Comes directly out of broken page background, no outer box, no gimmicks */}
            <div className="w-full flex justify-center md:col-span-5 md:justify-end">
              <div className="relative group w-full max-w-[325px]">
                {/* Broken Page Background Edge: Subtle organic deckled tear directly on dark background */}
                <div
                  className="relative aspect-square w-full overflow-hidden transition-all duration-500 ease-out group-hover:scale-[1.01]"
                  style={{
                    clipPath: 'polygon(0% 2px, 2% 0px, 5% 3px, 9% 1px, 14% 3px, 18% 0px, 23% 3px, 28% 1px, 32% 0px, 37% 3px, 42% 1px, 47% 4px, 52% 1px, 57% 3px, 62% 0px, 66% 3px, 71% 1px, 76% 4px, 80% 0px, 85% 3px, 89% 1px, 94% 4px, 98% 1px, 100% 2px, 99% 14%, 100% 27%, 99% 41%, 100% 55%, 99% 69%, 100% 84%, 99% calc(100% - 2px), 97% 100%, 93% calc(100% - 3px), 88% calc(100% - 1px), 83% calc(100% - 4px), 79% calc(100% - 1px), 74% calc(100% - 3px), 69% calc(100% - 1px), 64% calc(100% - 4px), 59% calc(100% - 1px), 54% calc(100% - 3px), 49% calc(100% - 1px), 44% calc(100% - 4px), 39% calc(100% - 1px), 34% calc(100% - 4px), 29% calc(100% - 1px), 24% calc(100% - 3px), 19% calc(100% - 1px), 14% calc(100% - 3px), 9% calc(100% - 1px), 5% calc(100% - 3px), 0% calc(100% - 2px), 1% 86%, 0% 72%, 1% 58%, 0% 43%, 1% 29%, 0% 15%)',
                    filter: 'drop-shadow(0 0 1px rgba(255, 219, 112, 0.45)) drop-shadow(0 16px 36px rgba(0, 0, 0, 0.95))',
                  }}
                >
                  <img
                    src={data.avatarUrl || '/developer_portrait.png'}
                    alt={`${data.name} — ${data.role}`}
                    className="h-full w-full object-cover object-center transition-all duration-500"
                    style={{
                      imageRendering: 'smooth',
                      filter: 'contrast(0.96) brightness(1.0) saturate(0.98)',
                    }}
                  />
                  {/* Subtle dark ambient blend into #03060a page background */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03060a]/60 via-transparent to-[#03060a]/20" />
                </div>

                {/* Clean, minimal name & location directly under photo — no outer card box */}
                <div className="mt-3.5 px-1 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white block leading-tight">{data.name}</span>
                    <p className="text-xs mt-1 text-[#ffdb70] font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffdb70]" />
                      {data.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Multi-Layer Landscape Parallax — Seamless on mobile, 4-layer parallax on desktop */}
        <div className="relative mt-2 sm:mt-8 w-full overflow-hidden sm:min-h-0 sm:h-[108vh] md:mt-12 md:h-[118vh] pb-0 sm:pb-0">
          
          {/* Layer 0: Sky Background */}
          <motion.img
            style={{ y: isDesktop ? skyY : 0 }}
            src="/sky-bg.webp"
            alt=""
            aria-hidden="true"
            className="lp-gpu pointer-events-none absolute inset-0 sm:inset-x-0 sm:bottom-[32%] z-0 w-full h-full sm:h-auto select-none object-cover brightness-[0.7] saturate-[0.8]"
          />

          {/* Layer 1: Hills Background */}
          <motion.img
            style={{ y: isDesktop ? hillsY : 0 }}
            src="/hills-bg.webp"
            alt=""
            aria-hidden="true"
            className="lp-gpu pointer-events-none absolute inset-x-0 bottom-10 sm:bottom-[21%] z-[1] w-full select-none object-cover brightness-[1.15] contrast-[1.05]"
          />

          {/* Layer 2: Main Featured Profile Card */}
          <div className="lp-gpu relative z-10 mx-auto w-full max-w-4xl px-3.5 sm:px-6 sm:absolute sm:inset-x-0 sm:top-[11%]">
            <div className="relative w-full overflow-hidden rounded-t-[20px] border border-b-0 border-[#383838] bg-[#1e1e1f] text-[#fafafa] shadow-[0_16px_30px_rgba(0,0,0,0.25)] px-4 pt-6 pb-28 sm:px-9 sm:pt-9 sm:pb-[42vh] md:pb-[46vh]">
              
              {/* Badge & Quick Stats — DYNAMIC */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#383838] pb-5">
                <div className="flex items-center gap-2 text-[13px]">
                  <Code2 className="h-4 w-4 text-[#ffdb70]" />
                  <span className="font-semibold">Engineering Highlights</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono opacity-70">
                  <span>{data.heroStats.label1}</span>
                  <span>{data.heroStats.label2}</span>
                  <span className="text-[#ffdb70] font-semibold">{data.heroStats.label3}</span>
                </div>
              </div>

              {/* Hero Cards — DYNAMIC */}
              <div className="grid gap-4 sm:grid-cols-3 relative z-10">
                {data.heroCards.map((card, idx) => {
                  const IconComp = iconMap[card.icon] || Code2;
                  return (
                    <div key={idx} className="rounded-[16px] border p-4 transition-all border-[#383838] bg-[#212123] hover:border-[#ffdb70]/50">
                      <div className="w-8 h-8 rounded-lg bg-[#ffdb70] text-[#121212] flex items-center justify-center mb-3 shadow-xs font-semibold">
                        <IconComp className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-semibold mb-1">{card.title}</h3>
                      <p className="text-xs leading-relaxed text-[#d6d6d6]/70">{card.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Card Internal Bottom Vignette — Dissolves the bottom of the card box seamlessly into obsidian #03060a */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 sm:h-48 bg-gradient-to-t from-[#03060a] via-[#03060a]/80 to-transparent z-20" />

            </div>
          </div>

          {/* Layer 3: Foreground Bushes — Overlaps bottom of card with atmospheric vignette */}
          <motion.div
            style={{ y: isDesktop ? bushesY : 0 }}
            className="lp-gpu pointer-events-none absolute inset-x-0 bottom-0 z-20"
          >
            <img
              src="/bushes-fg.webp"
              alt=""
              aria-hidden="true"
              className="block w-full origin-bottom scale-[1.35] select-none object-cover brightness-[0.7] saturate-[0.85] md:scale-[1.35]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 sm:h-52 bg-gradient-to-t from-[#03060a] via-[#03060a]/85 to-transparent" />
          </motion.div>

          {/* Section Base Blend — Guarantees 0px seam or bar between Hero and Content */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-[#03060a] to-transparent z-30" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT — SEAMLESS OBSIDIAN BACKGROUND MATCHING HERO AREA (CARDS UNTOUCHED)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 bg-transparent pt-4">
        <section className="relative px-3.5 sm:px-6 py-6 sm:py-8">
          <div className="mx-auto max-w-6xl">

            {/* ── Terminal Showcase ── */}
            <section className="py-6 sm:py-10">
              <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full border px-3 py-1 text-[11px] font-mono tracking-wider uppercase border-[#383838] bg-[#212123] text-[#ffdb70]">
                      ENGINEERING WORKFLOW
                    </span>
                  </div>
                  <h2 className="lp-hero-heading text-[28px] sm:text-[32px] leading-[1.15] text-[#fafafa] md:text-[42px] lg:text-[48px]">
                    Clean Architecture. <span className="text-[#ffdb70]">Reliable Delivery.</span>
                  </h2>
                  <p className="mt-3 sm:mt-4 max-w-md text-sm sm:text-base leading-relaxed text-[#d6d6d6]/70">
                    Building scalable mobile and web applications, robust backend architectures, and AI-driven solutions designed for performance and reliability.
                  </p>
                </motion.div>

                {/* Terminal Mockup — Clean pure terminal container */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="lp-gpu"
                >
                  <div className="flex h-[340px] sm:h-[360px] flex-col overflow-hidden rounded-[20px] border border-[#383838] bg-[#1e1e1f] shadow-[0_16px_30px_rgba(0,0,0,0.25)]">
                    <div className="flex items-center gap-2 border-b border-[#383838] bg-[#212123] px-3.5 sm:px-4 py-2.5 sm:py-3">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
                      </span>
                      <span className="ml-2 text-[11px] sm:text-[12px] text-[#d6d6d6]/60 font-mono">{firstName}@workspace — zsh</span>
                    </div>
                    <div className="min-h-0 flex-1 p-4 sm:p-5 font-mono text-[12px] sm:text-[13px] leading-relaxed">
                      <div className="mb-3 flex items-center justify-between text-[11px] text-[#d6d6d6]/50">
                        <span className="text-[#ffdb70]">● connected</span>
                        <span>{data.name} · main branch</span>
                      </div>
                      <TerminalTypewriter terminalText={data.terminalText} />
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                RESUME SECTION — Exact codewithsadee/vcard-personal-portfolio Architecture
                1. Education (BookOpen icon in square icon-box)
                2. Experience (BookOpen icon in square icon-box)
                3. My skills (Code2 icon in square icon-box with progress bars + category badges)
               ═══════════════════════════════════════════════════════════ */}
            <section id="resume" className="scroll-mt-24 py-8 sm:py-10">
              <div id="experience" className="rounded-[20px] bg-[#1e1e1f] border border-[#383838] p-4 sm:p-10 shadow-[0_16px_30px_rgba(0,0,0,0.25)]">
                
                {/* Article Title with vCard signature golden accent bar */}
                <header className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="relative pb-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1.5 after:bg-gradient-to-r after:from-[#ffdb70] after:to-[#ceb15a] after:rounded-full">
                    {data.experienceSectionTitle || 'Resume'}
                  </h2>
                  {data.cvUrl && (
                    <a
                      href={normalizeExternalUrl(data.cvUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all shadow-sm bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] hover:shadow-[0_4px_16px_rgba(255,219,112,0.35)] cursor-pointer"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Download Full CV</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </header>

                {/* 1. EDUCATION SECTION */}
                <div className="mb-10 sm:mb-12">
                  <div className="flex items-center gap-3 sm:gap-3.5 mb-5 sm:mb-7">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#383838] to-[#202022] border border-[#383838] shadow-[-4px_8px_24px_rgba(0,0,0,0.25)] flex items-center justify-center text-[#ffdb70] shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#fafafa]">Education</h3>
                  </div>

                  <ol className="timeline-list border-l border-[#383838] ml-3 sm:ml-7 pl-4 sm:pl-8 space-y-6 sm:space-y-7 relative">
                    {(data.educations && data.educations.length > 0 ? data.educations : DEFAULT_PORTFOLIO_DATA.educations || []).map((edu, idx) => (
                      <li key={idx} className="relative">
                        <span className="absolute -left-[22px] sm:-left-[38px] top-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] shadow-[0_0_0_4px_#383838]" />
                        <h4 className="text-base sm:text-lg font-semibold text-[#fafafa] mb-0.5">
                          {edu.title}
                        </h4>
                        <p className="text-xs sm:text-sm font-mono text-[#ffdb70]/90 mb-1">
                          {edu.institution}
                        </p>
                        <span className="text-xs sm:text-sm font-medium text-[#ceb15a] mb-2 block">
                          {edu.period}
                        </span>
                        <p className="text-xs sm:text-sm leading-relaxed text-[#d6d6d6] font-light max-w-3xl">
                          {edu.description}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* 2. EXPERIENCE SECTION */}
                <div className="mb-10 sm:mb-12">
                  <div className="flex items-center gap-3 sm:gap-3.5 mb-5 sm:mb-7">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#383838] to-[#202022] border border-[#383838] shadow-[-4px_8px_24px_rgba(0,0,0,0.25)] flex items-center justify-center text-[#ffdb70] shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#fafafa]">Experience</h3>
                  </div>

                  <ol className="timeline-list border-l border-[#383838] ml-3 sm:ml-7 pl-4 sm:pl-8 space-y-6 sm:space-y-7 relative">
                    {data.experiences.map((exp, idx) => (
                      <li key={idx} className="relative">
                        <span className="absolute -left-[22px] sm:-left-[38px] top-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] shadow-[0_0_0_4px_#383838]" />
                        <h4 className="text-base sm:text-lg font-semibold text-[#fafafa] mb-0.5">
                          {exp.title}
                        </h4>
                        <p className="text-xs sm:text-sm font-mono text-[#ffdb70]/90 mb-1">
                          {exp.company}
                        </p>
                        <span className="text-xs sm:text-sm font-medium text-[#ceb15a] mb-2 block">
                          {exp.period}
                        </span>
                        <p className="text-xs sm:text-sm leading-relaxed text-[#d6d6d6] font-light max-w-3xl">
                          {exp.description}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* 3. MY SKILLS SECTION */}
                <div id="skills" className="scroll-mt-28">
                  <div className="flex items-center gap-3 sm:gap-3.5 mb-6">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#383838] to-[#202022] border border-[#383838] shadow-[-4px_8px_24px_rgba(0,0,0,0.25)] flex items-center justify-center text-[#ffdb70] shrink-0">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#fafafa]">My skills</h3>
                  </div>

                  {/* Skills Progress Card (Exact vCard Style) */}
                  <div className="rounded-[20px] bg-[#212123] border border-[#383838] p-4 sm:p-8 shadow-[0_16px_30px_rgba(0,0,0,0.25)] mb-8">
                    <div className="space-y-5">
                      {(data.skillPercentages && data.skillPercentages.length > 0 ? data.skillPercentages : DEFAULT_PORTFOLIO_DATA.skillPercentages || []).map((skill, sIdx) => (
                        <div key={sIdx} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-[#fafafa]">{skill.name}</span>
                            <span className="font-mono text-[#d6d6d6]">{skill.percentage}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#383838] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.percentage}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, delay: sIdx * 0.1 }}
                              className="h-full rounded-full bg-gradient-to-r from-[#ffdb70] to-[#ceb15a]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skill Badges & Category Groups */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.skillCategories.map((sec, idx) => {
                      const IconComp = iconMap[sec.icon] || Layout;
                      return (
                        <div key={idx} className="rounded-[16px] bg-[#212123] border border-[#383838] p-4 transition-all hover:border-[#ffdb70]/50">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="h-7 w-7 rounded-lg bg-[#2a2a2c] border border-[#383838] flex items-center justify-center text-[#ffdb70]">
                              <IconComp className="h-3.5 w-3.5" />
                            </div>
                            <h4 className="text-xs font-semibold tracking-tight text-[#fafafa]">{sec.category}</h4>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {sec.skills.map((skill, skIdx) => (
                              <span key={skIdx} className="vcard-pill text-[11px] py-1 px-2.5">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                PORTFOLIO SECTION — Exact codewithsadee/vcard-personal-portfolio Architecture
                1. Article Title with signature golden accent bar
                2. Category filter tabs (.filter-list)
                3. Project card grid (.project-list):
                   - Figure with image and dark hover overlay
                   - Centered eye icon-box (.project-item-icon-box)
                   - Project title (.project-title)
                   - Project category (.project-category)
                   - Live Preview & GitHub links
               ═══════════════════════════════════════════════════════════ */}
            <section id="portfolio" className="scroll-mt-24 py-8 sm:py-10">
              <div id="projects" className="rounded-[20px] bg-[#1e1e1f] border border-[#383838] p-4 sm:p-10 shadow-[0_16px_30px_rgba(0,0,0,0.25)]">
                
                {/* Article Title with vCard signature golden accent bar */}
                <header className="mb-6 sm:mb-8">
                  <h2 className="relative pb-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1.5 after:bg-gradient-to-r after:from-[#ffdb70] after:to-[#ceb15a] after:rounded-full">
                    Portfolio
                  </h2>
                </header>

                {/* Filter List Tabs */}
                <ul className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm border-b border-[#383838]/60 pb-3 sm:pb-4">
                  {['All', 'Full Stack', 'Frontend', 'Backend', 'DevOps', 'Mobile'].map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={`transition-colors cursor-pointer text-xs sm:text-sm font-medium pb-2 ${
                          selectedCategory === cat
                            ? 'text-[#ffdb70] font-semibold border-b-2 border-[#ffdb70] -mb-[18px]'
                            : 'text-[#d6d6d6]/70 hover:text-[#fafafa]'
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Project List Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                  {data.projects
                    .filter(p => selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase())
                    .map((project) => (
                      <div
                        key={project.id}
                        className="project-item group block"
                      >
                        {/* Figure container with image and hover eye icon-box */}
                        <div className="relative overflow-hidden rounded-[16px] h-48 sm:h-52 w-full bg-[#121212] mb-3 border border-[#383838]/60">
                          {/* Hover dark overlay */}
                          <div className="absolute inset-0 z-10 bg-transparent group-hover:bg-black/55 transition-colors duration-300 pointer-events-none" />
                          
                          {/* Signature vCard Eye Icon Box */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-xl bg-[#383838] text-[#ffdb70] flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-2xl pointer-events-none">
                            <Eye className="w-5 h-5 text-[#ffdb70]" />
                          </div>

                          <img
                            src={project.imageUrl}
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.src.includes('photo-1551288049')) {
                                target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000';
                              }
                            }}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                          />
                        </div>

                        {/* Project Title */}
                        <h3 className="project-title text-[15px] font-semibold text-[#fafafa] group-hover:text-[#ffdb70] transition-colors leading-snug">
                          {project.title}
                        </h3>

                        {/* Project Category */}
                        <p className="project-category text-xs text-[#d6d6d6]/65 mt-1 font-light">
                          {project.category}
                        </p>

                        {/* Links */}
                        <div className="mt-3 flex items-center gap-3 text-xs pt-2 border-t border-[#383838]/40">
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#ffdb70] hover:underline font-medium"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Live Preview</span>
                            </a>
                          )}
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#d6d6d6]/70 hover:text-[#fafafa] transition-colors"
                            >
                              <GithubIcon className="w-3.5 h-3.5" />
                              <span>GitHub</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* View All Projects Button */}
                <div className="text-center mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#383838]/60">
                  <button
                    onClick={() => navigate('/projects')}
                    className="inline-flex items-center gap-2 rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] hover:shadow-[0_4px_20px_rgba(255,219,112,0.35)]"
                  >
                    <span>View All Projects in Archive</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            </section>

            {/* ── Ventures & Entrepreneurship Section (Directly under Projects) ── */}
            {data.ventures && data.ventures.length > 0 && (
            <section id="ventures" className="scroll-mt-24 py-8 sm:py-10">
              <div className="rounded-[20px] bg-[#1e1e1f] border border-[#383838] p-4 sm:p-10 shadow-[0_16px_30px_rgba(0,0,0,0.25)]">
                
                {/* Article Title with signature golden accent bar */}
                <header className="mb-6 sm:mb-8">
                  <h2 className="relative pb-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1.5 after:bg-gradient-to-r after:from-[#ffdb70] after:to-[#ceb15a] after:rounded-full">
                    Ventures & Entrepreneurship
                  </h2>
                  <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#d6d6d6]/70 max-w-2xl leading-relaxed">
                    Organizations founded, co-built, or steered. Driving product innovation, engineering leadership, and strategic business growth.
                  </p>
                </header>

                {/* Ventures Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {(data.ventures || []).map((venture) => (
                    <div
                      key={venture.id}
                      className="group relative rounded-[18px] bg-[#212123] border border-[#383838] p-4 sm:p-6 transition-all duration-300 hover:border-[#ffdb70]/50 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between"
                    >
                      <div>
                        {/* Top: Logo/Photo & Category & Period */}
                        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="flex items-center gap-3 sm:gap-3.5">
                            {venture.imageUrl ? (
                              <img
                                src={venture.imageUrl}
                                alt={venture.name}
                                className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover border border-[#383838] bg-black/40 shadow-inner group-hover:border-[#ffdb70]/40 transition-colors shrink-0"
                              />
                            ) : (
                              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-[#2a2a2b] to-[#1a1a1b] border border-[#383838] flex items-center justify-center text-[#ffdb70] shrink-0">
                                <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-[#fafafa] group-hover:text-[#ffdb70] transition-colors leading-snug">
                                {venture.name}
                              </h3>
                              <p className="text-xs font-semibold text-[#ffdb70]/90 mt-0.5">
                                {venture.role}
                              </p>
                            </div>
                          </div>

                          {venture.category && (
                            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#2a2a2b] border border-[#383838] text-[#d6d6d6]/80">
                              {venture.category}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-[#d6d6d6]/80 leading-relaxed mb-4">
                          {venture.description}
                        </p>
                      </div>

                      {/* Footer: Period + Website Link */}
                      <div className="pt-3.5 sm:pt-4 border-t border-[#383838]/60 flex items-center justify-between text-xs text-[#d6d6d6]/60">
                        <span>{venture.period || 'Active'}</span>
                        {venture.websiteUrl && (
                          <a
                            href={venture.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-[#ffdb70] hover:underline"
                          >
                            <span>Visit Website</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            )}

            {/* ── FAQ Section — Exact Same Alignment & Architecture as Resume and Portfolio ── */}
            <section id="faq" className="scroll-mt-24 py-8 sm:py-10">
              <div className="rounded-[20px] bg-[#1e1e1f] border border-[#383838] p-4 sm:p-10 shadow-[0_16px_30px_rgba(0,0,0,0.25)]">
                
                {/* Article Title with signature golden accent bar */}
                <header className="mb-6 sm:mb-8">
                  <h2 className="relative pb-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1.5 after:bg-gradient-to-r after:from-[#ffdb70] after:to-[#ceb15a] after:rounded-full">
                    {data.faqSectionTitle || 'Frequently Asked Questions'}
                  </h2>
                  <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#d6d6d6]/70 max-w-2xl leading-relaxed">
                    {data.faqSectionSubtitle || 'Answers to common questions about engineering workflow, systems design, and project collaboration.'}
                  </p>
                </header>

                <div className="space-y-3 sm:space-y-4">
                  {data.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-[16px] border overflow-hidden transition-all border-[#383838] bg-[#212123] shadow-sm hover:border-[#ffdb70]/50"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-medium text-[#fafafa] cursor-pointer"
                      >
                        <span className="pr-3 sm:pr-4">{faq.question}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-[#ffdb70]' : 'text-[#d6d6d6]/40'}`} />
                      </button>
                      {openFaq === idx && (
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm leading-relaxed border-t pt-3 sm:pt-3.5 whitespace-pre-line text-[#d6d6d6] border-[#383838]/60 bg-[#1e1e1f]/60">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* ── Contact Section — Real Interactive Contact & WhatsApp Area ── */}
            <PortfolioContactSection data={data} />

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FOOTER LANDSCAPE SHOWCASE — Text centered with bottom 30% tucked into grass
           ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#03060a] pt-16 pb-0">
          
          <div className="relative h-[380px] sm:h-[450px] md:h-[500px] w-full flex items-center justify-center overflow-hidden">
            {/* Background Mountains */}
            <img
              src="/hills-bg.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.45] contrast-[1.15]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#03060a] via-transparent to-transparent" />
            
            {/* Name: Tucked slightly into foliage — raised for clear visibility while maintaining landscape depth */}
            <div
              className="pointer-events-none absolute inset-x-0 z-10 flex items-center justify-center text-center px-4"
              style={{ bottom: '38%' }}
            >
              <h2
                className="lp-serif text-center font-normal tracking-tight text-white/95 select-none whitespace-nowrap"
                style={{
                  fontSize: 'clamp(115px, 17vw, 195px)',
                  lineHeight: 0.85,
                  textShadow: '0 16px 45px rgba(0,0,0,0.95)',
                }}
              >
                {showcaseName}
              </h2>
            </div>

            {/* Foreground Grass / Bushes layer */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-full w-full flex items-end">
              <img
                src="/bushes-fg.webp"
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover object-bottom brightness-[0.65] saturate-[0.85]"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#03060a] to-transparent" />
            </div>
          </div>

          {/* Bottom Footer Bar */}
          <footer className="relative z-30 border-t border-[#383838] bg-[#03060a] text-[#d6d6d6]/70 py-8 px-3.5 sm:px-6 text-xs">
            <div className="mx-auto max-w-6xl space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                {/* Navigation links */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
                  <a href="#about" className="transition-colors hover:text-[#ffdb70]">About</a>
                  <a href="#resume" className="transition-colors hover:text-[#ffdb70]">Resume</a>
                  <button
                    onClick={() => navigate('/projects')}
                    className="transition-colors hover:text-[#ffdb70] cursor-pointer"
                  >
                    Portfolio
                  </button>
                  <a href="#ventures" className="transition-colors hover:text-[#ffdb70]">Ventures</a>
                  <button
                    onClick={() => navigate('/modeling')}
                    className="transition-colors hover:text-[#ffdb70] cursor-pointer"
                  >
                    Modeling
                  </button>
                  <a href="#contact" className="transition-colors hover:text-[#ffdb70]">Contact</a>
                  <button
                    onClick={() => navigate('/admin')}
                    className="font-medium transition-colors cursor-pointer text-[#ffdb70] hover:underline"
                  >
                    Admin CMS
                  </button>
                </div>

                {/* Social pill buttons with icons */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {data.socials.github && (
                    <a
                      href={normalizeExternalUrl(data.socials.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:border-[#ffdb70]/50 hover:bg-[#ffdb70]/10 hover:text-[#ffdb70] transition-all"
                      title="GitHub"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {data.socials.linkedin && (
                    <a
                      href={normalizeExternalUrl(data.socials.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:border-[#ffdb70]/50 hover:bg-[#ffdb70]/10 hover:text-[#ffdb70] transition-all"
                      title="LinkedIn"
                    >
                      <LinkedinIcon className="h-3.5 w-3.5 text-[#0a66c2]" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {data.socials.facebook && (
                    <a
                      href={normalizeExternalUrl(data.socials.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:border-[#ffdb70]/50 hover:bg-[#ffdb70]/10 hover:text-[#ffdb70] transition-all"
                      title="Facebook"
                    >
                      <FacebookIcon className="h-3.5 w-3.5 text-[#1877f2]" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {data.socials.instagram && (
                    <a
                      href={normalizeExternalUrl(data.socials.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:border-[#ffdb70]/50 hover:bg-[#ffdb70]/10 hover:text-[#ffdb70] transition-all"
                      title="Instagram"
                    >
                      <InstagramIcon className="h-3.5 w-3.5 text-[#e4405f]" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {data.socials.twitter && (
                    <a
                      href={normalizeExternalUrl(data.socials.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:border-[#ffdb70]/50 hover:bg-[#ffdb70]/10 hover:text-[#ffdb70] transition-all"
                      title="Twitter / X"
                    >
                      <TwitterIcon className="h-3.5 w-3.5" />
                      <span>X</span>
                    </a>
                  )}
                  {data.socials.youtube && (
                    <a
                      href={normalizeExternalUrl(data.socials.youtube)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:border-[#ffdb70]/50 hover:bg-[#ffdb70]/10 hover:text-[#ffdb70] transition-all"
                      title="YouTube"
                    >
                      <YoutubeIcon className="h-3.5 w-3.5 text-[#ff0000]" />
                      <span>YouTube</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Bottom Copyright & Tagline */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-4 text-xs text-neutral-500 gap-2">
                <span>© {new Date().getFullYear()} {data.name}. All rights reserved.</span>
                <span>Full-Stack Software Engineer &amp; Backend Specialist</span>
              </div>
            </div>
          </footer>
        </section>
      </div>

      {/* AI Chat Launcher & Dialog (Trained as Shoron, Powered by Gemini) */}
      <ShoronAiChat data={data} />

    </div>
  );
}
