import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Copy,
  ChevronDown,
  ArrowRight,
  Globe,
  Mail,
  Sun,
  Moon,
  CheckCircle2,
  Terminal,
  Sparkles,
  Award,
  Cpu,
  Server,
  Layout,
} from 'lucide-react';

export default function App() {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');


  // Typewriter effect state for terminal mockup
  const [typedText, setTypedText] = useState('');
  const fullText = "const profile = { name: 'Alex Vance', role: 'Senior Full Stack Architect', status: 'Available for Opportunities' };";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 35);
    return () => clearInterval(interval);
  }, []);

  // Scroll animations setup
  const { scrollY } = useScroll();

  // Header background opacity on scroll
  const headerBgOpacity = useTransform(scrollY, [0, 80], [0, 0.95]);

  // Parallax movement
  const heroY = useTransform(scrollY, [0, 600], [0, -40]);
  const skyY = useTransform(scrollY, [0, 1000], [0, 150]);
  const hillsY = useTransform(scrollY, [0, 1000], [0, 80]);
  const bushesY = useTransform(scrollY, [0, 1000], [0, -40]);

  // Staggered parallax for cards in lower sections
  const cliTextY = useTransform(scrollY, [400, 1200], [40, -20]);
  const cliTerminalY = useTransform(scrollY, [400, 1200], [80, -40]);
  const webTextY = useTransform(scrollY, [1200, 2000], [40, -20]);
  const webCardY = useTransform(scrollY, [1200, 2000], [90, -45]);

  // Handle copy contact info
  const handleCopy = (text: string = 'alex.vance@engineer.portfolio') => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Professional skills list below the main profile card
  const skillsList = [
    { category: 'Frontend Architecture', icon: Layout, skills: ['React 19', 'Next.js 15 App Router', 'TypeScript', 'TailwindCSS v4', 'Framer Motion', 'WebSockets'] },
    { category: 'Backend & APIs', icon: Server, skills: ['Node.js', 'Express', 'Python / Django', 'GraphQL', 'REST Architecture', 'gRPC'] },
    { category: 'Cloud & Infrastructure', icon: Cpu, skills: ['AWS (Lambda, S3, EC2)', 'Docker & Kubernetes', 'PostgreSQL', 'Redis', 'CI/CD Pipelines', 'Vercel / Cloudflare'] }
  ];

  // Professional FAQ items
  const faqs = [
    {
      q: 'What types of engineering projects do you specialize in?',
      a: 'I specialize in architecting high-performance enterprise web applications, real-time AI dashboards, scalable microservices, and modern SaaS platforms using Next.js, React, TypeScript, and cloud services.'
    },
    {
      q: 'What is your availability for full-time roles or contracts?',
      a: 'I am currently accepting select full-time Senior/Lead Engineering roles as well as high-impact technical advisory and contract projects globally.'
    },
    {
      q: 'How do you ensure code quality and performance?',
      a: 'Every system is built with strict TypeScript type safety, automated CI/CD testing pipelines, modular architecture, and sub-second web performance optimization.'
    },
    {
      q: 'How can we initiate a technical consultation?',
      a: 'Reach out directly via email at alex.vance@engineer.portfolio or use the contact action button above. I typically respond within 12 hours.'
    }
  ];

  const isLight = theme === 'light';

  return (
    <div className={`${isLight ? 'bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-900' : 'dark bg-black text-white selection:bg-emerald-900 selection:text-emerald-200'} relative min-h-screen font-sans transition-colors duration-300 overflow-x-hidden`}>
      
      {/* Dynamic Professional Header with Theme Toggle */}
      <header className="lp-gpu fixed inset-x-0 top-0 z-50 transition-all">
        <motion.div
          style={{ opacity: headerBgOpacity }}
          className={`pointer-events-none absolute inset-0 ${isLight ? 'bg-white/85 shadow-sm' : 'bg-gradient-to-b from-black/90 via-black/55 to-transparent'} backdrop-blur-md transition-colors`}
        />
        <div className="relative flex min-w-0 items-center justify-between gap-2 sm:gap-3 mx-auto max-w-6xl px-6 py-3.5 sm:px-10 lg:px-12">
          
          {/* Professional Brand Logo */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <a href="/" className="group flex flex-shrink-0 items-center gap-2.5 opacity-90 transition-opacity duration-200 hover:opacity-100">
              <div className="h-7 w-7 rounded-lg bg-forest-bright/20 border border-forest-bright/40 flex items-center justify-center font-bold text-forest-bright text-xs shadow-sm">
                AV
              </div>
              <span className={`lp-serif text-lg tracking-tight font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Alex Vance <span className="text-xs font-mono font-normal opacity-60 text-forest-bright">.dev</span>
              </span>
            </a>
          </div>

          {/* Navigation Links with Clean Pill Styling */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <nav className="hidden md:flex items-center space-x-1 rounded-full p-1 border border-white/10 bg-white/[0.04] backdrop-blur-md">
              <a href="#about" className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors ${isLight ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>About</a>
              <a href="#projects" className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors ${isLight ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>Projects</a>
              <a href="#skills" className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors ${isLight ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                Skills <span className="text-[8px] font-semibold uppercase leading-none tracking-wide rounded-full bg-forest/15 px-1.5 py-0.5 text-forest-bright/90 border border-forest/40">expert</span>
              </a>
              <a href="#experience" className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors ${isLight ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>Experience</a>
              <a href="#contact" className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors ${isLight ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>Contact</a>
            </nav>

            {/* Theme Toggle Button (Dark / White Theme) */}
            <button
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              className={`p-2 rounded-full border transition-all ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200' : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'}`}
              title={`Switch to ${isLight ? 'Dark' : 'White'} theme`}
            >
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-300" />}
            </button>

            <a
              href="#contact"
              className="items-center gap-1.5 rounded-full bg-forest-bright px-4 py-1.5 text-xs font-semibold text-black hover:bg-forest-bright/90 transition-all shadow-md hidden sm:inline-flex"
            >
              <span>Get in Touch</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden">
        
        {/* Deep Gradient Background */}
        <div className={`pointer-events-none absolute inset-0 ${isLight ? 'bg-[linear-gradient(to_bottom,#f8fafc_0%,#e2e8f0_40%,#cbd5e1_70%,#94a3b8_100%)]' : 'bg-[linear-gradient(to_bottom,#03060a_0%,#060c12_24%,#101f23_44%,#172a29_57%,#121a1a_71%,#070a0b_86%,#000000_100%)]'} transition-colors`}></div>

        {/* Animated Stars (Dark mode only) */}
        {!isLight && (
          <div className="lp-gpu pointer-events-none absolute inset-0 z-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {[
                { left: '84.182%', top: '8.850%', dur: '5.949s', delay: '0.101s' },
                { left: '8.425%', top: '51.412%', dur: '5.516s', delay: '1.879s' },
                { left: '21.101%', top: '22.892%', dur: '3.545s', delay: '1.894s' },
                { left: '26.151%', top: '7.746%', dur: '4.636s', delay: '2.575s' },
                { left: '89.217%', top: '3.141%', dur: '5.912s', delay: '1.773s' },
              ].map((star, idx) => (
                <span
                  key={idx}
                  className="lp-star h-0.5 w-0.5"
                  style={{ left: star.left, top: star.top, '--dur': star.dur, '--delay': star.delay } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        )}

        {/* Top Hero Layout: Left Side Name & Details, Right Side Developer Photo */}
        <div id="about" className="relative z-30 mx-auto flex max-w-6xl flex-col items-center px-6 pt-36 text-left md:pt-40">
          <motion.div
            style={{ y: heroY }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lp-gpu grid w-full items-center gap-10 md:grid-cols-12"
          >
            {/* Left Side: Name & Bio Details */}
            <div className="flex flex-col items-start text-left md:col-span-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-bright/30 bg-forest-bright/10 px-3 py-1 text-xs font-mono text-forest-bright">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest-bright opacity-60"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-forest-bright"></span>
                </span>
                <span>Senior Full Stack Software Architect</span>
              </div>

              <h1 className={`lp-hero-heading text-[38px] font-medium leading-[1.1] ${isLight ? 'text-slate-900' : 'text-white'} md:text-[56px] lg:text-[62px]`}>
                Alex Vance
              </h1>
              <p className="mt-2 text-xl font-light text-forest-bright md:text-2xl">
                Building High-Impact Web Platforms & Scalable Systems
              </p>
              
              <p className={`mt-4 max-w-xl text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'} md:text-[16px]`}>
                Over 6+ years of engineering experience delivering enterprise web apps, AI cloud dashboards, and high-throughput microservices using React, Next.js, Node.js, and Python.
              </p>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 rounded-full bg-forest-bright px-6 py-2.5 text-sm font-semibold text-black hover:bg-forest-bright/90 transition-all shadow-lg"
                >
                  <span>View Projects</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleCopy('alex.vance@engineer.portfolio')}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-all ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100' : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'}`}
                >
                  <Mail className="h-4 w-4 text-forest-bright" />
                  <span>{copied ? 'Email Copied!' : 'Copy Email'}</span>
                </button>
              </div>
            </div>

            {/* Right Side: Professional Developer Photo Card */}
            <div className="flex justify-center md:col-span-5 md:justify-end">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-forest-bright/50 via-emerald-400/30 to-teal-500/40 opacity-70 blur-xl transition-all group-hover:opacity-100"></div>
                <div className={`relative overflow-hidden rounded-2xl border ${isLight ? 'border-slate-200 bg-white shadow-xl' : 'border-white/10 bg-[#0c0d10] shadow-2xl'} p-2 max-w-[320px]`}>
                  <img
                    src="/developer_portrait.png"
                    alt="Alex Vance - Full Stack Software Engineer"
                    className="h-[340px] w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="p-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Alex Vance</span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-forest-bright">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>San Francisco, CA · Remote Worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 100% Exact Multi-Layer Landscape Parallax matching freebuff.com */}
        <div className="relative mt-8 h-[108vh] w-full md:mt-12 md:h-[118vh]">
          
          {/* Layer 0: Sky Background WebP */}
          <motion.img
            style={{ y: skyY }}
            src="/sky-bg.webp"
            alt=""
            aria-hidden="true"
            className="lp-gpu pointer-events-none absolute inset-x-0 bottom-[32%] z-0 w-full select-none object-cover brightness-[0.7] saturate-[0.8]"
          />

          {/* Layer 1: Hills Background WebP */}
          <motion.img
            style={{ y: hillsY }}
            src="/hills-bg.webp"
            alt=""
            aria-hidden="true"
            className="lp-gpu pointer-events-none absolute inset-x-0 bottom-[21%] z-[1] w-full select-none object-cover brightness-[1.15] contrast-[1.05]"
          />

          {/* Layer 2: Main Featured Profile Card (UNDER bushes image z-10) */}
          <div className="lp-gpu absolute inset-x-0 top-[11%] z-10 mx-auto w-full max-w-4xl px-3 sm:px-6">
            <div className={`relative w-full overflow-hidden rounded-t-[20px] border border-b-0 ${isLight ? 'border-slate-300 bg-white/95 text-slate-900 shadow-xl' : 'border-white/[0.08] bg-[#0b0c0e] text-white shadow-[0_50px_140px_-25px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)_inset]'} px-4 pt-7 pb-[42vh] sm:px-9 sm:pt-9 sm:pb-[46vh]`}>
              
              {/* Badge & Quick Stats */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div className="flex items-center gap-2 text-[13px]">
                  <Sparkles className="h-4 w-4 text-forest-bright" />
                  <span className="font-semibold">Executive Engineering Summary</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono opacity-70">
                  <span>6+ Yrs Exp</span>
                  <span>45+ Delivered Apps</span>
                  <span className="text-forest-bright">99.9% Uptime</span>
                </div>
              </div>

              {/* Professional Highlight Cards Inside Hero Dashboard */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className={`rounded-xl border p-4 transition-all ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.03]'}`}>
                  <Award className="h-5 w-5 text-forest-bright mb-2" />
                  <h3 className="text-sm font-semibold mb-1">Architecture Leadership</h3>
                  <p className="text-xs opacity-60 leading-relaxed">Designed scalable Next.js & microservices architectures processing 2M+ monthly queries.</p>
                </div>
                <div className={`rounded-xl border p-4 transition-all ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.03]'}`}>
                  <Terminal className="h-5 w-5 text-forest-bright mb-2" />
                  <h3 className="text-sm font-semibold mb-1">Full-Stack Mastery</h3>
                  <p className="text-xs opacity-60 leading-relaxed">Expert in React 19, TypeScript, Node.js, Python, PostgreSQL, and cloud deployments.</p>
                </div>
                <div className={`rounded-xl border p-4 transition-all ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.03]'}`}>
                  <Cpu className="h-5 w-5 text-forest-bright mb-2" />
                  <h3 className="text-sm font-semibold mb-1">AI & Web Performance</h3>
                  <p className="text-xs opacity-60 leading-relaxed">Specialized in sub-second LCP optimization, real-time WebSockets, and AI integrations.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Layer 3: Foreground Bushes / Flower Foliage Layer (z-20 - OVER CARD on scroll) */}
          <motion.div
            style={{ y: bushesY }}
            className="lp-gpu pointer-events-none absolute inset-x-0 bottom-0 z-20"
          >
            <img
              src="/bushes-fg.webp"
              alt=""
              aria-hidden="true"
              className="block w-full origin-bottom scale-[1.6] select-none object-cover brightness-[0.7] saturate-[0.85] md:scale-[1.35]"
            />
            {/* Multi-stop exact gradient transition */}
            <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-full ${isLight ? 'bg-[linear-gradient(to_bottom,transparent_0%,rgba(248,250,252,0.2)_30%,rgba(248,250,252,0.6)_50%,rgba(248,250,252,0.9)_66%,#f8fafc_78%)]' : 'bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.12)_30%,rgba(0,0,0,0.45)_50%,rgba(0,0,0,0.8)_66%,#000_78%)]'}`} />
            <div className={`absolute inset-x-0 top-[84%] h-[180vh] ${isLight ? 'bg-slate-50' : 'bg-black'}`} />
          </motion.div>

        </div>
      </section>

      {/* Main Content Sections (Layered OVER hero bushes with z-30) */}
      <div className="relative z-30">
        <section className="relative -mt-[32vh] px-6 py-10 md:-mt-[42vh]">
          <div className="mx-auto max-w-6xl divide-y divide-white/[0.06]">

            {/* Professional Technical Skills Breakdown Below Card */}
            <section id="skills" className="scroll-mt-24 py-16">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="rounded-full border border-forest-bright/40 bg-forest-bright/10 px-3 py-1 text-xs font-mono text-forest-bright uppercase">
                  Technical Expertise
                </span>
                <h2 className={`mt-3 text-3xl font-medium md:text-4xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Skills & Core Stack
                </h2>
                <p className={`mt-2 text-sm ${isLight ? 'text-slate-600' : 'text-white/55'}`}>Comprehensive breakdown of technical proficiencies</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {skillsList.map((sec, idx) => {
                  const IconComp = sec.icon;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-6 transition-all ${isLight ? 'border-slate-200 bg-white shadow-sm hover:shadow-md' : 'border-white/10 bg-[#0c0d10] hover:border-white/20'}`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-forest-bright/15 text-forest-bright border border-forest-bright/30">
                          <IconComp className="h-5 w-5" />
                        </div>
                        <h3 className={`text-base font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{sec.category}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sec.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className={`rounded-lg px-3 py-1 text-xs font-medium ${isLight ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-white/5 text-white/80 border border-white/10'}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Portfolio Project Showcase Section 1 */}
            <section id="projects" className="grid scroll-mt-24 items-center gap-10 py-20 md:grid-cols-2 md:gap-16">
              <motion.div
                style={{ y: cliTextY }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full border border-forest/40 bg-forest/15 px-2 py-0.5 text-[10px] uppercase font-mono tracking-wide text-forest-bright">
                    Featured Project
                  </span>
                </div>
                <h2 className={`lp-hero-heading text-[34px] leading-[1.1] ${isLight ? 'text-slate-900' : 'text-white'} md:text-[46px] lg:text-[52px]`}>
                  Introducing <span className="text-forest-bright">Dev Terminal CLI</span>
                </h2>
                <p className={`mt-4 max-w-md text-lg ${isLight ? 'text-slate-600' : 'text-white/55'}`}>
                  High-speed developer tooling & terminal automation platform built with TypeScript & Node.js.
                </p>

                <div className="mt-7">
                  <p className={`mb-3 text-xs uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/35'} font-mono`}>
                    Key Technologies
                  </p>
                  <div className="grid grid-cols-2 gap-x-7 gap-y-5 sm:grid-cols-3">
                    {['TypeScript', 'Node.js', 'Async IO', 'Docker', 'REST API'].map((tool) => (
                      <div key={tool} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-forest-bright" />
                        <span className={`truncate text-[14px] ${isLight ? 'text-slate-800' : 'text-white/85'}`}>{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="w-full max-w-sm">
                    <button
                      onClick={() => handleCopy('npm install -g developer-cli')}
                      className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left font-mono text-sm transition-colors ${isLight ? 'border-slate-300 bg-white text-slate-900 hover:border-slate-400' : 'border-white/10 bg-white/[0.03] text-white/90 hover:border-white/20'}`}
                    >
                      <span className="select-none text-forest-bright">$</span>
                      <span className="flex-1">npm install -g developer-cli</span>
                      <Copy className="h-4 w-4 opacity-50 transition-colors group-hover:opacity-100" />
                    </button>
                    <p className={`mt-2 text-[13px] ${isLight ? 'text-slate-500' : 'text-white/40'} font-sans`}>Open-source developer package with 10k+ downloads.</p>
                  </div>
                </div>
              </motion.div>

              {/* Terminal Code Mockup */}
              <motion.div
                style={{ y: cliTerminalY }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lp-gpu"
              >
                <div className="flex h-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0f] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
                    </span>
                    <span className="ml-1 text-[12px] text-white/45 font-mono">portfolio-cli — zsh</span>
                  </div>
                  <div className="min-h-0 flex-1 p-4 font-mono text-[13px] leading-relaxed">
                    <div className="mb-2.5 flex items-center justify-between text-[11px] text-white/30">
                      <span className="font-normal text-forest-bright/80">◆ developer</span>
                      <span>Alex Vance · ~/project</span>
                    </div>
                    <p className="text-white/85">
                      <span className="text-forest-bright">›</span> {typedText}
                      <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-forest-bright align-middle" />
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Web App Builder Project Showcase Section 2 */}
            <section className="grid scroll-mt-24 items-center gap-10 py-24 md:grid-cols-2 md:gap-16">
              <motion.div
                style={{ y: webTextY }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="md:order-2"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full border border-forest/40 bg-forest/15 px-2 py-0.5 text-[10px] uppercase font-mono tracking-wide text-forest-bright">
                    SaaS Platform
                  </span>
                </div>
                <h2 className={`lp-hero-heading text-[34px] leading-[1.1] ${isLight ? 'text-slate-900' : 'text-white'} md:text-[46px] lg:text-[52px]`}>
                  Introducing <span className="text-forest-bright">Cloud SaaS Dashboard</span>
                </h2>
                <p className={`mt-4 max-w-md text-lg ${isLight ? 'text-slate-600' : 'text-white/55'}`}>
                  Enterprise cloud analytics platform with real-time streaming charts and Stripe billing.
                </p>

                <div className="mt-7">
                  <p className={`mb-3 text-xs uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/35'} font-mono`}>
                    Architecture
                  </p>
                  <div className="grid grid-cols-2 gap-x-7 gap-y-5 sm:grid-cols-3">
                    {['Next.js 15', 'Framer Motion', 'Tailwind', 'Stripe', 'PostgreSQL'].map((tool) => (
                      <div key={tool} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-forest-bright" />
                        <span className={`truncate text-[14px] ${isLight ? 'text-slate-800' : 'text-white/85'}`}>{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-forest-bright px-8 h-12 text-base font-semibold text-black transition-all hover:bg-forest-bright/90 shadow-lg"
                  >
                    <span>Initiate Project</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>

              <motion.div
                style={{ y: webCardY }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="md:order-1 lp-gpu"
              >
                <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0f] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
                    </span>
                    <span className="ml-1 text-[12px] text-white/45 font-mono">cloud-analytics.app</span>
                  </div>
                  <div style={{ aspectRatio: '1024 / 577' }} className="relative bg-gradient-to-br from-neutral-900 to-black p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-forest-bright" />
                        <span className="text-xs font-mono text-white/70">cloud-analytics.app</span>
                      </div>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 font-mono">Production</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-white/5 animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-20 rounded bg-forest-bright/20 border border-forest-bright/40 flex items-center justify-center text-xs text-forest-bright font-mono">
                        View Demo
                      </div>
                      <div className="h-8 w-20 rounded bg-white/5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Experience Section */}
            <section id="experience" className="py-20">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="rounded-full border border-forest-bright/40 bg-forest-bright/10 px-3 py-1 text-xs font-mono text-forest-bright uppercase">
                  Career Track
                </span>
                <h2 className={`mt-3 text-3xl font-medium md:text-4xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Professional Experience
                </h2>
              </div>

              <div className="space-y-6 max-w-3xl mx-auto">
                {[
                  { title: 'Lead Full Stack Architect', company: 'Nexus AI Tech', period: '2023 - Present', desc: 'Heading front-end and back-end architecture for real-time AI dashboards. Reduced page load times by 65%.' },
                  { title: 'Senior Software Engineer', company: 'Vanguard Software', period: '2021 - 2023', desc: 'Architected microservices & Next.js web applications handling over 1.5M monthly active users.' },
                  { title: 'Full Stack Developer', company: 'CloudScale Labs', period: '2019 - 2021', desc: 'Built modern React & Node.js client portals with real-time WebSocket notifications.' }
                ].map((exp, eIdx) => (
                  <div
                    key={eIdx}
                    className={`rounded-2xl border p-6 transition-all ${isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-[#0c0d10]'}`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div>
                        <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{exp.title}</h3>
                        <p className="text-xs font-mono text-forest-bright">{exp.company}</p>
                      </div>
                      <span className={`text-xs font-mono rounded-full px-3 py-1 ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/50'}`}>{exp.period}</span>
                    </div>
                    <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-white/60'} mt-2`}>{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact & FAQ Section */}
            <section id="contact" className="py-24">
              <div className="text-center max-w-xl mx-auto mb-12">
                <h2 className={`text-3xl md:text-5xl font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Frequently Asked Questions</h2>
                <p className={`mt-3 text-base ${isLight ? 'text-slate-600' : 'text-white/55'}`}>Everything you need to know about initiating a technical partnership</p>
              </div>

              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border overflow-hidden transition-colors ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/[0.02]'}`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className={`w-full flex items-center justify-between p-5 text-left text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white/90'}`}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-forest-bright' : 'text-white/40'}`} />
                    </button>
                    {openFaq === idx && (
                      <div className={`px-5 pb-5 text-xs leading-relaxed border-t pt-3 whitespace-pre-line ${isLight ? 'text-slate-600 border-slate-100' : 'text-white/60 border-white/5'}`}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        </section>

        {/* Large Decorative Footer Artwork matching freebuff.com */}
        <section className={`relative overflow-hidden ${isLight ? 'bg-slate-50' : 'bg-black'} pt-20 pb-10`}>
          
          <div className="relative h-[48vh] w-full flex items-center justify-center">
            <img
              src="/hills-bg.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover brightness-[0.5] contrast-[1.1]"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${isLight ? 'from-slate-50 via-transparent to-slate-50' : 'from-black via-transparent to-black'}`} />
            
            <h2 className="lp-serif relative z-10 text-[120px] sm:text-[180px] md:text-[220px] font-normal tracking-tight text-white/90 select-none drop-shadow-2xl -translate-y-16">
              alex vance
            </h2>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-full">
              <img
                src="/bushes-fg.webp"
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover origin-bottom scale-[1.25] brightness-[0.6] saturate-[0.85]"
              />
              <div className={`absolute inset-0 bg-gradient-to-b ${isLight ? 'from-transparent via-slate-50/40 to-slate-50' : 'from-transparent via-black/40 to-black'}`} />
            </div>
          </div>

          {/* Bottom Footer Bar */}
          <footer className={`relative z-30 border-t ${isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-black text-white/40'} py-8 px-6 text-xs`}>
            <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <a href="#about" className="hover:text-forest-bright transition-colors">About</a>
                <a href="#skills" className="hover:text-forest-bright transition-colors">Skills</a>
                <a href="#projects" className="hover:text-forest-bright transition-colors">Projects</a>
                <a href="#experience" className="hover:text-forest-bright transition-colors">Experience</a>
                <a href="#contact" className="hover:text-forest-bright transition-colors">Contact</a>
              </div>
              <div className="flex items-center gap-4">
                <span>© 2026 Alex Vance. All rights reserved.</span>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-forest-bright transition-colors">GitHub</a>
              </div>
            </div>
          </footer>
        </section>
      </div>

    </div>
  );
}
