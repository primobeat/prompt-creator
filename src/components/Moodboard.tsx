import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Sparkles, RefreshCw, ArrowRight, ImageOff } from 'lucide-react';
import { searchUnsplashImages, UnsplashImage, getKeywordsFromHistory, mapToEnglish } from '../services/unsplashService';

interface MoodboardProps {
  history: any[];
  currentIdea: string;
  selectedOptions: string[];
  selectedBgColors: string[];
  selectedObjectColors: string[];
  selectedCamera: string;
  onUseStyle: (keywords: string) => void;
  lang: 'en' | 'ko';
  triggerUpdate?: number;
}

interface ImageCardProps {
  img: UnsplashImage;
  searchQuery: string;
  onUseStyle: (k: string) => void;
  lang: string;
  mainColor: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ img, searchQuery, onUseStyle, lang, mainColor }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) return null;

  return (
    <motion.div
      layout
      className="group relative rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl aspect-[3/4] w-full"
    >
      {!error ? (
        <img 
          src={img.urls.regular} 
          alt={img.alt_description}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-white/5" />
        </div>
      )}

      {/* Loading Indicator */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
          <div className="w-10 h-10 rounded-full border border-white/10 border-t-white/40 animate-spin" />
        </div>
      )}
      
      {/* Minimal Action Overlay - Only Button on Hover */}
      <div className={`absolute inset-0 transition-opacity duration-300 flex items-start justify-end p-6 ${loaded ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => onUseStyle(img.alt_description)}
          className="p-4 rounded-full bg-white text-black hover:scale-110 transition-transform shadow-2xl"
          title="Use this style"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export const Moodboard: React.FC<MoodboardProps> = ({ 
  history, 
  currentIdea, 
  selectedOptions, 
  selectedBgColors,
  selectedObjectColors,
  selectedCamera, 
  onUseStyle, 
  lang,
  triggerUpdate
}) => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mainColor = selectedObjectColors?.[0] || (history.length > 0 && history[0].objColors?.[0]) || '#FF6321';

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('moodboard_cache');
    if (savedData) {
      try {
        const { images: savedImages, query: savedQuery } = JSON.parse(savedData);
        setImages(savedImages);
        setSearchQuery(savedQuery);
      } catch (e) {
        console.error("Failed to load moodboard cache", e);
      }
    }
  }, []);

  const analyzeDNA = () => {
    const dna: string[] = [];
    
    // 1. Concept (Priority) - 1:1 Matching
    if (selectedOptions.includes('Minimalist')) dna.push("Minimalist Architecture");
    if (selectedOptions.includes('Geometric')) dna.push("Geometric Brutalism");
    if (selectedOptions.includes('Detailism')) dna.push("Intricate Detail Design");

    // 2. Visual Style & Texture Filter
    if (selectedOptions.includes('3D Rendering')) {
      dna.push("Cinema4D,Octane Render,Abstract 3D Shape");
    } else if (selectedOptions.includes('Real Photo')) {
      dna.push("Architectural Photography,High-end Design");
    } else if (selectedOptions.includes('2D Artwork')) {
      dna.push("Graphic Design,Flat Illustration");
    } else if (selectedOptions.includes('Icon')) {
      dna.push("Minimalist Icon Design,Vector Symbol");
    }

    // 3. Shape/Geometry Injection
    const shapeOptions = ['Soft Volume', 'Inflatable', 'Geometric Abstract', 'Wireframe', 'Circle', 'Square', 'Organic Curve'];
    selectedOptions.forEach(opt => {
      if (shapeOptions.includes(opt)) dna.push(opt);
    });

    // 4. Lighting & Environment Sync
    const lightingOptions = ['Natural Light', 'Cinematic Neon', 'Soft White', 'Dark Mood', 'Golden Hour', 'Blue Hour', 'Studio'];
    selectedOptions.forEach(opt => {
      if (lightingOptions.includes(opt)) dna.push(opt + " lighting");
    });

    // 5. Background Color Sync
    if (selectedBgColors.length > 0) {
      dna.push(selectedBgColors[0] + " background");
    }

    // 6. Current Idea Context
    if (currentIdea && currentIdea.trim()) {
      dna.push(currentIdea.trim());
    }

    return dna.join(',');
  };

  const fetchMoodboard = async () => {
    const query = analyzeDNA();
    // If no query components at all, don't search (prevents random results)
    if (!query || query.trim() === "") {
      setImages([]);
      return;
    }

    setLoading(true);
    setSearchQuery(query);
    
    const results = await searchUnsplashImages(query);
    setImages(results);
    setLoading(false);

    // Save to localStorage
    localStorage.setItem('moodboard_cache', JSON.stringify({
      images: results,
      query: query,
      timestamp: Date.now()
    }));
  };

  // ONLY update when triggerUpdate changes (explicitly triggered from App.tsx)
  useEffect(() => {
    if (triggerUpdate) {
      fetchMoodboard();
    }
  }, [triggerUpdate]);

  const t = {
    en: {
      title: "Design DNA Moodboard",
      subtitle: "Aesthetic references analyzed from your design concepts",
      loading: "Analyzing DNA...",
      empty: "Inspiration will fill up once you create your first design.",
      refresh: "Refresh"
    },
    ko: {
      title: "디자인 DNA 무드보드",
      subtitle: "당신의 디자인 컨셉을 분석한 심미적 레퍼런스",
      loading: "DNA 분석 중...",
      empty: "첫 디자인을 생성하면 영감이 채워집니다.",
      refresh: "새로고침"
    }
  }[lang];

  // STRICT EMPTY STATE: If history is empty, show empty state regardless of cache
  const isEmpty = history.length === 0;

  if (isEmpty) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-8 text-center px-4">
        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white/20" />
        </div>
        <p className="text-sm text-white/60 font-light tracking-[0.05em] max-w-xs leading-relaxed">
          {t.empty}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16 p-4 md:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="text-[10px] font-mono tracking-[0.4em] text-white/60 uppercase">Aesthetic Intelligence</span>
          </div>
          <h2 className="text-5xl font-sans font-medium tracking-tight text-white">
            {t.title}
          </h2>
          <p className="text-sm text-white/50 font-light max-w-md leading-relaxed">
            {t.subtitle}
          </p>
        </div>
        <button 
          onClick={fetchMoodboard}
          disabled={loading}
          className="group flex items-center gap-4 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono tracking-widest text-white/70 hover:text-white hover:bg-white/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'opacity-20' : ''} transition-opacity`} />
          {t.refresh.toUpperCase()}
        </button>
      </div>

      {loading && images.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-6">
          <p className="text-[10px] text-white/20 font-mono tracking-[0.3em] uppercase animate-pulse">{t.loading}</p>
        </div>
      ) : images.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-6 border border-dashed border-white/5 rounded-[3rem]">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5 text-white/20" />
          </div>
          <p className="text-sm text-white/20 font-light tracking-wide">디자인을 생성하여 영감을 얻으세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {images.map((img) => (
              <ImageCard 
                key={img.id} 
                img={img} 
                searchQuery={searchQuery} 
                onUseStyle={onUseStyle} 
                lang={lang} 
                mainColor={mainColor}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
