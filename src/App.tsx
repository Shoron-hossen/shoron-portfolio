import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ChevronDown,
  ArrowRight,
  Mail,
  Sun,
  Moon,
  CheckCircle2,
  Cpu,
  Server,
  Layout,
  Download,
  Send,
  Lock,
  FolderKanban
} from 'lucide-react';
import ProjectsPage from './pages/ProjectsPage';
import AdminPage from './pages/AdminPage';
import { PortfolioService } from './services/portfolioService';
import type { PersonalInfo } from './services/portfolioService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'projects' | 'admin'>('home');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Personal Info & Projects loaded dynamically
  const [info, setInfo] = useState<PersonalInfo>(PortfolioService.getPersonalInfo());

  // Email message form state under hero section
  const [emailForm, setEmailForm] = useState({ name: '', email: '', message: '' });
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  useEffect(() => {
    setInfo(PortfolioService.getPersonalInfo());

    const path = window.location.pathname;
    if (path === '/projects') setCurrentPage('projects');
    if (path === '/admin') setCurrentPage('admin');
  }, []);

  // Scroll animations setup
  const { scrollY } = useScroll();

  const headerBgOpacity = useTransform(scrollY, [0, 80], [0, 0.95]);
  const heroY = useTransform(scrollY, [0, 600], [0, -40]);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.message) return;
    setEmailSentNotice(true);
    setEmailForm({ name: '', email: '', message: '' });
    setTimeout(() => setEmailSentNotice(false), 4000);
  };

  const skillsList = [
    { category: 'Frontend & UI Engineering', icon: Layout, skills: ['React 19', 'Next.js App Router', 'TypeScript', 'TailwindCSS v4', 'Framer Motion', 'WebSockets'] },
    { category: 'Backend & System Architecture', icon: Server, skills: ['Node.js', 'Express', 'Python / Django', 'GraphQL', 'REST Architecture', 'PostgreSQL / MongoDB'] },
    { category: 'Cloud, DevOps & Databases', icon: Cpu, skills: ['Firebase', 'AWS Cloud Services', 'Docker Containers', 'Redis Caching', 'CI/CD Pipelines', 'Netlify / Vercel'] }
  ];

  const faqs = [
    {
      q: `What services does ${info.name} offer?`,
      a: `I specialize in full-stack web application development, custom admin dashboards, Next.js / React microfrontends, API architecture, and database integrations connected with cloud platforms like Firebase & AWS.`
    },
    {
      q: 'How can I request a project build or hire you?',
      a: `You can reach out directly using the instant email form below the navigation bar, email me directly at ${info.email}, or connect via LinkedIn & GitHub.`
    },
    {
      q: 'Can I add or manage projects dynamically on this site?',
      a: 'Yes! Navigate to the Admin Dashboard (or /admin) to manage all project cards, upload credentials, update personal details, and sync with Firebase.'
    }
  ];

  const isLight = theme === 'light';

  // Render Sub-pages if active
  if (currentPage === 'projects') {
    return <ProjectsPage onBackHome={() => setCurrentPage('home')} isLight={isLight} />;
  }

  if (currentPage === 'admin') {
    return <AdminPage onBackHome={() => setCurrentPage('home')} />;
  }

  return (
    <div className={`${isLight ? 'bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-900' : 'dark bg-black text-white selection:bg-emerald-900 selection:text-emerald-200'} relative min-h-screen font-sans transition-colors duration-300 overflow-x-hidden`}>
      
      {/* Dynamic Header */}
      <header className="lp-gpu fixed inset-x-0 top-0 z-50 transition-all">
        <motion.div
          style={{ opacity: headerBgOpacity }}
          className={`pointer-events-none absolute inset-0 ${isLight ? 'bg-white/85 shadow-sm' : 'bg-gradient-to-b from-black/90 via-black/55 to-transparent'} backdrop-blur-md transition-colors`}
        />
        <div className="relative flex min-w-0 items-center justify-between gap-2 sm:gap-3 mx-auto max-w-6xl px-6 py-3.5 sm:px-10 lg:px-12">
          
          {/* Brand Logo */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <a href="/" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} className="group flex flex-shrink-0 items-center gap-2.5 opacity-90 transition-opacity duration-200 hover:opacity-100">
              <div className="h-7 w-7 rounded-lg bg-forest-bright/20 border border-forest-bright/40 flex items-center justify-center font-bold text-forest-bright text-xs shadow-sm">
                SH
              </div>
              <span className={`lp-serif text-lg tracking-tight font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {info.name} <span className="text-xs font-mono font-normal opacity-60 text-forest-bright">.dev</span>
              </span>
            </a>
          </div>

          {/* Navigation Links */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <nav className="hidden md:flex items-center space-x-1 rounded-full p-1 border border-white/10 bg-white/[0.04] backdrop-blur-md">
              <a href="#about" className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors ${isLight ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>About</a>
              
              <button
                onClick={() => setCurrentPage('projects')}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] text-forest-bright hover:bg-white/10 transition-colors font-medium"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                Projects Page
              </button>

              <a href="#skills" className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors ${isLight ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                Skills <span className="text-[8px] font-semibold uppercase leading-none tracking-wide rounded-full bg-forest/15 px-1.5 py-0.5 text-forest-bright/90 border border-forest/40">expert</span>
              </a>
              
              <a href="#contact" className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors ${isLight ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>Contact</a>
              
              <button
                onClick={() => setCurrentPage('admin')}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] bg-forest-bright/15 text-forest-bright border border-forest-bright/30 hover:bg-forest-bright/30 transition-colors ml-1 font-semibold"
                title="Admin Dashboard"
              >
                <Lock className="w-3 h-3" /> Admin
              </button>
            </nav>

            <button
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              className={`p-2 rounded-full border transition-all ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200' : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'}`}
              title={`Switch to ${isLight ? 'Dark' : 'White'} theme`}
            >
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-300" />}
            </button>

            <a
              href="#contact-form"
              className="items-center gap-1.5 rounded-full bg-forest-bright px-4 py-1.5 text-xs font-semibold text-black hover:bg-forest-bright/90 transition-all shadow-md hidden sm:inline-flex"
            >
              <span>Quick Contact</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden">
        
        {/* Parallax Background */}
        <div className={`pointer-events-none absolute inset-0 ${isLight ? 'bg-[linear-gradient(to_bottom,#f8fafc_0%,#e2e8f0_40%,#cbd5e1_70%,#94a3b8_100%)]' : 'bg-[linear-gradient(to_bottom,#03060a_0%,#060c12_24%,#101f23_44%,#172a29_57%,#121a1a_71%,#070a0b_86%,#000000_100%)]'} transition-colors`}></div>

        {/* Hero Details */}
        <div id="about" className="relative z-30 mx-auto flex max-w-6xl flex-col items-center px-6 pt-32 text-left md:pt-36">
          <motion.div
            style={{ y: heroY }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lp-gpu grid w-full items-center gap-10 md:grid-cols-12"
          >
            {/* Left Column: Name & Details */}
            <div className="flex flex-col items-start text-left md:col-span-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-forest-bright/30 bg-forest-bright/10 px-3 py-1 text-xs font-mono text-forest-bright">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest-bright opacity-60"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-forest-bright"></span>
                </span>
                <span>{info.role}</span>
              </div>

              <h1 className={`lp-hero-heading text-[38px] font-medium leading-[1.1] ${isLight ? 'text-slate-900' : 'text-white'} md:text-[56px] lg:text-[62px]`}>
                {info.name}
              </h1>

              <p className={`mt-4 max-w-xl text-sm ${isLight ? 'text-slate-700' : 'text-white/75'} md:text-base leading-relaxed`}>
                {info.bio}
              </p>

              {/* Download CV & Action buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={info.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-forest-bright px-5 py-2.5 text-xs font-semibold text-black hover:bg-forest-bright/90 transition-all shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  <span>Download CV / Resume</span>
                </a>

                <button
                  onClick={() => setCurrentPage('projects')}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-all"
                >
                  <FolderKanban className="h-4 w-4 text-forest-bright" />
                  <span>View Projects</span>
                </button>
              </div>

              {/* Social Links */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">Social Links:</span>
                {info.socials.github && (
                  <a href={info.socials.github} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-mono border border-white/10">
                    GitHub
                  </a>
                )}
                {info.socials.linkedin && (
                  <a href={info.socials.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-mono border border-white/10">
                    LinkedIn
                  </a>
                )}
                {info.socials.facebook && (
                  <a href={info.socials.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-mono border border-white/10">
                    Facebook
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Developer Photo */}
            <div className="flex justify-center md:col-span-5">
              <div className="relative group max-w-sm w-full">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-forest-bright to-emerald-500 opacity-30 blur-lg group-hover:opacity-50 transition-opacity" />
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-slate-900/90 shadow-2xl p-2">
                  <img
                    src={info.avatarUrl}
                    alt={info.name}
                    className="w-full h-80 object-cover rounded-2xl"
                  />
                  <div className="p-4 text-center">
                    <h3 className="text-base font-bold text-white">{info.name}</h3>
                    <p className="text-xs text-forest-bright font-mono">{info.location}</p>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>

          {/* QUICK EMAIL MESSAGE OPTION UNDER NAVBAR / HERO */}
          <div id="contact-form" className="w-full max-w-4xl mt-12 mb-16 p-6 rounded-2xl bg-slate-950/80 border border-white/15 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-forest-bright" />
                <h3 className="text-base font-bold text-white">Send Direct Message to {info.name}</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Direct Inbox Delivery</span>
            </div>

            {emailSentNotice ? (
              <div className="p-4 rounded-xl bg-forest-bright/10 border border-forest-bright/40 text-forest-bright text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Message sent successfully! I will reply to your email shortly.
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-4">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={emailForm.name}
                    onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-forest-bright"
                  />
                </div>
                <div className="md:col-span-4">
                  <input
                    type="email"
                    required
                    placeholder="Your Email Address"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-forest-bright"
                  />
                </div>
                <div className="md:col-span-12">
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe your project requirement or inquiry..."
                    value={emailForm.message}
                    onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-forest-bright"
                  />
                </div>
                <div className="md:col-span-12 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-forest-bright text-black font-bold text-xs px-6 py-2 rounded-xl hover:bg-forest-bright/90 transition-colors shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Email Message
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Parallax Layers */}
        <div className="relative z-20 h-[50vh] min-h-[350px] w-full">
          <img src="/sky-bg.webp" alt="" className="absolute inset-0 h-full w-full object-cover brightness-[0.5]" />
          <img src="/hills-bg.webp" alt="" className="absolute inset-0 h-full w-full object-cover brightness-[0.7]" />
          <img src="/bushes-fg.webp" alt="" className="absolute inset-0 h-full w-full object-cover brightness-[0.9]" />
          <div className={`absolute inset-0 bg-gradient-to-b ${isLight ? 'from-transparent via-slate-50/70 to-slate-50' : 'from-transparent via-black/70 to-black'}`} />
        </div>

        {/* Content Body */}
        <section id="skills" className={`relative z-30 ${isLight ? 'bg-slate-50' : 'bg-black'} py-16`}>
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
            
            {/* Skills & Core Stack */}
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="rounded-full border border-forest-bright/40 bg-forest-bright/10 px-3 py-1 text-xs font-mono text-forest-bright uppercase">
                Technical Expertise
              </span>
              <h2 className={`mt-3 text-3xl font-medium md:text-4xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Skills & Core Stack
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-20">
              {skillsList.map((group, idx) => {
                const IconComp = group.icon;
                return (
                  <div key={idx} className={`rounded-2xl border p-6 ${isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-[#0c0d10]'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-forest-bright/10 border border-forest-bright/30 text-forest-bright">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{group.category}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map((skill, sIdx) => (
                        <span key={sIdx} className={`text-xs px-3 py-1 rounded-full border ${isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 bg-white/5 text-white/80'}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Featured Projects Highlight Banner */}
            <div id="projects" className="p-8 rounded-3xl bg-slate-900 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 mb-20">
              <div>
                <span className="text-xs font-mono text-forest-bright uppercase tracking-wider">Dedicated Showcase</span>
                <h3 className="text-2xl font-bold text-white mt-1">Explore Full Project Catalog</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Browse through all live full-stack projects, AI playground tools, and open source repositories with live demos and filter options.
                </p>
              </div>

              <button
                onClick={() => setCurrentPage('projects')}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-forest-bright text-black font-bold text-xs hover:bg-forest-bright/90 transition-all shadow-lg whitespace-nowrap"
              >
                <span>Open Dedicated Projects Page</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Contact & FAQ */}
            <section id="contact" className="py-12">
              <div className="text-center max-w-xl mx-auto mb-12">
                <h2 className={`text-3xl md:text-4xl font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Frequently Asked Questions</h2>
              </div>

              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className={`rounded-xl border overflow-hidden transition-colors ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/[0.02]'}`}>
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

      </section>

      {/* Footer */}
      <section className={`relative overflow-hidden ${isLight ? 'bg-slate-50' : 'bg-black'} pt-16 pb-10`}>
        <footer className={`relative z-30 border-t ${isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-black text-white/40'} py-8 px-6 text-xs`}>
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <a href="#about" className="hover:text-forest-bright transition-colors">About</a>
              <button onClick={() => setCurrentPage('projects')} className="hover:text-forest-bright transition-colors">Projects</button>
              <a href="#skills" className="hover:text-forest-bright transition-colors">Skills</a>
              <button onClick={() => setCurrentPage('admin')} className="hover:text-forest-bright transition-colors">Admin Dashboard</button>
            </div>
            <div className="flex items-center gap-4">
              <span>© 2026 {info.name}. All rights reserved.</span>
              {info.socials.github && (
                <a href={info.socials.github} target="_blank" rel="noreferrer" className="hover:text-forest-bright transition-colors">GitHub</a>
              )}
            </div>
          </div>
        </footer>
      </section>

    </div>
  );
}
