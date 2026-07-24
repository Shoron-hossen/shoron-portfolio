import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Database,
  ArrowLeft,
  User,
  FolderPlus,
  CheckCircle,
  Lock
} from 'lucide-react';
import { PortfolioService } from '../services/portfolioService';
import type { Project, PersonalInfo } from '../services/portfolioService';
import { getSavedFirebaseConfig } from '../firebase/config';

interface AdminPageProps {
  onBackHome?: () => void;
}

export default function AdminPage({ onBackHome }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'personal' | 'firebase'>('projects');
  
  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(PortfolioService.getPersonalInfo());
  const [firebaseConfigStr, setFirebaseConfigStr] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // New Project Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<Project['category']>('Full Stack');
  const [newDescription, setNewDescription] = useState('');
  const [newTechs, setNewTechs] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newLiveUrl, setNewLiveUrl] = useState('');
  const [newGithubUrl, setNewGithubUrl] = useState('');

  useEffect(() => {
    setProjects(PortfolioService.getProjects());
    setPersonalInfo(PortfolioService.getPersonalInfo());
    setFirebaseConfigStr(JSON.stringify(getSavedFirebaseConfig(), null, 2));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'shoron2026') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect admin passphrase. Try: admin123');
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) {
      alert('Please fill in title and description');
      return;
    }

    const techArray = newTechs.split(',').map(t => t.trim()).filter(Boolean);

    const created = PortfolioService.addProject({
      title: newTitle,
      subtitle: newSubtitle || 'Web Project',
      description: newDescription,
      category: newCategory,
      technologies: techArray.length > 0 ? techArray : ['React', 'TypeScript'],
      imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000',
      liveUrl: newLiveUrl,
      githubUrl: newGithubUrl,
      featured: true
    });

    setProjects([created, ...projects]);
    setNewTitle('');
    setNewSubtitle('');
    setNewDescription('');
    setNewTechs('');
    setNewImageUrl('');
    setNewLiveUrl('');
    setNewGithubUrl('');
    showNotice('Project added successfully!');
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      PortfolioService.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
      showNotice('Project deleted!');
    }
  };

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    PortfolioService.savePersonalInfo(personalInfo);
    showNotice('Personal profile updated successfully!');
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(firebaseConfigStr);
      localStorage.setItem('shoron_firebase_config', JSON.stringify(parsed));
      showNotice('Firebase credentials saved! Reloading configuration...');
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      alert('Invalid JSON structure for Firebase Config. Please check syntax.');
    }
  };

  const showNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-forest-bright/10 text-forest-bright border border-forest-bright/30 mb-3">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Portfolio Admin Portal</h2>
            <p className="text-xs text-slate-400 mt-1">Enter security passphrase to access site control center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Passphrase</label>
              <input
                type="password"
                placeholder="Enter admin passphrase (default: admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-forest-bright"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-forest-bright text-black font-bold rounded-xl hover:bg-forest-bright/90 transition-colors shadow-lg"
            >
              Authenticate Admin
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBackHome || (() => window.location.href = '/')}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-white/10 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-forest-bright" />
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Portfolio Admin Dashboard</h1>
              <p className="text-[11px] text-slate-400 font-mono">Firebase & Local Data Synchronizer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackHome || (() => window.location.href = '/')}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> View Public Site
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Body */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {saveSuccessMsg && (
          <div className="mb-6 p-4 rounded-xl bg-forest-bright/10 border border-forest-bright/40 text-forest-bright flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{saveSuccessMsg}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'projects'
                ? 'bg-forest-bright text-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <FolderPlus className="w-4 h-4" /> Manage Projects ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'personal'
                ? 'bg-forest-bright text-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <User className="w-4 h-4" /> Edit Profile & Links
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'firebase'
                ? 'bg-forest-bright text-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Database className="w-4 h-4" /> Firebase Credentials
          </button>
        </div>

        {/* TAB 1: PROJECTS MANAGEMENT */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Add New Project Form */}
            <div className="lg:col-span-5 bg-slate-900 border border-white/10 p-6 rounded-2xl h-fit">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-forest-bright" /> Add New Project Manually
              </h3>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-Powered Analytics Dashboard"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Real-time metric visualization platform"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                  >
                    <option value="Full Stack">Full Stack</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="AI / Machine Learning">AI / Machine Learning</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Technologies (comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Node.js, PostgreSQL"
                    value={newTechs}
                    onChange={(e) => setNewTechs(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Live URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newLiveUrl}
                      onChange={(e) => setNewLiveUrl(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">GitHub Repo URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={newGithubUrl}
                      onChange={(e) => setNewGithubUrl(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Write project features and goals..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-forest-bright text-black font-bold text-xs rounded-xl hover:bg-forest-bright/90 transition-colors shadow-md"
                >
                  Publish Project
                </button>
              </form>
            </div>

            {/* Right: Existing Projects List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-bold text-white mb-4">Existing Projects</h3>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex items-center justify-between p-4 bg-slate-900 border border-white/10 rounded-2xl hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={proj.imageUrl}
                      alt={proj.title}
                      className="w-16 h-16 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                      <p className="text-xs text-slate-400">{proj.subtitle}</p>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] bg-forest-bright/20 text-forest-bright border border-forest-bright/30">
                        {proj.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: PERSONAL INFO */}
        {activeTab === 'personal' && (
          <div className="max-w-3xl bg-slate-900 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-forest-bright" /> Edit Profile & Contact Links
            </h3>

            <form onSubmit={handleSavePersonalInfo} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Primary Role / Title</label>
                  <input
                    type="text"
                    value={personalInfo.role}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, role: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Bio / About Me</label>
                <textarea
                  rows={4}
                  value={personalInfo.bio}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">CV Download URL</label>
                  <input
                    type="text"
                    value={personalInfo.cvUrl}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, cvUrl: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-forest-bright"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Social Media URLs</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">GitHub</label>
                    <input
                      type="url"
                      value={personalInfo.socials.github}
                      onChange={(e) => setPersonalInfo({
                        ...personalInfo,
                        socials: { ...personalInfo.socials, github: e.target.value }
                      })}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-forest-bright"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={personalInfo.socials.linkedin}
                      onChange={(e) => setPersonalInfo({
                        ...personalInfo,
                        socials: { ...personalInfo.socials, linkedin: e.target.value }
                      })}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-forest-bright"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-forest-bright text-black font-bold text-xs rounded-xl hover:bg-forest-bright/90 transition-colors shadow-md mt-4"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: FIREBASE CONFIG */}
        {activeTab === 'firebase' && (
          <div className="max-w-3xl bg-slate-900 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-forest-bright" /> Firebase Credentials & Database Sync
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Paste your standard Firebase SDK config JSON below to link your portfolio to your live Firebase project (Firestore / Auth).
            </p>

            <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Firebase Config (JSON format)</label>
                <textarea
                  rows={10}
                  value={firebaseConfigStr}
                  onChange={(e) => setFirebaseConfigStr(e.target.value)}
                  className="w-full bg-black/80 font-mono text-xs border border-white/15 rounded-xl p-4 text-emerald-400 focus:outline-none focus:border-forest-bright"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 bg-forest-bright text-black font-bold text-xs rounded-xl hover:bg-forest-bright/90 transition-colors shadow-md"
              >
                Save Firebase Settings
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}
