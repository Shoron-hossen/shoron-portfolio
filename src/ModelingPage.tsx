import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  Building2,
  ExternalLink,
  Tag,
  Eye,
  X,
  Sparkles,
} from 'lucide-react';
import { PortfolioStore, type PortfolioData, type ModelingOrganization, type ModelingPhoto } from './portfolioStore';

interface ModelingPageProps {
  onBackHome?: () => void;
}

export default function ModelingPage({ onBackHome }: ModelingPageProps) {
  const [data, setData] = useState<PortfolioData>(PortfolioStore.getLocal());
  const [activeTab, setActiveTab] = useState<'organizations' | 'gallery'>('organizations');
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<string>('All');
  const [lightboxPhoto, setLightboxPhoto] = useState<ModelingPhoto | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const unsub = PortfolioStore.subscribeToData((updated) => {
      setData(updated);
    });
    return () => unsub?.();
  }, []);

  const organizations: ModelingOrganization[] = data.modelingOrganizations || [];
  const photos: ModelingPhoto[] = data.modelingPhotos || [];

  const photoCategories = ['All', 'Editorial', 'Commercial', 'Runway', 'Lookbook'];

  const filteredPhotos = photos.filter(photo => {
    if (selectedPhotoCategory === 'All') return true;
    return photo.category.toLowerCase() === selectedPhotoCategory.toLowerCase();
  });

  return (
    <div className="relative min-h-screen dark bg-black text-[#d6d6d6] font-sans overflow-x-hidden selection:bg-[#ffdb70] selection:text-[#121212]">
      
      {/* Background Atmosphere — Pure Black with Warm Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#ffdb70]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#ffdb70]/[0.03] rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Navigation header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-black/80 border-b border-[#383838] text-[#fafafa] backdrop-blur-md px-6 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackHome || (() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); })}
            className="flex items-center gap-2 text-xs font-medium bg-[#212123] text-[#d6d6d6] hover:text-[#ffdb70] hover:border-[#ffdb70] border border-[#383838] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#ffdb70]" />
            <span className="font-semibold tracking-tight text-sm sm:text-base text-[#fafafa]">Modeling & Creative Portfolio</span>
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
              Admin CMS
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#383838] bg-[#212123] text-[#ffdb70] text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMERCIAL & EDITORIAL SHOWCASE</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#fafafa] mb-3">
            Fashion & Modeling
          </h1>
          <p className="text-sm text-[#d6d6d6]/70 leading-relaxed">
            Runway appearances, editorial magazine publications, and commercial brand partnerships.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex rounded-full p-1 border border-[#383838] bg-[#1e1e1f] shadow-md">
            <button
              onClick={() => setActiveTab('organizations')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'organizations'
                  ? 'bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] font-semibold shadow-xs'
                  : 'text-[#d6d6d6] hover:text-[#ffdb70]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Brands & Organizations</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] font-semibold shadow-xs'
                  : 'text-[#d6d6d6] hover:text-[#ffdb70]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photography Gallery</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Brands & Organizations Worked With */}
        {activeTab === 'organizations' && (
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-[#383838] pb-3">
              <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2">
                <span>Campaigns & Commercial Partnerships</span>
                <span className="text-xs font-normal text-[#ffdb70] font-mono">({organizations.length})</span>
              </h2>
            </div>

            {organizations.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-[#383838] bg-[#1e1e1f] text-[#d6d6d6]/60">
                <Building2 className="w-10 h-10 text-[#d6d6d6]/40 mx-auto mb-2" />
                <h3 className="text-base font-medium mb-1 text-[#fafafa]">No Organizations Added Yet</h3>
                <p className="text-xs">Add brand campaigns in the Admin Panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org) => (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="group relative flex flex-col rounded-[20px] p-4 sm:p-5 border border-[#383838] bg-[#1e1e1f] hover:border-[#ffdb70]/50 shadow-[0_16px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all"
                  >
                    {/* Campaign / Brand Image */}
                    <div className="relative overflow-hidden rounded-[16px] h-48 w-full bg-[#121212] mb-4 border border-[#383838]/70">
                      <img
                        src={org.imageUrl || '/developer_portrait.png'}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('unsplash')) {
                            target.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000';
                          }
                        }}
                        alt={org.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {org.category && (
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-md bg-[#1e1e1f]/90 text-[#ffdb70] border-[#383838]">
                          {org.category}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#fafafa] group-hover:text-[#ffdb70] transition-colors">
                          {org.name}
                        </h3>
                        <span className="text-xs font-mono text-[#ffdb70]">{org.year}</span>
                      </div>
                      
                      <p className="text-xs font-medium text-white/80 mb-2">
                        {org.campaignTitle}
                      </p>

                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#212123] border border-[#383838] text-[#ffdb70]">
                          <Tag className="w-3 h-3" />
                          <span>{org.role}</span>
                        </span>
                      </div>

                      {org.linkUrl && (
                        <div className="pt-3 border-t border-[#383838] mt-auto">
                          <a
                            href={org.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ffdb70] hover:underline"
                          >
                            <span>View Campaign & Press</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Model Photography & Editorial Gallery */}
        {activeTab === 'gallery' && (
          <div>
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {photoCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedPhotoCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedPhotoCategory === cat
                      ? 'bg-gradient-to-r from-[#ffdb70] to-[#ceb15a] text-[#121212] font-semibold shadow-xs'
                      : 'bg-[#1e1e1f] text-[#d6d6d6] hover:text-[#ffdb70] border border-[#383838]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredPhotos.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-[#383838] bg-[#1e1e1f] text-[#d6d6d6]/60">
                <Camera className="w-10 h-10 text-[#d6d6d6]/40 mx-auto mb-2" />
                <h3 className="text-base font-medium mb-1 text-[#fafafa]">No Photos in this Category</h3>
                <p className="text-xs">Select another category or upload photos in Admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setLightboxPhoto(photo)}
                    className="group relative cursor-pointer overflow-hidden rounded-[18px] border border-[#383838] bg-[#1e1e1f] shadow-md hover:border-[#ffdb70]/50"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#121212]">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-4 transition-opacity">
                        <div className="self-end">
                          <div className="w-8 h-8 rounded-full bg-[#2a2a2c]/90 border border-[#383838] flex items-center justify-center text-[#ffdb70]">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>

                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#ffdb70] text-[#121212] mb-1">
                            {photo.category}
                          </span>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{photo.title}</h4>
                          {photo.photographer && (
                            <p className="text-[11px] text-white/70">Photo: {photo.photographer}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#383838] bg-[#1e1e1f] shadow-2xl"
            >
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 border border-[#383838] text-white hover:text-[#ffdb70] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
                <img
                  src={lightboxPhoto.imageUrl}
                  alt={lightboxPhoto.title}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>

              <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#383838] bg-[#1e1e1f]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#212123] border border-[#383838] text-[#ffdb70]">
                      {lightboxPhoto.category}
                    </span>
                    {lightboxPhoto.year && (
                      <span className="text-xs text-[#d6d6d6]/60 font-mono">{lightboxPhoto.year}</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#fafafa]">{lightboxPhoto.title}</h3>
                  {lightboxPhoto.photographer && (
                    <p className="text-xs text-[#d6d6d6]/70 mt-0.5">Photography by {lightboxPhoto.photographer}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
