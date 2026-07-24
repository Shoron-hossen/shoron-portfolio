import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Tag,
  Code2,
  Filter,
  X
} from 'lucide-react';
import { PortfolioService } from '../services/portfolioService';
import type { Project } from '../services/portfolioService';

interface ProjectsPageProps {
  onBackHome?: () => void;
  isLight?: boolean;
}

export default function ProjectsPage({ onBackHome, isLight = false }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  useEffect(() => {
    setProjects(PortfolioService.getProjects());
  }, []);

  const categories = ['All', 'Full Stack', 'Frontend', 'Backend', 'AI / Machine Learning', 'Mobile'];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`relative min-h-screen ${isLight ? 'bg-slate-900 text-white' : 'dark bg-black text-white'} font-sans overflow-x-hidden`}>
      
      {/* 
        EXACT PARALLAX / ATMOSPHERIC BACKGROUND MATCHING HOMEPAGE HERO (AS IN PHOTO)
      */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute inset-0 ${isLight ? 'bg-[linear-gradient(to_bottom,#0f172a_0%,#1e293b_40%,#0f172a_100%)]' : 'bg-[linear-gradient(to_bottom,#03060a_0%,#060c12_24%,#101f23_44%,#172a29_57%,#121a1a_71%,#070a0b_86%,#000000_100%)]'}`} />
        
        {/* Parallax Sky Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-bottom opacity-40 mix-blend-screen"
          style={{ backgroundImage: "url('/sky-bg.webp')" }}
        />
        
        {/* Parallax Hills Layer */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[60vh] bg-cover bg-bottom opacity-30"
          style={{ backgroundImage: "url('/hills-bg.webp')" }}
        />

        {/* Foreground Bushes Layer */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[30vh] bg-cover bg-bottom opacity-20"
          style={{ backgroundImage: "url('/bushes-fg.webp')" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Top Header Navigation bar */}
      <header className="fixed inset-x-0 top-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackHome || (() => window.location.href = '/')}
            className="flex items-center gap-2 text-sm text-forest-bright hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-forest-bright/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-forest-bright" />
            <span className="font-semibold tracking-wide text-lg text-white">Project Showcase</span>
          </div>

          <a
            href="/#contact"
            className="text-xs bg-forest-bright text-black font-semibold px-4 py-1.5 rounded-full hover:bg-forest-bright/90 transition-all shadow-md"
          >
            Hire Me
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
        
        {/* Title Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-forest-bright/30 bg-forest-bright/10 text-forest-bright text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PORTFOLIO & WORK ARCHIVE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Featured <span className="text-forest-bright">Engineering Projects</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Explore my recent full-stack web applications, SaaS dashboards, and AI developments built with high architectural quality, performance, and clean UI design.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-forest-bright mr-1 hidden sm:block" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-forest-bright text-black font-semibold shadow-md shadow-forest-bright/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tech, title, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/15 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-forest-bright transition-colors"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <Code2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">No Projects Found</h3>
            <p className="text-xs text-slate-400">Try clearing your search query or selecting a different category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="group relative flex flex-col bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md hover:border-forest-bright/50 transition-all shadow-xl"
              >
                {/* Project Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={project.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/70 text-forest-bright border border-forest-bright/30 backdrop-blur-md">
                    {project.category}
                  </span>
                </div>

                {/* Project Content */}
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-lg font-bold text-white group-hover:text-forest-bright transition-colors mb-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mb-3">
                    {project.subtitle}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4 flex-1">
                    {project.description}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.technologies.slice(0, 4).map((tech, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300">
                        <Tag className="w-2.5 h-2.5 text-forest-bright" />
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-400">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                    <button
                      onClick={() => setActiveModalProject(project)}
                      className="text-xs font-semibold text-forest-bright hover:underline"
                    >
                      View Details
                    </button>

                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-[11px] font-mono border border-white/10"
                          title="View GitHub Repository"
                        >
                          Code
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-forest-bright text-black hover:bg-forest-bright/90 transition-colors"
                          title="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Project Details Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setActiveModalProject(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 w-full">
              <img
                src={activeModalProject.imageUrl}
                alt={activeModalProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
            </div>

            <div className="p-6">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-forest-bright/20 text-forest-bright border border-forest-bright/30 mb-2">
                {activeModalProject.category}
              </span>
              <h2 className="text-2xl font-bold text-white mb-1">{activeModalProject.title}</h2>
              <p className="text-sm font-mono text-slate-400 mb-4">{activeModalProject.subtitle}</p>
              
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {activeModalProject.longDescription || activeModalProject.description}
              </p>

              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Technologies Used</h4>
                <div className="flex flex-wrap gap-2">
                  {activeModalProject.technologies.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-white/10 text-xs text-white border border-white/10">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                {activeModalProject.githubUrl && (
                  <a
                    href={activeModalProject.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-semibold transition-colors"
                  >
                    <span>View Repository</span>
                  </a>
                )}
                {activeModalProject.liveUrl && (
                  <a
                    href={activeModalProject.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-bright text-black font-semibold hover:bg-forest-bright/90 text-xs transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Live Project</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
