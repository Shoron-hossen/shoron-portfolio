import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ExternalLink,
  ArrowLeft,
  Tag,
  Code2,
  Filter,
  X,
  Folder,
  Eye,
} from 'lucide-react';
import { PortfolioStore, type PortfolioData } from './portfolioStore';
import GithubIcon from './components/GithubIcon';

interface ProjectsPageProps {
  onBackHome?: () => void;
}

export default function ProjectsPage({ onBackHome }: ProjectsPageProps) {
  const [data, setData] = useState<PortfolioData>(PortfolioStore.getLocal());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<PortfolioData['projects'][0] | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const unsub = PortfolioStore.subscribeToData((updated) => {
      setData(updated);
    });
    return () => unsub?.();
  }, []);

  const categories = ['All', 'Full Stack', 'Frontend', 'Backend', 'DevOps', 'Mobile'];

  const filteredProjects = data.projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen dark bg-[#03060a] text-[#d6d6d6] font-sans overflow-x-hidden selection:bg-[#ffdb70] selection:text-[#121212]">
      
      {/* Background Atmosphere — Seamless Obsidian #03060a with Ambient Stars */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#03060a]" />
        {[
          { left: '6%', top: '12%', dur: '4.2s', delay: '0.3s' },
          { left: '20%', top: '25%', dur: '5.1s', delay: '1.2s' },
          { left: '38%', top: '15%', dur: '3.7s', delay: '2.1s' },
          { left: '62%', top: '22%', dur: '4.8s', delay: '0.8s' },
          { left: '82%', top: '10%', dur: '5.5s', delay: '1.5s' },
          { left: '92%', top: '30%', dur: '3.9s', delay: '2.4s' },
          { left: '15%', top: '55%', dur: '4.5s', delay: '0.6s' },
          { left: '48%', top: '65%', dur: '5.8s', delay: '1.9s' },
          { left: '75%', top: '60%', dur: '4.1s', delay: '2.7s' },
          { left: '88%', top: '75%', dur: '5.2s', delay: '0.4s' },
          { left: '28%', top: '85%', dur: '4.6s', delay: '1.7s' },
          { left: '68%', top: '90%', dur: '5.9s', delay: '2.3s' },
        ].map((star, idx) => (
          <span
            key={idx}
            className="lp-star h-1 w-1"
            style={{ left: star.left, top: star.top, '--dur': star.dur, '--delay': star.delay } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Navigation header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-[#121212]/90 border-b border-[#383838] text-[#fafafa] backdrop-blur-md px-6 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackHome || (() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); })}
            className="flex items-center gap-2 text-xs font-medium bg-[#212123] text-[#d6d6d6] hover:text-[#ffdb70] hover:border-[#ffdb70] border border-[#383838] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#ffdb70]" />
            <span className="font-semibold tracking-tight text-base text-[#fafafa]">Engineering Projects</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/admin');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-xs font-semibold px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] hover:shadow-[0_4px_16px_rgba(255,219,112,0.3)] transition-all cursor-pointer"
            >
              Admin Panel
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#383838] bg-[#212123] text-[#ffdb70] text-xs font-mono mb-3">
            <Folder className="w-3.5 h-3.5" />
            <span>PORTFOLIO SHOWCASE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#fafafa] mb-3">
            Engineering Projects
          </h1>
          <p className="text-sm text-[#d6d6d6]/70 leading-relaxed">
            Production applications and software systems with live demonstrations and GitHub repositories.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 p-3.5 rounded-[20px] border border-[#383838] bg-[#1e1e1f] shadow-[0_16px_30px_rgba(0,0,0,0.25)]">
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <Filter className="w-4 h-4 mr-1 hidden sm:block text-[#ffdb70]" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] font-semibold shadow-xs'
                    : 'bg-[#212123] text-[#d6d6d6] hover:border-[#ffdb70] hover:text-[#ffdb70] border border-[#383838]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d6d6d6]/40" />
            <input
              type="text"
              placeholder="Search by tech or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-[#212123] border border-[#383838] text-[#fafafa] placeholder-[#d6d6d6]/40 focus:border-[#ffdb70] transition-colors outline-none"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-[#383838] bg-[#1e1e1f] text-[#d6d6d6]/60">
            <Code2 className="w-10 h-10 text-[#d6d6d6]/40 mx-auto mb-2" />
            <h3 className="text-base font-medium mb-1 text-[#fafafa]">No Projects Found</h3>
            <p className="text-xs">Adjust your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col rounded-[20px] p-4 sm:p-5 border border-[#383838] bg-[#1e1e1f] hover:border-[#ffdb70]/50 shadow-[0_16px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all"
              >
                {/* Photo shown separately in its own rounded figure container like homepage */}
                <div
                  onClick={() => setActiveModalProject(project)}
                  className="relative overflow-hidden rounded-[16px] h-48 w-full bg-[#121212] mb-4 border border-[#383838]/70 cursor-pointer"
                >
                  <img
                    src={project.imageUrl}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('photo-1551288049')) {
                        target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000';
                      }
                    }}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Eye hover overlay matching homepage */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-10 h-10 rounded-xl bg-[#2a2a2c]/90 border border-[#383838] flex items-center justify-center text-[#ffdb70] shadow-lg">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                  
                  {/* Category Pill */}
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-md bg-[#1e1e1f]/90 text-[#ffdb70] border-[#383838]">
                    {project.category}
                  </span>
                </div>

                {/* Details below separately */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-base font-bold mb-1 text-[#fafafa] group-hover:text-[#ffdb70] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs font-mono mb-2 text-[#ffdb70]">
                    {project.subtitle}
                  </p>
                  <p className="text-xs leading-relaxed mb-4 flex-1 line-clamp-3 text-[#d6d6d6]/80">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-[#212123] text-[#d6d6d6] border border-[#383838]"
                      >
                        <Tag className="w-2.5 h-2.5 text-[#ffdb70]" />
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#383838] gap-2 mt-auto">
                    <button
                      onClick={() => setActiveModalProject(project)}
                      className="text-xs font-semibold text-[#ffdb70] hover:underline cursor-pointer"
                    >
                      View Details
                    </button>

                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-[#212123] text-[#d6d6d6] hover:text-[#ffdb70] hover:border-[#ffdb70] border border-[#383838] transition-colors"
                          title="Source Code"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] hover:shadow-[0_4px_16px_rgba(255,219,112,0.3)] transition-all shadow-xs"
                          title="Live Demo"
                        >
                          <span>Demo</span>
                          <ExternalLink className="w-3 h-3" />
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

      {/* Details Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-[24px] overflow-hidden shadow-2xl border bg-[#1e1e1f] border-[#383838] text-[#fafafa]">
            <button
              onClick={() => setActiveModalProject(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative h-60 w-full">
              <img
                src={activeModalProject.imageUrl}
                alt={activeModalProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1f] via-transparent to-transparent" />
            </div>

            <div className="p-6">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2 border border-[#383838] bg-[#212123] text-[#ffdb70]">
                {activeModalProject.category}
              </span>
              <h2 className="text-xl font-bold mb-1">{activeModalProject.title}</h2>
              <p className="text-xs font-mono mb-3 text-[#ffdb70]">{activeModalProject.subtitle}</p>
              
              <p className="text-xs leading-relaxed mb-4 text-[#d6d6d6]">
                {activeModalProject.description}
              </p>

              {/* Technologies in Modal */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {activeModalProject.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#212123] text-[#d6d6d6] border border-[#383838]"
                  >
                    <Tag className="w-3 h-3 text-[#ffdb70]" />
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#383838]">
                {activeModalProject.githubUrl && (
                  <a
                    href={activeModalProject.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border bg-[#212123] text-[#d6d6d6] border-[#383838] hover:border-[#ffdb70] hover:text-[#ffdb70] transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>View Repository</span>
                  </a>
                )}
                {activeModalProject.liveUrl && (
                  <a
                    href={activeModalProject.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] hover:shadow-[0_4px_16px_rgba(255,219,112,0.3)] transition-all shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Launch Live Demo</span>
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
