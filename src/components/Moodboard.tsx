import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Sparkles, RefreshCw, ArrowRight, ImageOff, X } from 'lucide-react';
import { searchImages, ImageResult, getMoodboardQuery } from '../services/unsplashService';

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
  hasGenerated?: boolean;
  images: ImageResult[];
  searchQuery: string;
  loading: boolean;
  onFetch: (query: string, force?: boolean) => void;
}

interface ImageCardProps {
  img: ImageResult;
  searchQuery: string;
  onUseStyle: (k: string) => void;
  onEnlarge: (img: ImageResult) => void;
  lang: string;
  mainColor: string;
  selectedOptions: string[];
}

const ImageCard: React.FC<ImageCardProps> = ({ img, searchQuery, onUseStyle, onEnlarge, lang, mainColor, selectedOptions }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) return null;

  const displayKeywords = selectedOptions.length > 0 
    ? selectedOptions.slice(0, 2).join(' + ') + (selectedOptions.length > 2 ? '...' : '')
    : (img.alt_description || '').replace(' aesthetic reference', '').charAt(0).toUpperCase() + (img.alt_description || '').replace(' aesthetic reference', '').slice(1);

  return (
    <motion.div
      layout
      className="group relative rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl aspect-[3/4] w-full cursor-zoom-in"
      onClick={() => onEnlarge(img)}
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

      {/* Source Badge -> Concept Keywords Badge */}
      <div className="absolute top-4 left-4 z-20">
        <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 max-w-[150px] truncate">
          <span className="text-[8px] font-mono tracking-widest text-white/80 uppercase whitespace-nowrap">{displayKeywords}</span>
        </div>
      </div>

      {/* Loading Indicator */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
          <div className="w-10 h-10 rounded-full border border-white/10 border-t-white/40 animate-spin" />
        </div>
      )}
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
  triggerUpdate,
  hasGenerated = false,
  images,
  searchQuery,
  loading,
  onFetch
}) => {
  const [enlargedImage, setEnlargedImage] = useState<ImageResult | null>(null);
  const mainColor = selectedObjectColors?.[0] || (history.length > 0 && history[0].objColors?.[0]) || '#FF6321';

  const analyzeDNA = () => {
    // Prioritize current selections if they exist, otherwise fallback to history
    const sourceOptions = selectedOptions.length > 0 ? selectedOptions : (history.length > 0 ? (history[0].options || []) : []);
    const sourceIdea = selectedOptions.length > 0 ? currentIdea : (history.length > 0 ? (history[0].subject || "") : "");

    if (sourceOptions.length === 0 && !sourceIdea) return "";

    return getMoodboardQuery(sourceOptions, sourceIdea);
  };

  const handleManualRefresh = () => {
    const query = analyzeDNA();
    onFetch(query, true);
  };

  // Sync with history/generation state AND current selections
  useEffect(() => {
    const query = analyzeDNA();
    onFetch(query);
  }, [triggerUpdate, history[0]?.id, selectedOptions.join(',')]);

  const t = {
    en: {
      title: "Design Archive",
      subtitle: "A cumulative collection of aesthetic references from your design journey",
      loading: "Archiving DNA...",
      empty: "Your design archive will fill up once you start setting your design or create your first one.",
      refresh: "Add More"
    },
    ko: {
      title: "디자인 아카이브",
      subtitle: "당신의 디자인 여정에서 수집된 심미적 레퍼런스 누적 컬렉션",
      loading: "아카이브 분석 중...",
      empty: "디자인 설정을 시작하거나 첫 생성을 완료하면 아카이브가 채워집니다.",
      refresh: "더 불러오기"
    }
  }[lang];

  // STRICT EMPTY STATE: 
  // Show empty if no history AND no active selections.
  const isEmpty = history.length === 0 && selectedOptions.length === 0;

  if (isEmpty) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-10 text-center px-4">
        <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
          <Sparkles className="w-8 h-8 text-white/60" />
        </div>
        <div className="h-12 flex items-center justify-center">
          <p className="text-sm text-white/90 font-light tracking-[0.1em] max-w-xs leading-relaxed">
            {t.empty}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 p-4 md:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/20 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
            <span className="text-[10px] font-mono tracking-[0.4em] text-white/80 uppercase">Aesthetic Intelligence</span>
          </div>
          <h2 className="text-5xl font-sans font-medium tracking-tight text-white">
            {t.title}
          </h2>
          <p className="text-sm text-white/70 font-light max-w-md leading-relaxed">
            {t.subtitle}
          </p>
        </div>
        <button 
          onClick={handleManualRefresh}
          disabled={loading}
          className="group flex items-center gap-4 px-8 py-4 rounded-full bg-white/15 border border-white/30 text-[10px] font-mono tracking-widest text-white hover:bg-white/25 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'opacity-40' : ''} transition-opacity`} />
          {t.refresh.toUpperCase()}
        </button>
      </div>

      {loading && images.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-6">
          <p className="text-[10px] text-white/20 font-mono tracking-[0.3em] uppercase animate-pulse">{t.loading}</p>
        </div>
      ) : images.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-6 border border-dashed border-white/10 rounded-[3rem]">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5 text-white/40" />
          </div>
          <p className="text-sm text-white/40 font-light tracking-wide">디자인을 생성하여 영감을 얻으세요</p>
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
                onEnlarge={setEnlargedImage}
                lang={lang} 
                mainColor={mainColor}
                selectedOptions={selectedOptions}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Enlargement Modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-xl"
            onClick={() => setEnlargedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative group">
                <img 
                  src={enlargedImage.urls.regular} 
                  alt={enlargedImage.alt_description}
                  className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl border border-white/10"
                  referrerPolicy="no-referrer"
                />
                
                {/* Top Right Actions */}
                <div className="absolute top-6 right-6 flex items-center gap-3">
                  <button
                    onClick={() => onUseStyle(enlargedImage.alt_description)}
                    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                    title={lang === 'ko' ? '이 스타일 사용' : 'USE THIS STYLE'}
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEnlargedImage(null)}
                    className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-all"
                    title={lang === 'ko' ? '닫기' : 'CLOSE'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-white/60 text-[11px] font-mono tracking-widest uppercase max-w-2xl leading-relaxed">
                  {enlargedImage.alt_description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
