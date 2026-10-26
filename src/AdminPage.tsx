import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  User,
  FolderPlus,
  CheckCircle,
  Lock,
  Settings,
  Briefcase,
  HelpCircle,
  Cpu,
  Upload,
  Image,
  Eye,
  RotateCcw,
  X,
  Pencil,
  ExternalLink,
  Globe,
  Building2,
  Camera,
  BookOpen,
  Code2,
  Sparkles,
} from 'lucide-react';
import { PortfolioStore, DEFAULT_PORTFOLIO_DATA, type PortfolioData } from './portfolioStore';
import { CloudflareR2, type R2Config } from './cloudflareR2';
import GithubIcon from './components/GithubIcon';
import MediaUploadField from './components/MediaUploadField';

interface AdminPageProps {
  onBackHome?: () => void;
}

type TabKey = 'profile' | 'hero' | 'skills' | 'experience' | 'ventures' | 'modeling' | 'faq' | 'projects' | 'settings';

const inputClass = "w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-forest-bright/60 focus:ring-1 focus:ring-forest-bright/30 transition-all";
const labelClass = "block text-xs font-medium text-slate-300 mb-1.5";
const cardClass = "bg-slate-900/80 border border-white/10 rounded-2xl p-6";

interface InputFieldProps {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  textarea = false,
  rows = 3
}: InputFieldProps) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {textarea ? (
        <textarea
          rows={rows}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

export default function AdminPage({ onBackHome }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  
  const [data, setData] = useState<PortfolioData>(PortfolioStore.getLocal());
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // R2 Config
  const [r2Config, setR2Config] = useState<R2Config>(CloudflareR2.getConfig());

  // New Project State
  const [pTitle, setPTitle] = useState('');
  const [pSubtitle, setPSubtitle] = useState('');
  const [pCategory, setPCategory] = useState('Full Stack');
  const [pDesc, setPDesc] = useState('');
  const [pTechs, setPTechs] = useState('');
  const [pImage, setPImage] = useState('');
  const [pLive, setPLive] = useState('');
  const [pGithub, setPGithub] = useState('');

  // Editing project ID
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = PortfolioStore.subscribeToData((updated) => {
      setData(updated);
    });
    return () => unsub?.();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'shoron2026') {
      setIsAuthenticated(true);
    } else {
      setErrorMsg('Incorrect password.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const showNotice = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const sanitizeUrl = (url?: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const sanitized: PortfolioData = {
        ...data,
        cvUrl: sanitizeUrl(data.cvUrl),
        socials: {
          github: sanitizeUrl(data.socials.github),
          linkedin: sanitizeUrl(data.socials.linkedin),
          facebook: sanitizeUrl(data.socials.facebook),
          instagram: sanitizeUrl(data.socials.instagram),
          twitter: sanitizeUrl(data.socials.twitter),
          youtube: sanitizeUrl(data.socials.youtube),
        }
      };
      setData(sanitized);
      await PortfolioStore.saveData(sanitized);
      showNotice('All changes saved successfully to Cloudflare D1!');
    } catch {
      showError('Failed to save. Check your connection.');
    }
    setIsSaving(false);
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset ALL data to defaults? This cannot be undone.')) {
      await PortfolioStore.resetToDefaults();
      setData(DEFAULT_PORTFOLIO_DATA);
      showNotice('Reset to default data.');
    }
  };


  // Save R2 config
  const handleSaveR2Config = () => {
    CloudflareR2.saveConfig(r2Config);
    showNotice('Cloudflare R2 configuration saved!');
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pDesc) return;

    const newProject = {
      id: 'proj-' + Date.now(),
      title: pTitle,
      subtitle: pSubtitle || 'Web Project',
      description: pDesc,
      category: pCategory,
      technologies: pTechs.split(',').map(t => t.trim()).filter(Boolean),
      imageUrl: pImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000',
      liveUrl: pLive,
      githubUrl: pGithub
    };

    const updated = {
      ...data,
      projects: [newProject, ...data.projects]
    };

    setData(updated);
    await PortfolioStore.saveData(updated);

    setPTitle(''); setPSubtitle(''); setPDesc('');
    setPTechs(''); setPImage(''); setPLive(''); setPGithub('');
    showNotice('Project added!');
  };

  const handleUpdateProject = async (id: string, updates: Partial<PortfolioData['projects'][0]>) => {
    const updated = {
      ...data,
      projects: data.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    };
    setData(updated);
    await PortfolioStore.saveData(updated);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Delete this project?')) {
      const updated = {
        ...data,
        projects: data.projects.filter(p => p.id !== id)
      };
      setData(updated);
      await PortfolioStore.saveData(updated);
      showNotice('Project removed.');
    }
  };


  // ── Tabs Config ──

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'hero', label: 'Hero Section', icon: Eye },
    { key: 'skills', label: 'Skills', icon: Cpu },
    { key: 'experience', label: 'Resume & Education', icon: BookOpen },
    { key: 'ventures', label: 'Ventures', icon: Building2 },
    { key: 'modeling', label: 'Modeling', icon: Camera },
    { key: 'faq', label: 'FAQ', icon: HelpCircle },
    { key: 'projects', label: 'Projects', icon: FolderPlus },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  // ── Login Screen ──

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-white text-black mb-3 shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            <p className="text-xs text-slate-400 mt-1">Manage your portfolio content & settings</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
            >
              Enter Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBackHome || (() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); })}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ──

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-white/10 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Admin Dashboard</h1>
              <p className="text-[11px] text-slate-400 font-mono">Portfolio CMS · Cloudflare D1 + R2</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save All'}
            </button>
            <button
              onClick={onBackHome || (() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); })}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-full border border-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> View Site
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Notifications */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-3">
            <X className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === key ? 'bg-white text-black shadow-xs' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {key === 'projects' && <span className="ml-1 bg-black/20 text-[10px] px-1.5 py-0.5 rounded-full">{data.projects.length}</span>}
              {key === 'ventures' && <span className="ml-1 bg-black/20 text-[10px] px-1.5 py-0.5 rounded-full">{(data.ventures || []).length}</span>}
              {key === 'modeling' && <span className="ml-1 bg-black/20 text-[10px] px-1.5 py-0.5 rounded-full">{(data.modelingPhotos || []).length}</span>}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            TAB: Profile
           ══════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={`lg:col-span-8 ${cardClass} space-y-5`}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-white" /> Profile Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Full Name" value={data.name} onChange={(v) => setData({ ...data, name: v })} />
                <InputField label="Primary Role / Title" value={data.role} onChange={(v) => setData({ ...data, role: v })} />
              </div>

              <InputField label="Tagline / Sub-Role" value={data.subRole} onChange={(v) => setData({ ...data, subRole: v })} />

              <InputField label="Bio / About Text" value={data.bio} onChange={(v) => setData({ ...data, bio: v })} textarea rows={4} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Email Address" value={data.email} onChange={(v) => setData({ ...data, email: v })} type="email" />
                <InputField label="Phone Number" value={data.phone || ''} onChange={(v) => setData({ ...data, phone: v })} type="tel" />
                <InputField label="Location" value={data.location} onChange={(v) => setData({ ...data, location: v })} />
              </div>

              <MediaUploadField
                label="CV / Resume Document (PDF / Link)"
                value={data.cvUrl}
                onChange={(v) => setData({ ...data, cvUrl: v })}
                folder="resumes"
                accept=".pdf,.doc,.docx,application/pdf"
                isDocument={true}
                placeholder="https://... or upload PDF directly to R2"
                helperText="Upload your Resume / CV PDF directly to Cloudflare R2 for zero-broken-link downloads."
              />

              <h4 className="text-xs font-bold text-white mt-6 mb-3 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> Social & Profile Links
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="GitHub" value={data.socials.github} onChange={(v) => setData({ ...data, socials: { ...data.socials, github: v } })} placeholder="https://github.com/..." />
                <InputField label="LinkedIn" value={data.socials.linkedin} onChange={(v) => setData({ ...data, socials: { ...data.socials, linkedin: v } })} placeholder="https://linkedin.com/in/..." />
                <InputField label="Facebook" value={data.socials.facebook} onChange={(v) => setData({ ...data, socials: { ...data.socials, facebook: v } })} placeholder="https://facebook.com/..." />
                <InputField label="Instagram" value={data.socials.instagram || ''} onChange={(v) => setData({ ...data, socials: { ...data.socials, instagram: v } })} placeholder="https://instagram.com/..." />
                <InputField label="Twitter / X" value={data.socials.twitter || ''} onChange={(v) => setData({ ...data, socials: { ...data.socials, twitter: v } })} placeholder="https://x.com/..." />
                <InputField label="YouTube / Other" value={data.socials.youtube || ''} onChange={(v) => setData({ ...data, socials: { ...data.socials, youtube: v } })} placeholder="https://youtube.com/..." />
              </div>

              <button onClick={handleSaveAll} disabled={isSaving} className="w-full py-3 bg-forest-bright text-black font-bold text-sm rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer">
                <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            {/* Profile Photo Card */}
            <div className={`lg:col-span-4 ${cardClass} h-fit space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Image className="w-4 h-4 text-forest-bright" /> Profile Photo (Avatar)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest-bright/10 text-forest-bright border border-forest-bright/30">
                  R2 Enabled
                </span>
              </div>

              <MediaUploadField
                label="Profile Portrait / Avatar"
                value={data.avatarUrl}
                onChange={(url) => setData({ ...data, avatarUrl: url })}
                folder="avatars"
                previewAspect="square"
                helperText="Square 1:1 portrait recommended. Upload directly to Cloudflare R2 for permanent CDN uptime."
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: Hero Section
           ══════════════════════════════════════════ */}
        {activeTab === 'hero' && (
          <div className={`max-w-3xl ${cardClass} space-y-5`}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-forest-bright" /> Hero Section Content
            </h3>

            <InputField label="Status Badge Text" value={data.heroStatusBadge} onChange={(v) => setData({ ...data, heroStatusBadge: v })} placeholder="e.g. Full Stack Developer" />
            <InputField label="Sub-Heading" value={data.heroSubHeading} onChange={(v) => setData({ ...data, heroSubHeading: v })} placeholder="e.g. Building Scalable Web Platforms" />

            <h4 className="text-xs font-bold text-white mt-6 mb-3">Quick Stats (Hero Card Header)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="Stat 1" value={data.heroStats.label1} onChange={(v) => setData({ ...data, heroStats: { ...data.heroStats, label1: v } })} />
              <InputField label="Stat 2" value={data.heroStats.label2} onChange={(v) => setData({ ...data, heroStats: { ...data.heroStats, label2: v } })} />
              <InputField label="Stat 3 (Highlighted)" value={data.heroStats.label3} onChange={(v) => setData({ ...data, heroStats: { ...data.heroStats, label3: v } })} />
            </div>

            <h4 className="text-xs font-bold text-white mt-6 mb-3">Hero Feature Cards (3 cards)</h4>
            {data.heroCards.map((card, idx) => (
              <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-forest-bright">Card {idx + 1}</span>
                  <select
                    value={card.icon}
                    onChange={(e) => {
                      const updated = [...data.heroCards];
                      updated[idx] = { ...card, icon: e.target.value };
                      setData({ ...data, heroCards: updated });
                    }}
                    className="bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    {['Layout', 'Server', 'Cpu', 'Terminal', 'Award', 'Globe', 'Code2'].map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <InputField label="Title" value={card.title} onChange={(v) => {
                  const updated = [...data.heroCards];
                  updated[idx] = { ...card, title: v };
                  setData({ ...data, heroCards: updated });
                }} />
                <InputField label="Description" value={card.description} onChange={(v) => {
                  const updated = [...data.heroCards];
                  updated[idx] = { ...card, description: v };
                  setData({ ...data, heroCards: updated });
                }} textarea rows={2} />
              </div>
            ))}

            <h4 className="text-xs font-bold text-white mt-6 mb-3">Terminal Typewriter Text</h4>
            <InputField label="Terminal Code Line" value={data.terminalText} onChange={(v) => setData({ ...data, terminalText: v })} placeholder="const profile = { ... };" />

            <button onClick={handleSaveAll} disabled={isSaving} className="w-full py-3 bg-forest-bright text-black font-bold text-sm rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center justify-center gap-2 mt-4">
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Hero Content'}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: Skills
           ══════════════════════════════════════════ */}
        {activeTab === 'skills' && (
          <div className={`max-w-3xl ${cardClass} space-y-5`}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-forest-bright" /> Skills Section
            </h3>

            <InputField label="Section Title" value={data.skillsSectionTitle} onChange={(v) => setData({ ...data, skillsSectionTitle: v })} />
            <InputField label="Section Subtitle" value={data.skillsSectionSubtitle} onChange={(v) => setData({ ...data, skillsSectionSubtitle: v })} />

            <h4 className="text-xs font-bold text-white mt-6 mb-3">Skill Categories</h4>
            {data.skillCategories.map((cat, idx) => (
              <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-forest-bright">Category {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={cat.icon}
                      onChange={(e) => {
                        const updated = [...data.skillCategories];
                        updated[idx] = { ...cat, icon: e.target.value };
                        setData({ ...data, skillCategories: updated });
                      }}
                      className="bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      {['Layout', 'Server', 'Cpu', 'Award', 'Terminal', 'Globe'].map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const updated = data.skillCategories.filter((_, i) => i !== idx);
                        setData({ ...data, skillCategories: updated });
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <InputField label="Category Name" value={cat.category} onChange={(v) => {
                  const updated = [...data.skillCategories];
                  updated[idx] = { ...cat, category: v };
                  setData({ ...data, skillCategories: updated });
                }} />
                <InputField label="Skills (comma separated)" value={cat.skills.join(', ')} onChange={(v) => {
                  const updated = [...data.skillCategories];
                  updated[idx] = { ...cat, skills: v.split(',').map(s => s.trim()).filter(Boolean) };
                  setData({ ...data, skillCategories: updated });
                }} />
              </div>
            ))}

            <button
              onClick={() => {
                setData({
                  ...data,
                  skillCategories: [...data.skillCategories, { category: 'New Category', icon: 'Layout', skills: ['Skill 1', 'Skill 2'] }]
                });
              }}
              className="w-full py-2.5 text-xs font-semibold rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-forest-bright/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>

            <button onClick={handleSaveAll} disabled={isSaving} className="w-full py-3 bg-forest-bright text-black font-bold text-sm rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center justify-center gap-2 mt-4">
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Skills'}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: Resume & Education
           ══════════════════════════════════════════ */}
        {activeTab === 'experience' && (
          <div className={`max-w-4xl ${cardClass} space-y-8`}>
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#ffdb70]" /> Resume & Experience CMS
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your Education credentials, Professional Work Experience, and Skill Progress percentages displayed on the homepage Resume section.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[#ffdb70]">
                  {(data.educations || []).length} Edu · {(data.experiences || []).length} Exp
                </span>
              </div>
            </div>

            {/* Section Heading & CV Download Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Resume Section Title (Homepage)"
                value={data.experienceSectionTitle || 'Resume'}
                onChange={(v) => setData({ ...data, experienceSectionTitle: v })}
                placeholder="Resume"
              />
              <MediaUploadField
                label="CV / Resume Document (PDF / Link)"
                value={data.cvUrl || ''}
                onChange={(v) => setData({ ...data, cvUrl: v })}
                folder="resumes"
                accept=".pdf,.doc,.docx,application/pdf"
                isDocument={true}
                placeholder="https://... or upload PDF directly to R2"
                helperText="Upload your Resume / CV PDF directly to Cloudflare R2 for instant, permanent recruiter downloads."
              />
            </div>

            {/* ──────────────────────────────────────────
                1. EDUCATION SECTION
               ────────────────────────────────────────── */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#ffdb70]" /> 1. Education History
                </h4>
                <span className="text-xs font-mono text-[#ffdb70]">
                  {(data.educations && data.educations.length > 0 ? data.educations : DEFAULT_PORTFOLIO_DATA.educations || []).length} Degrees / Certificates
                </span>
              </div>

              {(data.educations && data.educations.length > 0 ? data.educations : DEFAULT_PORTFOLIO_DATA.educations || []).map((edu, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#ffdb70] font-bold">Education #{idx + 1}</span>
                      <span className="text-xs text-slate-300 font-medium truncate max-w-xs">{edu.title || 'Untitled Degree'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = data.educations && data.educations.length > 0 ? data.educations : (DEFAULT_PORTFOLIO_DATA.educations || []);
                        const updated = current.filter((_, i) => i !== idx);
                        setData({ ...data, educations: updated });
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete education entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <InputField
                      label="Degree / Certificate Title"
                      value={edu.title}
                      placeholder="e.g. B.Sc. in Computer Science and Engineering"
                      onChange={(v) => {
                        const current = data.educations && data.educations.length > 0 ? [...data.educations] : [...(DEFAULT_PORTFOLIO_DATA.educations || [])];
                        current[idx] = { ...edu, title: v };
                        setData({ ...data, educations: current });
                      }}
                    />
                    <InputField
                      label="Institution / University"
                      value={edu.institution}
                      placeholder="e.g. Green University of Bangladesh, Dhaka"
                      onChange={(v) => {
                        const current = data.educations && data.educations.length > 0 ? [...data.educations] : [...(DEFAULT_PORTFOLIO_DATA.educations || [])];
                        current[idx] = { ...edu, institution: v };
                        setData({ ...data, educations: current });
                      }}
                    />
                  </div>

                  <InputField
                    label="Academic Period / Years"
                    value={edu.period}
                    placeholder="e.g. 2022 — Present"
                    onChange={(v) => {
                      const current = data.educations && data.educations.length > 0 ? [...data.educations] : [...(DEFAULT_PORTFOLIO_DATA.educations || [])];
                      current[idx] = { ...edu, period: v };
                      setData({ ...data, educations: current });
                    }}
                  />

                  <InputField
                    label="Description & Highlights"
                    value={edu.description}
                    placeholder="Courses, achievements, and academic focuses..."
                    textarea
                    rows={2}
                    onChange={(v) => {
                      const current = data.educations && data.educations.length > 0 ? [...data.educations] : [...(DEFAULT_PORTFOLIO_DATA.educations || [])];
                      current[idx] = { ...edu, description: v };
                      setData({ ...data, educations: current });
                    }}
                  />

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        await handleSaveAll();
                        showNotice(`Saved education "${edu.title || 'Untitled'}"!`);
                      }}
                      className="px-3.5 py-1.5 bg-[#ffdb70] text-black font-semibold text-xs rounded-xl hover:bg-[#ffdb70]/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Education
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const current = data.educations && data.educations.length > 0 ? [...data.educations] : [...(DEFAULT_PORTFOLIO_DATA.educations || [])];
                  current.push({
                    title: '',
                    institution: '',
                    period: '',
                    description: '',
                  });
                  setData({ ...data, educations: current });
                }}
                className="w-full py-2.5 text-xs font-semibold rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-[#ffdb70] transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5"
              >
                <Plus className="w-4 h-4 text-[#ffdb70]" /> Add Education Entry
              </button>
            </div>

            {/* ──────────────────────────────────────────
                2. WORK EXPERIENCE SECTION
               ────────────────────────────────────────── */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#ffdb70]" /> 2. Professional Work Experience
                </h4>
                <span className="text-xs font-mono text-[#ffdb70]">
                  {(data.experiences || []).length} Roles
                </span>
              </div>

              {(data.experiences || []).map((exp, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#ffdb70] font-bold">Experience #{idx + 1}</span>
                      <span className="text-xs text-slate-300 font-medium truncate max-w-xs">{exp.title || 'Untitled Role'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = data.experiences.filter((_, i) => i !== idx);
                        setData({ ...data, experiences: updated });
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete experience entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <InputField
                      label="Job Title / Role"
                      value={exp.title}
                      placeholder="e.g. Java & Backend Developer"
                      onChange={(v) => {
                        const updated = [...data.experiences];
                        updated[idx] = { ...exp, title: v };
                        setData({ ...data, experiences: updated });
                      }}
                    />
                    <InputField
                      label="Company / Client"
                      value={exp.company}
                      placeholder="e.g. Ingoude Company / Freelance"
                      onChange={(v) => {
                        const updated = [...data.experiences];
                        updated[idx] = { ...exp, company: v };
                        setData({ ...data, experiences: updated });
                      }}
                    />
                  </div>

                  <InputField
                    label="Employment Period"
                    value={exp.period}
                    placeholder="e.g. 2023 — Present"
                    onChange={(v) => {
                      const updated = [...data.experiences];
                      updated[idx] = { ...exp, period: v };
                      setData({ ...data, experiences: updated });
                    }}
                  />

                  <InputField
                    label="Job Responsibilities & Impact"
                    value={exp.description}
                    placeholder="Technologies implemented, systems scaled, and achievements..."
                    textarea
                    rows={2}
                    onChange={(v) => {
                      const updated = [...data.experiences];
                      updated[idx] = { ...exp, description: v };
                      setData({ ...data, experiences: updated });
                    }}
                  />

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        await handleSaveAll();
                        showNotice(`Saved experience "${exp.title || 'Untitled'}"!`);
                      }}
                      className="px-3.5 py-1.5 bg-[#ffdb70] text-black font-semibold text-xs rounded-xl hover:bg-[#ffdb70]/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Experience
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setData({
                    ...data,
                    experiences: [...data.experiences, { title: '', company: '', period: '', description: '' }]
                  });
                }}
                className="w-full py-2.5 text-xs font-semibold rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-[#ffdb70] transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5"
              >
                <Plus className="w-4 h-4 text-[#ffdb70]" /> Add Work Experience Entry
              </button>
            </div>

            {/* ──────────────────────────────────────────
                3. MY SKILLS PROGRESS PERCENTAGES
               ────────────────────────────────────────── */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#ffdb70]" /> 3. My Skills (Percentage Progress Bars)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controls the animated percentage progress bars displayed in the Resume section.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#ffdb70]">
                  {(data.skillPercentages && data.skillPercentages.length > 0 ? data.skillPercentages : DEFAULT_PORTFOLIO_DATA.skillPercentages || []).length} Skills
                </span>
              </div>

              <div className="space-y-3">
                {(data.skillPercentages && data.skillPercentages.length > 0 ? data.skillPercentages : DEFAULT_PORTFOLIO_DATA.skillPercentages || []).map((skill, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-3.5 sm:p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Skill Name & Domain</label>
                        <input
                          type="text"
                          value={skill.name}
                          placeholder="e.g. Flutter & Dart (Mobile App Development)"
                          onChange={(e) => {
                            const current = data.skillPercentages && data.skillPercentages.length > 0 ? [...data.skillPercentages] : [...(DEFAULT_PORTFOLIO_DATA.skillPercentages || [])];
                            current[idx] = { ...skill, name: e.target.value };
                            setData({ ...data, skillPercentages: current });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div className="w-24 sm:w-28 shrink-0">
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Percentage (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={skill.percentage}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            const current = data.skillPercentages && data.skillPercentages.length > 0 ? [...data.skillPercentages] : [...(DEFAULT_PORTFOLIO_DATA.skillPercentages || [])];
                            current[idx] = { ...skill, percentage: val };
                            setData({ ...data, skillPercentages: current });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div className="pt-5">
                        <button
                          type="button"
                          onClick={() => {
                            const current = data.skillPercentages && data.skillPercentages.length > 0 ? data.skillPercentages : (DEFAULT_PORTFOLIO_DATA.skillPercentages || []);
                            const updated = current.filter((_, i) => i !== idx);
                            setData({ ...data, skillPercentages: updated });
                          }}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete skill bar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Live Preview Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[#383838] overflow-hidden mt-2">
                      <div
                        style={{ width: `${Math.min(100, Math.max(0, skill.percentage || 0))}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] transition-all duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const current = data.skillPercentages && data.skillPercentages.length > 0 ? [...data.skillPercentages] : [...(DEFAULT_PORTFOLIO_DATA.skillPercentages || [])];
                  current.push({ name: '', percentage: 85 });
                  setData({ ...data, skillPercentages: current });
                }}
                className="w-full py-2.5 text-xs font-semibold rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-[#ffdb70] transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5"
              >
                <Plus className="w-4 h-4 text-[#ffdb70]" /> Add Skill Progress Bar
              </button>
            </div>

            {/* Save All Resume Content */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="w-full py-3.5 bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] font-bold text-sm rounded-xl hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Save className="w-4 h-4" /> {isSaving ? 'Saving to Cloudflare D1...' : 'Save All Resume & Experience Changes'}
              </button>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: Ventures & Entrepreneurship
           ══════════════════════════════════════════ */}
        {activeTab === 'ventures' && (
          <div className={`max-w-4xl ${cardClass} space-y-6`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-forest-bright" /> Ventures & Entrepreneurship
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your companies, founded organizations, leadership roles, and ventures displayed on the homepage under projects.
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded-md bg-white/5 border border-white/10 text-forest-bright">
                {(data.ventures || []).length} Ventures
              </span>
            </div>

            {(data.ventures || []).map((v, idx) => (
              <div key={v.id || idx} className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-forest-bright font-bold">#{idx + 1}</span>
                    <span className="text-sm font-bold text-white">{v.name || 'Untitled Venture'}</span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = (data.ventures || []).filter((_, i) => i !== idx);
                      setData({ ...data, ventures: updated });
                    }}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete venture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Company / Organization Name"
                    value={v.name}
                    placeholder="e.g. Apex Nexus AI"
                    onChange={(val) => {
                      const updated = [...(data.ventures || [])];
                      updated[idx] = { ...v, name: val };
                      setData({ ...data, ventures: updated });
                    }}
                  />
                  <InputField
                    label="Position / Role"
                    value={v.role}
                    placeholder="e.g. Founder & Chief Architect"
                    onChange={(val) => {
                      const updated = [...(data.ventures || [])];
                      updated[idx] = { ...v, role: val };
                      setData({ ...data, ventures: updated });
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Category / Industry"
                    value={v.category || ''}
                    placeholder="e.g. AI Startup / Venture Studio"
                    onChange={(val) => {
                      const updated = [...(data.ventures || [])];
                      updated[idx] = { ...v, category: val };
                      setData({ ...data, ventures: updated });
                    }}
                  />
                  <InputField
                    label="Active Period"
                    value={v.period || ''}
                    placeholder="e.g. 2024 – Present"
                    onChange={(val) => {
                      const updated = [...(data.ventures || [])];
                      updated[idx] = { ...v, period: val };
                      setData({ ...data, ventures: updated });
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <MediaUploadField
                    label="Company Logo / Venture Image"
                    value={v.imageUrl || ''}
                    onChange={(val) => {
                      const updated = [...(data.ventures || [])];
                      updated[idx] = { ...v, imageUrl: val };
                      setData({ ...data, ventures: updated });
                    }}
                    folder="ventures"
                    previewAspect="square"
                    placeholder="https://... or upload to Cloudflare R2"
                    helperText="Upload company logo or startup banner. R2 ensures images never 404 or expire."
                  />
                  <InputField
                    label="Website URL"
                    value={v.websiteUrl || ''}
                    placeholder="https://..."
                    onChange={(val) => {
                      const updated = [...(data.ventures || [])];
                      updated[idx] = { ...v, websiteUrl: val };
                      setData({ ...data, ventures: updated });
                    }}
                  />
                </div>

                <InputField
                  label="Description / Mission"
                  value={v.description}
                  placeholder="Describe your company, traction, or engineering leadership..."
                  textarea
                  rows={2}
                  onChange={(val) => {
                    const updated = [...(data.ventures || [])];
                    updated[idx] = { ...v, description: val };
                    setData({ ...data, ventures: updated });
                  }}
                />

                <div className="flex items-center justify-end pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleSaveAll();
                      showNotice(`Saved venture "${v.name || 'Untitled'}"!`);
                    }}
                    className="px-4 py-2 bg-forest-bright text-black font-semibold text-xs rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Venture
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                const current = data.ventures || [];
                setData({
                  ...data,
                  ventures: [
                    ...current,
                    {
                      id: 'venture-' + Date.now(),
                      name: '',
                      role: 'Founder',
                      description: '',
                      imageUrl: '',
                      websiteUrl: '',
                      category: 'Technology',
                      period: 'Present',
                    },
                  ],
                });
              }}
              className="w-full py-3 text-xs font-semibold rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-forest-bright/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Venture / Company
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="w-full py-3 bg-forest-bright text-black font-bold text-sm rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Ventures to Cloudflare'}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: Modeling (Dedicated Page Content)
           ══════════════════════════════════════════ */}
        {activeTab === 'modeling' && (
          <div className="max-w-4xl space-y-8">
            {/* Brands & Organizations Worked With */}
            <div className={`${cardClass} space-y-6`}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-forest-bright" /> Brands & Organizations Worked With
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Agencies, fashion labels, editorial magazines, and organizations you have collaborated with as a model.
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-1 rounded-md bg-white/5 border border-white/10 text-forest-bright">
                  {(data.modelingOrganizations || []).length} Brands
                </span>
              </div>

              {(data.modelingOrganizations || []).map((org, idx) => (
                <div key={org.id || idx} className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-forest-bright font-bold">Brand #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const updated = (data.modelingOrganizations || []).filter((_, i) => i !== idx);
                        setData({ ...data, modelingOrganizations: updated });
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Brand / Organization Name"
                      value={org.name}
                      placeholder="e.g. Vogue International"
                      onChange={(val) => {
                        const updated = [...(data.modelingOrganizations || [])];
                        updated[idx] = { ...org, name: val };
                        setData({ ...data, modelingOrganizations: updated });
                      }}
                    />
                    <InputField
                      label="Campaign / Project Title"
                      value={org.campaignTitle || ''}
                      placeholder="e.g. Autumn Haute Couture 2025"
                      onChange={(val) => {
                        const updated = [...(data.modelingOrganizations || [])];
                        updated[idx] = { ...org, campaignTitle: val };
                        setData({ ...data, modelingOrganizations: updated });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField
                      label="Role"
                      value={org.role}
                      placeholder="e.g. Lead Editorial Model"
                      onChange={(val) => {
                        const updated = [...(data.modelingOrganizations || [])];
                        updated[idx] = { ...org, role: val };
                        setData({ ...data, modelingOrganizations: updated });
                      }}
                    />
                    <InputField
                      label="Category"
                      value={org.category || ''}
                      placeholder="e.g. Editorial / Runway"
                      onChange={(val) => {
                        const updated = [...(data.modelingOrganizations || [])];
                        updated[idx] = { ...org, category: val };
                        setData({ ...data, modelingOrganizations: updated });
                      }}
                    />
                    <InputField
                      label="Year"
                      value={org.year || ''}
                      placeholder="e.g. 2025"
                      onChange={(val) => {
                        const updated = [...(data.modelingOrganizations || [])];
                        updated[idx] = { ...org, year: val };
                        setData({ ...data, modelingOrganizations: updated });
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <MediaUploadField
                      label="Campaign Image / Brand Cover"
                      value={org.imageUrl || ''}
                      onChange={(val) => {
                        const updated = [...(data.modelingOrganizations || [])];
                        updated[idx] = { ...org, imageUrl: val };
                        setData({ ...data, modelingOrganizations: updated });
                      }}
                      folder="modeling/brands"
                      previewAspect="video"
                      placeholder="https://... or upload campaign cover to R2"
                      helperText="Upload editorial cover or campaign banner to Cloudflare R2."
                    />
                    <InputField
                      label="External Campaign Link (optional)"
                      value={org.linkUrl || ''}
                      placeholder="https://..."
                      onChange={(val) => {
                        const updated = [...(data.modelingOrganizations || [])];
                        updated[idx] = { ...org, linkUrl: val };
                        setData({ ...data, modelingOrganizations: updated });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={async () => {
                        await handleSaveAll();
                        showNotice(`Saved brand "${org.name || 'Untitled'}"!`);
                      }}
                      className="px-4 py-2 bg-forest-bright text-black font-semibold text-xs rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Brand
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  const current = data.modelingOrganizations || [];
                  setData({
                    ...data,
                    modelingOrganizations: [
                      ...current,
                      {
                        id: 'model-org-' + Date.now(),
                        name: '',
                        campaignTitle: '',
                        role: 'Campaign Model',
                        year: new Date().getFullYear().toString(),
                        category: 'Editorial',
                        imageUrl: '',
                        linkUrl: '',
                      },
                    ],
                  });
                }}
                className="w-full py-2.5 text-xs font-semibold rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-forest-bright/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Brand / Organization
              </button>
            </div>

            {/* Model Photography Gallery */}
            <div className={`${cardClass} space-y-6`}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-forest-bright" /> Model Photography Showcase
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Editorial shoots, studio portraits, lookbooks, and high-fashion photography for your modeling portfolio page.
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-1 rounded-md bg-white/5 border border-white/10 text-forest-bright">
                  {(data.modelingPhotos || []).length} Photos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(data.modelingPhotos || []).map((photo, idx) => (
                  <div key={photo.id || idx} className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-forest-bright font-bold">Photo #{idx + 1}</span>
                      <button
                        onClick={() => {
                          const updated = (data.modelingPhotos || []).filter((_, i) => i !== idx);
                          setData({ ...data, modelingPhotos: updated });
                        }}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <MediaUploadField
                      label="Gallery Photo"
                      value={photo.imageUrl}
                      onChange={(val) => {
                        const updated = [...(data.modelingPhotos || [])];
                        updated[idx] = { ...photo, imageUrl: val };
                        setData({ ...data, modelingPhotos: updated });
                      }}
                      folder="modeling/gallery"
                      previewAspect="portrait"
                      placeholder="https://... or upload photoshoot image to R2"
                      helperText="High-fashion 3:4 portrait photo. Cloudflare R2 ensures lifetime hosting."
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <InputField
                        label="Title / Look"
                        value={photo.title}
                        placeholder="e.g. Studio Silhouette IV"
                        onChange={(val) => {
                          const updated = [...(data.modelingPhotos || [])];
                          updated[idx] = { ...photo, title: val };
                          setData({ ...data, modelingPhotos: updated });
                        }}
                      />
                      <InputField
                        label="Category"
                        value={photo.category || ''}
                        placeholder="e.g. Editorial"
                        onChange={(val) => {
                          const updated = [...(data.modelingPhotos || [])];
                          updated[idx] = { ...photo, category: val };
                          setData({ ...data, modelingPhotos: updated });
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <InputField
                        label="Photographer / Agency"
                        value={photo.photographer || ''}
                        placeholder="e.g. Studio Lumière"
                        onChange={(val) => {
                          const updated = [...(data.modelingPhotos || [])];
                          updated[idx] = { ...photo, photographer: val };
                          setData({ ...data, modelingPhotos: updated });
                        }}
                      />
                      <InputField
                        label="Year"
                        value={photo.year || ''}
                        placeholder="e.g. 2025"
                        onChange={(val) => {
                          const updated = [...(data.modelingPhotos || [])];
                          updated[idx] = { ...photo, year: val };
                          setData({ ...data, modelingPhotos: updated });
                        }}
                      />
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={async () => {
                          await handleSaveAll();
                          showNotice(`Saved photo "${photo.title || 'Untitled'}"!`);
                        }}
                        className="w-full py-2 bg-forest-bright text-black font-semibold text-xs rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Photo
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const current = data.modelingPhotos || [];
                  setData({
                    ...data,
                    modelingPhotos: [
                      ...current,
                      {
                        id: 'photo-' + Date.now(),
                        title: 'New Editorial Shoot',
                        category: 'Editorial',
                        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
                        photographer: '',
                        year: new Date().getFullYear().toString(),
                      },
                    ],
                  });
                }}
                className="w-full py-2.5 text-xs font-semibold rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-forest-bright/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Photo to Gallery
              </button>
            </div>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="w-full py-3 bg-forest-bright text-black font-bold text-sm rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Modeling Data to Cloudflare'}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: FAQ
           ══════════════════════════════════════════ */}
        {activeTab === 'faq' && (
          <div className={`max-w-3xl ${cardClass} space-y-5`}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <HelpCircle className="w-4 h-4 text-forest-bright" /> FAQ Section
            </h3>

            <InputField label="Section Title" value={data.faqSectionTitle} onChange={(v) => setData({ ...data, faqSectionTitle: v })} />
            <InputField label="Section Subtitle" value={data.faqSectionSubtitle} onChange={(v) => setData({ ...data, faqSectionSubtitle: v })} />

            {data.faqs.map((faq, idx) => (
              <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-forest-bright">Q{idx + 1}</span>
                  <button
                    onClick={() => {
                      const updated = data.faqs.filter((_, i) => i !== idx);
                      setData({ ...data, faqs: updated });
                    }}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <InputField label="Question" value={faq.question} onChange={(v) => {
                  const updated = [...data.faqs];
                  updated[idx] = { ...faq, question: v };
                  setData({ ...data, faqs: updated });
                }} />
                <InputField label="Answer" value={faq.answer} onChange={(v) => {
                  const updated = [...data.faqs];
                  updated[idx] = { ...faq, answer: v };
                  setData({ ...data, faqs: updated });
                }} textarea rows={3} />
              </div>
            ))}

            <button
              onClick={() => {
                setData({
                  ...data,
                  faqs: [...data.faqs, { question: '', answer: '' }]
                });
              }}
              className="w-full py-2.5 text-xs font-semibold rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-forest-bright/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add FAQ
            </button>

            <button onClick={handleSaveAll} disabled={isSaving} className="w-full py-3 bg-forest-bright text-black font-bold text-sm rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center justify-center gap-2 mt-4">
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save FAQs'}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: Projects
           ══════════════════════════════════════════ */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add Project Form */}
            <form onSubmit={handleAddProject} className={`lg:col-span-5 ${cardClass} space-y-4 h-fit`}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-forest-bright" /> Add New Project
              </h3>

              <InputField label="Project Title" value={pTitle} onChange={setPTitle} placeholder="My Awesome Project" />
              <InputField label="Subtitle" value={pSubtitle} onChange={setPSubtitle} placeholder="e.g. SaaS Dashboard" />

              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value)}
                  className={inputClass}
                >
                  {['Full Stack', 'Frontend', 'Backend', 'AI / Machine Learning', 'Mobile', 'DevOps', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <InputField label="Technologies (comma separated)" value={pTechs} onChange={setPTechs} placeholder="React, Node.js, MongoDB" />
              
              <MediaUploadField
                label="Project Showcase Image"
                value={pImage}
                onChange={setPImage}
                folder="projects"
                previewAspect="video"
                placeholder="https://... or upload project screenshot/mockup to R2"
                helperText="Recommended: 16:9 widescreen screenshot or device mockup. R2 guarantees images never 404 or expire."
              />

              <InputField label="Live Demo URL" value={pLive} onChange={setPLive} type="url" placeholder="https://myproject.com" />
              <InputField label="GitHub Repository URL" value={pGithub} onChange={setPGithub} type="url" placeholder="https://github.com/..." />

              <InputField label="Description" value={pDesc} onChange={setPDesc} textarea rows={3} placeholder="Describe what this project does..." />

              <button
                type="submit"
                className="w-full py-3 bg-forest-bright text-black font-bold text-sm rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </form>

            {/* Project List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-forest-bright" /> Current Projects ({data.projects.length})
              </h3>

              {data.projects.length === 0 && (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <FolderPlus className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No projects yet. Add your first project.</p>
                </div>
              )}

              {data.projects.map((proj) => (
                <div key={proj.id} className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <img src={proj.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-white/10" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{proj.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{proj.subtitle} · {proj.category}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-[10px] text-forest-bright flex items-center gap-1 hover:underline">
                            <ExternalLink className="w-3 h-3" /> Live
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[10px] text-slate-400 flex items-center gap-1 hover:text-white">
                            <GithubIcon className="w-3 h-3" /> GitHub
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setEditingProjectId(editingProjectId === proj.id ? null : proj.id)}
                        className="p-2 text-slate-400 hover:text-forest-bright hover:bg-forest-bright/10 rounded-xl transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Edit Form */}
                  {editingProjectId === proj.id && (
                    <div className="border-t border-white/5 p-4 bg-black/30 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField label="Title" value={proj.title} onChange={(v) => handleUpdateProject(proj.id, { title: v })} />
                        <InputField label="Subtitle" value={proj.subtitle} onChange={(v) => handleUpdateProject(proj.id, { subtitle: v })} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField label="Live URL" value={proj.liveUrl} onChange={(v) => handleUpdateProject(proj.id, { liveUrl: v })} />
                        <InputField label="GitHub URL" value={proj.githubUrl} onChange={(v) => handleUpdateProject(proj.id, { githubUrl: v })} />
                      </div>
                      <MediaUploadField
                        label="Project Screenshot / Mockup"
                        value={proj.imageUrl}
                        onChange={(url) => handleUpdateProject(proj.id, { imageUrl: url })}
                        folder="projects"
                        previewAspect="video"
                        placeholder="https://... or upload to Cloudflare R2"
                        helperText="Upload to Cloudflare R2 for zero dead links."
                      />
                      <InputField label="Technologies (comma)" value={proj.technologies.join(', ')} onChange={(v) => handleUpdateProject(proj.id, { technologies: v.split(',').map(s => s.trim()).filter(Boolean) })} />
                      <InputField label="Description" value={proj.description} onChange={(v) => handleUpdateProject(proj.id, { description: v })} textarea rows={2} />
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={async () => {
                            await handleSaveAll();
                            setEditingProjectId(null);
                            showNotice(`Project "${proj.title || 'Untitled'}" updated and saved!`);
                          }}
                          className="px-4 py-2.5 bg-forest-bright text-black font-bold text-xs rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Project Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProjectId(null)}
                          className="px-3.5 py-2.5 text-xs text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                        >
                          Close Editor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {data.projects.length > 0 && (
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="w-full py-3.5 bg-forest-bright text-black font-bold text-sm rounded-xl hover:bg-forest-bright/90 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {isSaving ? 'Saving to Cloudflare D1...' : 'Save All Projects to Cloudflare D1'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: Settings
           ══════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            {/* AI Digital Twin — Google Gemini Configuration */}
            <div className={`${cardClass} space-y-5 border-[#ffdb70]/30`}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#ffdb70]" /> AI Digital Twin (Google Gemini API)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empower your interactive website chatbot to reply authentically as you. The AI is trained on your full stack, projects, experiences, educations, and contact details.
              </p>

              <InputField
                label="Google Gemini API Key"
                value={data.geminiApiKey}
                onChange={(v) => setData({ ...data, geminiApiKey: v })}
                type="password"
                placeholder="AIzaSy..."
              />

              <InputField
                label="Custom Persona Instructions / Guidelines (Optional)"
                value={data.aiSystemPrompt}
                onChange={(v) => setData({ ...data, aiSystemPrompt: v })}
                textarea
                rows={3}
                placeholder="e.g. Always emphasize my backend engineering & Flutter expertise, and encourage recruiters to WhatsApp me."
              />

              <div className={`rounded-xl p-3 text-xs ${data.geminiApiKey ? 'bg-forest-bright/10 border border-forest-bright/30 text-forest-bright' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'}`}>
                {data.geminiApiKey ? '✓ Gemini API Key is configured and ready for live visitor chat!' : '⚠ Gemini API Key not set yet. Enter your key here or directly in the chat window to enable AI.'}
              </div>

              <button
                onClick={handleSaveAll}
                className="w-full py-3 bg-[#ffdb70] text-[#121212] font-bold text-sm rounded-xl hover:bg-[#ffdb70]/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" /> Save AI Configuration
              </button>
            </div>

            {/* Cloudflare R2 Configuration */}
            <div className={`${cardClass} space-y-5`}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-forest-bright" /> Cloudflare R2 Cloud Storage
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest-bright/10 text-forest-bright border border-forest-bright/30">
                  Built-in Pages Function Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-forest-bright/5 border border-forest-bright/20 text-xs text-slate-300 leading-relaxed space-y-2">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-forest-bright" /> Direct R2 Uploads Are Always Active!
                </p>
                <p className="text-slate-400 text-[11px]">
                  Your portfolio uses native Cloudflare Pages Functions (<code className="text-forest-bright font-mono">/api/upload</code>) connected directly to your R2 bucket (<code className="text-forest-bright font-mono">shoron-portfolio-media</code>). All direct file uploads in Profile, Ventures, Modeling, and Projects are stored permanently with zero expiration.
                </p>
                <div className="pt-1 text-[11px] text-amber-300/90 border-t border-white/10">
                  <strong>💡 Why do external URLs die after a few days?</strong> Image links copied from Discord, Facebook, or temporary image hosts use temporary HMAC signature tokens (<code className="bg-black/40 px-1 py-0.5 rounded font-mono">?ex=...&token=...</code>) that automatically self-destruct after 24–48 hours. By using the <strong>"Direct R2 Upload"</strong> option in every section, your images are stored forever in your own Cloudflare account.
                </div>
              </div>

              <InputField
                label="Custom Worker URL (Optional override)"
                value={r2Config.workerUrl}
                onChange={(v) => setR2Config({ ...r2Config, workerUrl: v })}
                placeholder="Leave blank to use default native Cloudflare Pages R2 (/api/upload)"
              />
              <InputField
                label="R2 Bucket Name"
                value={r2Config.bucketName}
                onChange={(v) => setR2Config({ ...r2Config, bucketName: v })}
                placeholder="my-portfolio-bucket"
              />
              <InputField
                label="Public URL Prefix"
                value={r2Config.publicUrl}
                onChange={(v) => setR2Config({ ...r2Config, publicUrl: v })}
                placeholder="https://pub-xxxx.r2.dev"
              />
              <InputField
                label="Auth Token (optional)"
                value={r2Config.authToken}
                onChange={(v) => setR2Config({ ...r2Config, authToken: v })}
                type="password"
                placeholder="Bearer token for worker authentication"
              />

              <div className={`rounded-xl p-3 text-xs ${CloudflareR2.isConfigured() ? 'bg-forest-bright/10 border border-forest-bright/30 text-forest-bright' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'}`}>
                {CloudflareR2.isConfigured() ? '✓ R2 is configured and ready for uploads' : '⚠ R2 is not yet configured — image uploads will be disabled'}
              </div>

              <button
                onClick={handleSaveR2Config}
                className="w-full py-3 bg-forest-bright text-black font-bold text-sm rounded-xl hover:bg-forest-bright/90 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save R2 Configuration
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-slate-900/80 border border-rose-500/20 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-3">
                <RotateCcw className="w-4 h-4" /> Danger Zone
              </h3>
              <p className="text-xs text-slate-400 mb-4">Reset all portfolio data to default values. This action cannot be undone.</p>
              <button
                onClick={handleResetDefaults}
                className="px-6 py-2.5 text-xs font-bold rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Reset All Data to Defaults
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
