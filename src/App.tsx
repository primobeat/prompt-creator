/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Copy, Check, RefreshCw, Palette, Layout, Cloud, CloudSun, 
  Zap, Box, Droplets, Gem, Candy, Wind, Gamepad2, Layers, Plus, X, 
  Camera, Maximize, Image as ImageIcon, BarChart3, Activity, Thermometer, 
  Layers as LayersIcon, Info, ChevronDown, PenTool, Sun, Moon, Scissors, Square,
  Download, Pencil, StickyNote, Grid, Focus, Aperture, Film, Clock, Eye, Move, Circle, Users
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { 
  expandPrompt, analyzeImage, generateWallpaper, PromptExpansion, StyleOption, 
  InsightDashboard as InsightType 
} from './services/geminiService';

interface HistoryLog {
  id: string;
  date: string;
  visualStyle: string;
  subject: string;
  options: StyleOption[];
  prompt: string;
  insights: InsightType;
  camera: string;
  ratio: string;
  bgColors: string[];
  objColors: string[];
  referenceImage: string | null;
}

const CustomDropdown = ({ 
  label, 
  value, 
  options, 
  displayOptions,
  onChange,
  icon: Icon
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  displayOptions?: string[];
  onChange: (val: string) => void;
  icon?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5 ml-1">
        {Icon && <Icon className="w-3 h-3 text-white" />}
        <label className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-white">
          {label}
        </label>
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-normal text-white flex items-center justify-between hover:bg-white/10 transition-all outline-none"
      >
        {value}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="w-3 h-3 text-white/40" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 top-full left-0 w-full mt-2 p-2 rounded-2xl bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {options.map((opt, idx) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-[11px] font-normal text-left transition-all ${
                  value === (displayOptions ? displayOptions[idx] : opt)
                    ? 'bg-white text-black' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {displayOptions ? displayOptions[idx] : opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [idea, setIdea] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<StyleOption[]>([]);
  const [selectedBgColors, setSelectedBgColors] = useState<string[]>([]);
  const [selectedObjectColors, setSelectedObjectColors] = useState<string[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('Eye Level');
  const [selectedRatio, setSelectedRatio] = useState<string>('1:1');
  const [customColor, setCustomColor] = useState('#707070');
  const [activePickerType, setActivePickerType] = useState<'bg' | 'object' | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const bgButtonRef = useRef<HTMLDivElement>(null);
  const objectButtonRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [pickerPosition, setPickerPosition] = useState({ bottom: 0, right: 0 });
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PromptExpansion | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'ko'>('ko');
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'CREATE' | 'HISTORY' | 'UPGRADE'>('CREATE');
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    const getNextImageUrl = () => `https://picsum.photos/3840/2160?grayscale&random=${Math.random()}`;
    
    // Set initial image
    setBgImage(getNextImageUrl());

    // Interval for automatic rotation every 15 seconds
    const interval = setInterval(() => {
      const nextUrl = getNextImageUrl();
      
      // Preloading logic to prevent flickering
      const img = new Image();
      img.src = nextUrl;
      img.onload = () => {
        setBgImage(nextUrl);
      };
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const [userTier, setUserTier] = useState<'FREE' | 'PRO' | 'TEAM'>('FREE');
  const [generationCount, setGenerationCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  const resetApp = () => {
    setIdea('');
    setReferenceImage(null);
    setSelectedOptions([]);
    setSelectedBgColors([]);
    setSelectedObjectColors([]);
    setSelectedCamera('Eye Level');
    setSelectedRatio('1:1');
    setResult(null);
    setGeneratedImage(null);
    setImageError(null);
    setIsEditing(false);
    setActiveTab('CREATE');
    setSelectedHistoryId(null);
    setRestoreMessage(null);
  };

  const t = {
    en: {
      subtitle: "Imaginary images and prompts created with just a click.",
      yourIdea: "Your Idea",
      placeholder: "Describe your image",
      camera: "Camera",
      ratio: "Ratio",
      artStyle: "Art Style",
      texture: "Texture",
      lighting: "Lighting",
      colorMood: "Color Mood",
      bgColor: "Background Color",
      objColor: "Object Color",
      refImage: "Reference Image",
      uploadDesc: "Click or drag to upload a reference image",
      analyzing: "Analyzing...",
      generate: "Generate",
      insight: "Insight Dashboard",
      visualBalance: "Visual Balance",
      textureDensity: "Texture Density",
      temp: "Temperature",
      dyn: "Dynamism",
      designIntent: "Design Intent",
      concept: "Concept",
      dimension: "Visual Style",
      structure: "Shape",
      material: "Material",
      scene: "Scene",
      lighting_3d: "Lighting",
      lighting_photo: "Lighting",
      icon_style: "Style",
      icon_finish: "Finish Effect",
      icon_container: "Container",
      form: "Form",
      technique: "Technique",
      subject: "Subject",
      finish: "Finish",
      texture_effect: "Texture",
      shotType: "Shot Type",
      environment: "Environment",
      bg_composition: "Background",
      designing: "Designing...",
      readyTitle: "Ready?",
      readyDesc: "Select styles, add ideas, and get your prompt.",
      styles: {
        'Minimalist': 'Minimalist',
        'Geometric': 'Geometric',
        'Detailism': 'Detailism',
        '2D Artwork': '2D Artwork',
        '3D Rendering': '3D Rendering',
        'Real Photo': 'Real Photo',
        'Icon': 'Icon',
        'Vector': 'Vector',
        'Line Art': 'Line Art',
        'Gouache': 'Gouache',
        'Pixel Art': 'Pixel Art',
        'Soft Volume': 'Soft Volume',
        'Inflatable': 'Inflatable',
        'Geometric Abstract': 'Geometric Abstract',
        'Transparent Glass': 'Transparent Glass',
        'Reflective Metal': 'Reflective Metal',
        'Matte Clay': 'Matte Clay',
        'Paper': 'Paper',
        'Emissive': 'Emissive',
        'Infinity Wall': 'Infinity Wall',
        'Levitation': 'Levitation',
        'Minimal Room': 'Minimal Room',
        'Soft White': 'Soft White',
        'Dark Mood': 'Dark Mood',
        'Halftone': 'Halftone',
        'Noise': 'Noise',
        'Paper Texture': 'Paper Texture',
        'Flat Color': 'Flat Color',
        'Solid': 'Solid',
        'Gradient': 'Gradient',
        'Textured Paper': 'Textured Paper',
        'Abstract Shapes': 'Abstract Shapes',
        'Transparent Background': 'Transparent Background',
        'Isometric': 'Isometric',
        'Volume': 'Volume',
        'Wireframe': 'Wireframe',
        'Clay': 'Clay',
        'Glass': 'Glass',
        'Metal': 'Metal',
        'Person': 'Person',
        'Landscape': 'Landscape',
        'Product': 'Product',
        'Architecture': 'Architecture',
        'Close-up': 'Close-up',
        'Medium Shot': 'Medium Shot',
        'Full Shot': 'Full Shot',
        'Panorama': 'Panorama',
        'Long Exposure': 'Long Exposure',
        'Natural Light': 'Natural Light',
        'Golden Hour': 'Golden Hour',
        'Blue Hour': 'Blue Hour',
        'Studio': 'Studio',
        'Cinematic Neon': 'Cinematic Neon',
        'Mist': 'Mist',
        'Out of Focus (f/1.8)': 'Out of Focus (f/1.8)',
        'Pan Focus (f/11)': 'Pan Focus (f/11)',
        'Fisheye Lens': 'Fisheye Lens',
        'Macro': 'Macro',
        'Film Grain': 'Film Grain',
        'Line': 'Line',
        'Realism': 'Realism',
        '3D Clay': '3D Clay',
        'Hand-drawn': 'Hand-drawn',
        'Fill': 'Fill',
        'Duotone': 'Duotone',
        'Glassmorphism': 'Glassmorphism',
        'Soft Shadow': 'Soft Shadow',
        'None': 'None',
        'Circle': 'Circle',
        'Square': 'Square',
        'Organic Curve': 'Organic Curve'
      },
      moods: {
        Vibrant: 'Vibrant',
        Pastel: 'Pastel',
        Dark: 'Dark',
        Monotone: 'Monotone',
        Neon: 'Neon',
        Warm: 'Warm'
      },
      cameraOpts: {
        'High Angle': 'High Angle',
        'Eye Level': 'Eye Level',
        'Low Angle': 'Low Angle',
        'Top View': 'Top View',
        'Isometric': 'Isometric'
      },
      forging: "Generating image...",
      upgrade: "Upgrade",
      proOnly: "PRO Exclusive",
      proOnlyDesc: "This feature is only available for PRO users.",
      limitReached: "Daily Limit Reached",
      limitReachedDesc: "You have reached your daily limit of 3 generations.",
      upgradeBtn: "Upgrade to PRO",
      pricing: {
        free: {
          name: "FREE",
          price: "$0",
          period: "Forever",
          features: ["3 generations / day", "Standard quality", "Ad-supported prompts"]
        },
        pro: {
          name: "PRO",
          price: "$29",
          period: "per month",
          features: ["Unlimited generations", "High resolution (4K)", "All icon styles unlocked", "No ads"]
        },
        team: {
          name: "TEAM",
          price: "$99",
          period: "per month",
          features: ["Shared history workspace", "Commercial license", "Priority generation", "Admin dashboard"]
        }
      }
    },
    ko: {
      subtitle: "클릭 만으로 완성하는 상상 속 이미지와 프롬프트",
      yourIdea: "아이디어",
      placeholder: "무엇을 그려볼까요?",
      camera: "카메라 각도",
      ratio: "비율",
      artStyle: "아트 스타일",
      texture: "질감",
      lighting: "조명",
      colorMood: "컬러 무드",
      bgColor: "배경색",
      objColor: "오브젝트 색상",
      refImage: "레퍼런스 이미지",
      uploadDesc: "이미지를 클릭하거나 드래그하여 업로드하세요",
      analyzing: "분석 중...",
      generate: "생성",
      insight: "인사이트 대시보드",
      visualBalance: "시각적 균형",
      textureDensity: "질감 밀도",
      temp: "온도",
      dyn: "역동성",
      designIntent: "디자인 의도",
      concept: "컨셉 (Concept)",
      dimension: "비주얼 스타일 (Visual Style)",
      structure: "형태 (Shape)",
      material: "구도/거리 (Material)",
      scene: "무대 설정 (Scene)",
      lighting_3d: "조명 분위기 (Lighting)",
      lighting_photo: "조명 분위기 (Lighting)",
      icon_style: "스타일 (Style)",
      icon_finish: "마감 효과 (Finish Effect)",
      icon_container: "컨테이너 (Container)",
      form: "형태 (Form)",
      technique: "표현 기법 (Technique)",
      subject: "주제 (Subject)",
      finish: "마감 (Finish)",
      texture_effect: "질감/효과 (Texture)",
      shotType: "샷 타입 (Shot Type)",
      environment: "환경 (Environment)",
      bg_composition: "배경 구성 (Background)",
      designing: "설계 중...",
      readyTitle: "준비 완료!",
      readyDesc: "스타일과 아이디어를 조합해 프롬프트를 생성해 보세요.",
      styles: {
        'Minimalist': '미니멀리즘',
        'Geometric': '기하학',
        'Detailism': '디테일리즘',
        '2D Artwork': '2D 아트워크',
        '3D Rendering': '3D 렌더링',
        'Real Photo': '실사 사진',
        'Icon': '아이콘',
        'Vector': '벡터',
        'Line Art': '라인아트',
        'Gouache': '과슈',
        'Pixel Art': '픽셀아트',
        'Soft Volume': '소프트 볼륨',
        'Inflatable': '인플래터블(풍선)',
        'Geometric Abstract': '기하학적 추상',
        'Transparent Glass': '투명 유리',
        'Reflective Metal': '반사 메탈',
        'Matte Clay': '매트 클레이',
        'Paper': '페이퍼',
        'Emissive': '발광체(Emissive)',
        'Infinity Wall': '인피니티 월',
        'Levitation': '공중 부양',
        'Minimal Room': '미니멀 룸',
        'Soft White': '소프트 화이트',
        'Dark Mood': '다크 무드(안개)',
        'Halftone': '하프톤',
        'Noise': '노이즈',
        'Paper Texture': '페이퍼 질감',
        'Flat Color': '플랫 컬러',
        'Solid': '단색',
        'Gradient': '그라데이션',
        'Textured Paper': '질감 종이',
        'Abstract Shapes': '추상 도형',
        'Transparent Background': '투명 배경',
        'Isometric': '아이소메트릭',
        'Volume': '볼륨',
        'Wireframe': '와이어프레임',
        'Clay': '클레이',
        'Glass': '유리',
        'Metal': '메탈',
        'Person': '인물',
        'Landscape': '풍경',
        'Product': '제품',
        'Architecture': '건축',
        'Close-up': '클로즈업',
        'Medium Shot': '미디엄 샷',
        'Full Shot': '풀샷',
        'Panorama': '파노라마',
        'Long Exposure': '장노출',
        'Natural Light': '자연광',
        'Golden Hour': '골든 아워',
        'Blue Hour': '블루 아워',
        'Studio': '스튜디오',
        'Cinematic Neon': '시네마틱 네온',
        'Mist': '안개',
        'Out of Focus (f/1.8)': '아웃포커싱(f/1.8)',
        'Pan Focus (f/11)': '팬포커스(f/11)',
        'Fisheye Lens': '어안 렌즈',
        'Macro': '매크로(접사)',
        'Film Grain': '필름 그레인',
        'Line': '라인(Line)',
        'Realism': '리얼리즘',
        '3D Clay': '3D 클레이',
        'Hand-drawn': '핸드드로잉',
        'Fill': '채우기',
        'Duotone': '듀오톤',
        'Glassmorphism': '유리(Glassmorphism)',
        'Soft Shadow': '부드러운 그림자',
        'None': '없음',
        'Circle': '서클',
        'Square': '스퀘어',
        'Organic Curve': '유기적 곡선'
      },
      moods: {
        Vibrant: '비비드',
        Pastel: '파스텔',
        Dark: '다크',
        Monotone: '모노톤',
        Neon: '네온',
        Warm: '웜'
      },
      cameraOpts: {
        'High Angle': '하이 앵글',
        'Eye Level': '아이 레벨',
        'Low Angle': '로우 앵글',
        'Top View': '톱 뷰',
        'Isometric': '아이소메트릭'
      },
      forging: "이미지 생성 중...",
      upgrade: "업그레이드",
      proOnly: "PRO 전용 기능",
      proOnlyDesc: "이 기능은 PRO 요금제에서만 사용 가능합니다.",
      limitReached: "일일 생성 한도 초과",
      limitReachedDesc: "무료 요금제의 일일 한도(3회)를 모두 사용하셨습니다.",
      upgradeBtn: "PRO로 업그레이드",
      pricing: {
        free: {
          name: "FREE",
          price: "무료",
          period: "평생",
          features: ["하루 3회 생성 가능", "기본 화질", "광고 포함 프롬프트"]
        },
        pro: {
          name: "PRO",
          price: "$29",
          period: "월",
          features: ["무제한 생성", "고해상도(4K)", "모든 아이콘 스타일 개방", "광고 제거"]
        },
        team: {
          name: "TEAM",
          price: "$99",
          period: "월",
          features: ["공동 HISTORY 작업실", "기업용 상업 라이선스", "우선 생성권", "관리자 대시보드"]
        }
      }
    }
  }[lang];

  // Auto-expand textarea
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      const scrollHeight = el.scrollHeight;
      // Ensure it doesn't go below our new substantial minimum height
      el.style.height = `${Math.max(80, scrollHeight)}px`;
    }
  }, [idea]);

  const [isDesigning, setIsDesigning] = useState(false);
  const prevSelectedOptionsRef = useRef<StyleOption[]>([]);

  useEffect(() => {
    prevSelectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  const selectedDimension = selectedOptions.find(opt => ['2D Artwork', '3D Rendering', 'Real Photo', 'Icon'].includes(opt));

  const masterCategories = [
    {
      title: 'CONCEPT',
      key: 'concept',
      options: [
        { label: 'Minimalist' as StyleOption, icon: Sparkles, desc: lang === 'ko' ? '단순함과 여백의 미' : 'Simplicity and whitespace' },
        { label: 'Geometric' as StyleOption, icon: Layout, desc: lang === 'ko' ? '수치적 질서와 기하학적 조형' : 'Numerical order and geometric shapes' },
        { label: 'Detailism' as StyleOption, icon: Zap, desc: lang === 'ko' ? '섬세하고 풍부한 디테일 묘사' : 'Intricate and rich detail description' },
      ]
    },
    {
      title: 'VISUAL STYLE',
      key: 'dimension',
      options: [
        { label: '2D Artwork' as StyleOption, icon: Square, desc: lang === 'ko' ? '평면적인 예술적 표현' : 'Flat artistic expression' },
        { label: '3D Rendering' as StyleOption, icon: Box, desc: lang === 'ko' ? '입체적인 디지털 렌더링' : 'Three-dimensional digital rendering' },
        { label: 'Real Photo' as StyleOption, icon: Camera, desc: lang === 'ko' ? '사실적인 사진 촬영 기법' : 'Realistic photography techniques' },
        { label: 'Icon' as StyleOption, icon: ImageIcon, desc: lang === 'ko' ? '심플하고 명확한 상징 체계' : 'Simple and clear symbolic system' },
      ]
    }
  ];

  const subCategories: { title: string; key: string; options: { label: StyleOption; icon: any; desc: string }[] }[] = [
    // Step 3: Dynamic STYLE/SUBJECT
    ...(selectedDimension === '2D Artwork' ? [{
      title: 'TECHNIQUE',
      key: 'technique',
      options: [
        { label: 'Vector' as StyleOption, icon: PenTool, desc: lang === 'ko' ? '깔끔한 벡터 그래픽' : 'Clean vector graphics' },
        { label: 'Line Art' as StyleOption, icon: Pencil, desc: lang === 'ko' ? '섬세한 선 중심의 아트' : 'Intricate line-focused art' },
        { label: 'Gouache' as StyleOption, icon: Palette, desc: lang === 'ko' ? '불투명하고 부드러운 질감' : 'Opaque and soft texture' },
        { label: 'Pixel Art' as StyleOption, icon: Layout, desc: lang === 'ko' ? '고전적인 도트 그래픽' : 'Classic dot graphics' },
      ]
    }] : []),
    ...(selectedDimension === '3D Rendering' ? [{
      title: 'SHAPE',
      key: 'structure',
      options: [
        { label: 'Soft Volume' as StyleOption, icon: Box, desc: lang === 'ko' ? '부드러운 볼륨감의 입체' : 'Soft volume 3D' },
        { label: 'Inflatable' as StyleOption, icon: Cloud, desc: lang === 'ko' ? '풍선처럼 부푼 형태' : 'Inflatable balloon-like form' },
        { label: 'Geometric Abstract' as StyleOption, icon: Zap, desc: lang === 'ko' ? '기하학적 추상 형태' : 'Geometric abstract form' },
        { label: 'Wireframe' as StyleOption, icon: Square, desc: lang === 'ko' ? '구조가 보이는 선형 입체' : 'Structural linear 3D' },
      ]
    }] : []),
    ...(selectedDimension === 'Real Photo' ? [{
      title: 'LENS/OPTICS',
      key: 'structure',
      options: [
        { label: 'Out of Focus (f/1.8)' as StyleOption, icon: Focus, desc: lang === 'ko' ? '아웃포커싱(f/1.8)' : 'Out of focus bokeh' },
        { label: 'Pan Focus (f/11)' as StyleOption, icon: Aperture, desc: lang === 'ko' ? '팬포커스(f/11)' : 'Deep depth of field' },
        { label: 'Fisheye Lens' as StyleOption, icon: Eye, desc: lang === 'ko' ? '어안 렌즈' : 'Ultra wide angle' },
        { label: 'Macro' as StyleOption, icon: Maximize, desc: lang === 'ko' ? '매크로(접사)' : 'Extreme close-up' },
        { label: 'Film Grain' as StyleOption, icon: Film, desc: lang === 'ko' ? '필름 그레인' : 'Analog film texture' },
      ]
    }] : []),
    ...(selectedDimension === 'Icon' ? [{
      title: 'ICON STYLE',
      key: 'icon_style',
      options: [
        { label: 'Line' as StyleOption, icon: Pencil, desc: lang === 'ko' ? '세련된 선 중심 스타일' : 'Sophisticated line-focused style' },
        { label: 'Solid' as StyleOption, icon: Square, desc: lang === 'ko' ? '면 중심의 솔리드 스타일' : 'Surface-focused solid style' },
        { label: 'Realism' as StyleOption, icon: Camera, desc: lang === 'ko' ? '사실적인 묘사의 스타일' : 'Realistic depiction style' },
        { label: '3D Clay' as StyleOption, icon: Cloud, desc: lang === 'ko' ? '부드러운 점토 느낌의 입체' : 'Soft clay-like 3D' },
        { label: 'Glass' as StyleOption, icon: Gem, desc: lang === 'ko' ? '투명한 유리 질감' : 'Transparent glass texture' },
        { label: 'Hand-drawn' as StyleOption, icon: PenTool, desc: lang === 'ko' ? '손으로 그린 듯한 감성' : 'Hand-drawn emotional style' },
      ]
    }] : []),
    // Step 4: Dynamic FINISH/SHOT TYPE
    ...(selectedDimension === '2D Artwork' ? [{
      title: 'TEXTURE',
      key: 'texture_effect',
      options: [
        { label: 'Halftone' as StyleOption, icon: Grid, desc: lang === 'ko' ? '망점 패턴의 인쇄 질감' : 'Dot pattern print texture' },
        { label: 'Noise' as StyleOption, icon: Wind, desc: lang === 'ko' ? '거친 입자감의 노이즈' : 'Gritty grain noise' },
        { label: 'Paper Texture' as StyleOption, icon: StickyNote, desc: lang === 'ko' ? '종이 특유의 아날로그 질감' : 'Analog paper texture' },
        { label: 'Flat Color' as StyleOption, icon: Layers, desc: lang === 'ko' ? '단순하고 깔끔한 색면' : 'Simple and clean flat colors' },
      ]
    }] : []),
    ...(selectedDimension === '3D Rendering' ? [{
      title: 'MATERIAL',
      key: 'material',
      options: [
        { label: 'Matte Clay' as StyleOption, icon: Cloud, desc: lang === 'ko' ? '부드러운 점토 질감' : 'Soft matte clay texture' },
        { label: 'Transparent Glass' as StyleOption, icon: Gem, desc: lang === 'ko' ? '투명하고 맑은 유리' : 'Clear transparent glass' },
        { label: 'Reflective Metal' as StyleOption, icon: Zap, desc: lang === 'ko' ? '반사되는 단단한 금속' : 'Reflective hard metal' },
        { label: 'Paper' as StyleOption, icon: StickyNote, desc: lang === 'ko' ? '종이 질감' : 'Paper texture' },
        { label: 'Emissive' as StyleOption, icon: Sun, desc: lang === 'ko' ? '빛을 내는 발광체' : 'Light-emitting material' },
      ]
    }] : []),
    ...(selectedDimension === 'Real Photo' ? [{
      title: 'COMPOSITION/DISTANCE',
      key: 'material',
      options: [
        { label: 'Close-up' as StyleOption, icon: Maximize, desc: lang === 'ko' ? '피사체에 밀착한 구도' : 'Close-up composition' },
        { label: 'Medium Shot' as StyleOption, icon: Move, desc: lang === 'ko' ? '피사체의 상반신 중심 구도' : 'Medium shot composition' },
        { label: 'Full Shot' as StyleOption, icon: Cloud, desc: lang === 'ko' ? '피사체 전체가 보이는 구도' : 'Full shot composition' },
        { label: 'Panorama' as StyleOption, icon: Layout, desc: lang === 'ko' ? '넓은 파노라마 뷰' : 'Wide panorama view' },
        { label: 'Long Exposure' as StyleOption, icon: Clock, desc: lang === 'ko' ? '장노출 효과' : 'Long exposure effect' },
      ]
    }] : []),
    ...(selectedDimension === 'Icon' ? [{
      title: 'FINISH EFFECT',
      key: 'icon_finish',
      options: [
        { label: 'Gradient' as StyleOption, icon: Palette, desc: lang === 'ko' ? '부드러운 색상 변화' : 'Smooth color transition' },
        { label: 'Halftone' as StyleOption, icon: Grid, desc: lang === 'ko' ? '망점 패턴 효과' : 'Dot pattern effect' },
        { label: 'Noise' as StyleOption, icon: Wind, desc: lang === 'ko' ? '거친 입자감의 질감' : 'Gritty grain texture' },
        { label: 'Soft Shadow' as StyleOption, icon: Cloud, desc: lang === 'ko' ? '부드러운 그림자 효과' : 'Soft shadow effect' },
      ]
    }] : []),
    // Step 5: Dynamic BACKGROUND/ENVIRONMENT
    ...(selectedDimension === '2D Artwork' ? [{
      title: 'BACKGROUND',
      key: 'bg_composition',
      options: [
        { label: 'Solid' as StyleOption, icon: Square, desc: lang === 'ko' ? '깔끔한 단색 배경' : 'Clean solid background' },
        { label: 'Gradient' as StyleOption, icon: Palette, desc: lang === 'ko' ? '부드러운 그라데이션' : 'Smooth gradient background' },
        { label: 'Textured Paper' as StyleOption, icon: StickyNote, desc: lang === 'ko' ? '질감이 살아있는 종이' : 'Textured paper background' },
        { label: 'Abstract Shapes' as StyleOption, icon: Layout, desc: lang === 'ko' ? '감각적인 추상 도형' : 'Sensory abstract shapes' },
        { label: 'Transparent Background' as StyleOption, icon: Maximize, desc: lang === 'ko' ? '투명 배경' : 'Transparent background' },
      ]
    }] : []),
    ...(selectedDimension === '3D Rendering' ? [{
      title: 'SCENE',
      key: 'scene',
      options: [
        { label: 'Studio' as StyleOption, icon: Camera, desc: lang === 'ko' ? '정교하게 제어된 조명' : 'Precisely controlled lighting' },
        { label: 'Infinity Wall' as StyleOption, icon: Layers, desc: lang === 'ko' ? '끝이 없는 배경 벽' : 'Seamless infinity wall' },
        { label: 'Levitation' as StyleOption, icon: Wind, desc: lang === 'ko' ? '공중에 떠 있는 연출' : 'Floating levitation effect' },
        { label: 'Minimal Room' as StyleOption, icon: Layout, desc: lang === 'ko' ? '심플한 실내 공간' : 'Simple minimal room' },
      ]
    }] : []),
    ...(selectedDimension === '3D Rendering' ? [{
      title: 'LIGHTING',
      key: 'lighting_3d',
      options: [
        { label: 'Natural Light' as StyleOption, icon: Sun, desc: lang === 'ko' ? '밝고 화사한 자연광' : 'Bright natural light' },
        { label: 'Cinematic Neon' as StyleOption, icon: Zap, desc: lang === 'ko' ? '강렬한 색채의 네온' : 'Intense neon colors' },
        { label: 'Soft White' as StyleOption, icon: Cloud, desc: lang === 'ko' ? '부드러운 백색광' : 'Soft white lighting' },
        { label: 'Dark Mood' as StyleOption, icon: Wind, desc: lang === 'ko' ? '몽환적인 안개 분위기' : 'Dreamy dark mist atmosphere' },
      ]
    }] : []),
    ...(selectedDimension === 'Real Photo' ? [{
      title: 'LIGHTING',
      key: 'lighting_photo',
      options: [
        { label: 'Golden Hour' as StyleOption, icon: Sun, desc: lang === 'ko' ? '따뜻한 일몰의 빛' : 'Warm sunset light' },
        { label: 'Blue Hour' as StyleOption, icon: Moon, desc: lang === 'ko' ? '차분한 여명의 빛' : 'Calm twilight light' },
        { label: 'Cinematic Neon' as StyleOption, icon: Zap, desc: lang === 'ko' ? '강렬한 색채의 네온' : 'Intense neon colors' },
        { label: 'Natural Light' as StyleOption, icon: CloudSun, desc: lang === 'ko' ? '밝고 화사한 자연광' : 'Bright natural light' },
        { label: 'Dark Mood' as StyleOption, icon: Wind, desc: lang === 'ko' ? '몽환적인 안개 분위기' : 'Dreamy dark mist atmosphere' },
      ]
    }] : []),
    ...(selectedDimension === 'Icon' ? [{
      title: 'CONTAINER',
      key: 'icon_container',
      options: [
        { label: 'None' as StyleOption, icon: X, desc: lang === 'ko' ? '컨테이너 없음' : 'No container' },
        { label: 'Circle' as StyleOption, icon: Circle, desc: lang === 'ko' ? '원형 컨테이너' : 'Circular container' },
        { label: 'Square' as StyleOption, icon: Square, desc: lang === 'ko' ? '사각형 컨테이너' : 'Square container' },
        { label: 'Organic Curve' as StyleOption, icon: Cloud, desc: lang === 'ko' ? '유기적인 곡선 형태' : 'Organic curved shape' },
      ]
    }] : [])
  ];

  const styleCategories = [...masterCategories, ...subCategories];

  const paletteColors = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Gray', value: '#808080' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Orange', value: '#FF9500' },
    { name: 'Yellow', value: '#FFCC00' },
    { name: 'Green', value: '#34C759' },
    { name: 'Blue', value: '#007AFF' },
    { name: 'Purple', value: '#9D00FF' },
    { name: 'Pink', value: '#FF1493' },
  ];

  const getMappedColor = (hex: string) => {
    const r1 = parseInt(hex.slice(1, 3), 16);
    const g1 = parseInt(hex.slice(3, 5), 16);
    const b1 = parseInt(hex.slice(5, 7), 16);

    let minDistance = Infinity;
    let closest = paletteColors[0].value;

    paletteColors.forEach(color => {
      const r2 = parseInt(color.value.slice(1, 3), 16);
      const g2 = parseInt(color.value.slice(3, 5), 16);
      const b2 = parseInt(color.value.slice(5, 7), 16);

      const distance = Math.sqrt(
        Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = color.value;
      }
    });

    // If distance is small enough (e.g., < 60), use palette color. Otherwise use original hex.
    return minDistance < 60 ? closest : hex;
  };

  const cameraOptions = ['Eye Level', 'High Angle', 'Low Angle', 'Top View', 'Isometric'];
  const ratioOptions = ['1:1', '4:5', '16:9', '9:16', '3:2', '2:3'];

  const toggleOption = (option: StyleOption) => {
    // Upsell Trigger for PRO features
    if (userTier === 'FREE') {
      const isIconMode = selectedDimension === 'Icon';
      const isProFeature = 
        (isIconMode && option === 'None') || 
        (isIconMode && option === 'Glass') || 
        (option === 'Realism') ||
        (option === 'Transparent Glass');

      if (isProFeature) {
        setUpgradeReason(t.proOnlyDesc);
        setShowUpgradeModal(true);
        return;
      }
    }

    setIsDesigning(true);
    setTimeout(() => setIsDesigning(false), 800);

    setSelectedOptions(prev => {
      const catIdx = styleCategories.findIndex(cat => cat.options.some(opt => opt.label === option));
      if (catIdx === -1) return prev;

      const category = styleCategories[catIdx];
      
      // Special logic for DIMENSION change: Reset all sub-options
      if (category.key === 'dimension') {
        const conceptOptions = masterCategories.find(c => c.key === 'concept')?.options.map(o => o.label) || [];
        const currentConceptSelection = prev.filter(o => conceptOptions.includes(o));
        
        if (prev.includes(option)) {
          // Toggling off the current dimension
          return currentConceptSelection;
        } else {
          // Switching to a new dimension: Keep concept, set new dimension, clear others
          return [...currentConceptSelection, option];
        }
      }

      const isMultiSelect = category.key === 'finish';

      if (isMultiSelect) {
        // Multi-select logic for FINISH
        if (prev.includes(option)) {
          return prev.filter(o => o !== option);
        } else {
          return [...prev, option];
        }
      } else {
        // Single-select logic for other categories
        const categoryOptions = category.options.map(opt => opt.label);
        const filtered = prev.filter(o => !categoryOptions.includes(o));
        
        return prev.includes(option) ? filtered : [...filtered, option];
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setReferenceImage(base64);
        
        // Auto-analyze
        setAnalyzing(true);
        try {
          const analysis = await analyzeImage(base64);
          if (analysis) {
            setSelectedCamera(analysis.camera);
            setSelectedRatio(analysis.ratio);
            
            // Map analyzed colors
            const mappedBg = (analysis.bgColors || []).map(c => getMappedColor(c));
            const mappedObj = (analysis.objColors || []).map(c => getMappedColor(c));
            
            // Use Set to remove duplicates after mapping
            setSelectedBgColors(Array.from(new Set(mappedBg)));
            setSelectedObjectColors(Array.from(new Set(mappedObj)));

            // If there's a custom color, set it to the customColor state for the picker
            const customBg = mappedBg.find(c => !paletteColors.some(pc => pc.value.toLowerCase() === c.toLowerCase()));
            const customObj = mappedObj.find(c => !paletteColors.some(pc => pc.value.toLowerCase() === c.toLowerCase()));
            if (customBg) setCustomColor(customBg);
            else if (customObj) setCustomColor(customObj);
            
            // Set selected options (Art Style, Texture, Lighting)
            const newOptions: StyleOption[] = [];
            [analysis.artStyle, analysis.texture, analysis.lighting].forEach(opt => {
              if (opt && !newOptions.includes(opt)) {
                newOptions.push(opt);
              }
            });
            setSelectedOptions(newOptions);
          }
        } catch (error) {
          console.error("Image analysis failed", error);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReferenceImage(null);
    setSelectedOptions([]);
    setSelectedBgColors([]);
    setSelectedObjectColors([]);
    setSelectedCamera('Eye Level');
    setSelectedRatio('1:1');
    setActivePickerType(null);
  };

  const handleGenerateAll = async () => {
    if (!idea.trim()) return;
    
    // Check Daily Limit for FREE users
    if (userTier === 'FREE' && generationCount >= 3) {
      setUpgradeReason(t.limitReachedDesc);
      setShowUpgradeModal(true);
      return;
    }

    // Filter selectedOptions to only include currently active/visible options
    const activeOptions = selectedOptions.filter(opt => 
      styleCategories.some(cat => cat.options.some(o => o.label === opt))
    );

    setIsEditing(false);
    setLoading(true);
    setGeneratingImage(true);
    setResult(null);
    setGeneratedImage(null);
    setImageError(null);

    try {
      let finalPromptRes: PromptExpansion | null = null;

      // Run both in parallel but handle them separately to allow partial success
      const promptPromise = expandPrompt(
        idea, 
        activeOptions, 
        formatColors(selectedBgColors), 
        formatColors(selectedObjectColors), 
        selectedCamera,
        selectedRatio as any,
        lang,
        referenceImage || undefined
      ).then(res => {
        finalPromptRes = res;
        setResult(res);
        setLoading(false);
        return res;
      });

      const imagePromise = generateWallpaper(
        idea, 
        activeOptions, 
        formatColors(selectedBgColors), 
        formatColors(selectedObjectColors), 
        selectedCamera,
        selectedRatio as any
      ).then(url => {
        setGeneratedImage(url);
        return url;
      })
      .catch(err => {
        console.error("Image generation failed:", err);
        if (err.message?.includes('429') || err.message?.includes('quota')) {
          setImageError(lang === 'ko' ? '무료 티어 쿼터(일 20회)를 초과했습니다. 내일 다시 시도해주세요.' : 'Free tier quota exceeded. Please try again tomorrow.');
        } else {
          setImageError(lang === 'ko' ? '이미지 생성에 실패했습니다.' : 'Image generation failed.');
        }
        return null;
      })
      .finally(() => setGeneratingImage(false));

      const [promptRes] = await Promise.all([promptPromise, imagePromise]);

      // Save to history if prompt generation was successful
      if (promptRes) {
        setGenerationCount(prev => prev + 1);
        const newLog: HistoryLog = {
          id: `#${String(history.length + 1).padStart(3, '0')}`,
          date: new Date().toISOString().split('T')[0],
          visualStyle: selectedDimension || 'None',
          subject: idea,
          options: [...activeOptions],
          prompt: promptRes.midjourney,
          insights: promptRes.insight,
          camera: selectedCamera,
          ratio: selectedRatio,
          bgColors: [...selectedBgColors],
          objColors: [...selectedObjectColors],
          referenceImage: referenceImage
        };
        setHistory(prev => [newLog, ...prev]);
      }
    } catch (error: any) {
      console.error("Overall generation failed:", error);
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        alert('무료 티어 쿼터(일 20회)를 초과했거나 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('생성에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
      setGeneratingImage(false);
    }
  };

  const restoreHistory = (log: HistoryLog) => {
    setIdea(log.subject);
    setSelectedOptions(log.options);
    setSelectedBgColors(log.bgColors);
    setSelectedObjectColors(log.objColors);
    setSelectedCamera(log.camera);
    setSelectedRatio(log.ratio);
    setReferenceImage(log.referenceImage);
    setResult({
      prompt: log.prompt,
      insight: log.insights
    });
    setGeneratedImage(null); // Reset image as it's a new session
    setActiveTab('CREATE');
    setRestoreMessage(lang === 'ko' ? '이전 설정을 불러왔습니다' : 'Previous settings restored');
    setTimeout(() => setRestoreMessage(null), 3000);
  };

  // Map colors to names if they are in the palette, otherwise keep hex
  const formatColors = (colors: string[]) => {
    return colors.map(hex => {
      const paletteColor = paletteColors.find(pc => pc.value.toLowerCase() === hex.toLowerCase());
      return paletteColor ? paletteColor.name.toLowerCase() : hex;
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle color picker closing
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setActivePickerType(null);
      }

      // Handle exiting editing mode when clicking outside settings and input
      if (isEditing && (result || generatedImage)) {
        const isOutsideSettings = !settingsRef.current || !settingsRef.current.contains(event.target as Node);
        const isOutsideInput = !inputRef.current || !inputRef.current.contains(event.target as Node);
        const isOutsidePicker = !pickerRef.current || !pickerRef.current.contains(event.target as Node);
        
        // Only exit if click is outside all relevant containers
        if (isOutsideSettings && isOutsideInput && isOutsidePicker) {
          setIsEditing(false);
          inputRef.current?.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    if (activePickerType) {
      const buttonRef = activePickerType === 'bg' ? bgButtonRef : objectButtonRef;
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPickerPosition({
          bottom: window.innerHeight - rect.top + 12,
          right: window.innerWidth - rect.right
        });
      }
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePickerType, isEditing, result, generatedImage]);

  const activeCustomBg = selectedBgColors.find(c => !paletteColors.some(pc => pc.value.toLowerCase() === c.toLowerCase()));
  const activeCustomObj = selectedObjectColors.find(c => !paletteColors.some(pc => pc.value.toLowerCase() === c.toLowerCase()));

  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center">
      {/* Background Container */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020205]">
        <AnimatePresence>
          {bgImage && (
            <motion.div 
              key={bgImage}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.15 }}
              exit={{ 
                opacity: 0, 
                scale: 1.15,
                transition: { 
                  opacity: { duration: 3, ease: "easeInOut" },
                  scale: { duration: 3, ease: "linear" }
                }
              }}
              transition={{ 
                opacity: { duration: 3, ease: "easeInOut" },
                scale: { duration: 13, ease: "linear" }
              }}
              className="absolute inset-0 bg-no-repeat bg-cover bg-center"
              style={{
                backgroundImage: `url('${bgImage}')`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Dark Overlay for visibility and contrast */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Subtle Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center p-6 md:p-12 min-h-screen">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative w-full"
        >
          {/* Language Toggle */}
          <div className="absolute right-0 top-0 flex gap-2">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                lang === 'en' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ko')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                lang === 'ko' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              KO
            </button>
          </div>

          <h1 
            onClick={resetApp}
            className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white mb-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            AI ImagiGen
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-white/40 mb-8">
            {t.subtitle}
          </p>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-12 mx-auto">
            <button
              onClick={() => setActiveTab('CREATE')}
              className={`relative py-2 text-[11px] font-bold tracking-[0.3em] transition-all ${activeTab === 'CREATE' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              CREATE
              {activeTab === 'CREATE' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`relative py-2 text-[11px] font-bold tracking-[0.3em] transition-all ${activeTab === 'HISTORY' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              HISTORY
              {activeTab === 'HISTORY' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('UPGRADE')}
              className={`relative py-2 text-[11px] font-bold tracking-[0.3em] transition-all flex items-center gap-2 ${activeTab === 'UPGRADE' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              UPGRADE
              <span className="px-1.5 py-0.5 rounded-md bg-[#0071e3] text-[8px] text-white font-black tracking-normal">PRO</span>
              {activeTab === 'UPGRADE' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>
        </motion.header>

        {/* Restore Message Notification */}
        <AnimatePresence>
          {restoreMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl bg-emerald-500 text-white text-xs font-bold shadow-2xl flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {restoreMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="w-full max-w-7xl mx-auto space-y-12">
          {activeTab === 'CREATE' ? (
            <>
              {/* Top: Input Section */}
              <div className="max-w-2xl mx-auto w-full space-y-6">
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className="relative group">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onFocus={() => setIsEditing(true)}
                  placeholder={t.placeholder}
                  className="w-full min-h-[80px] px-10 py-7 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/20 focus:border-white/40 focus:bg-white/10 outline-none text-lg placeholder:text-white/20 resize-none text-white text-center shadow-2xl overflow-hidden transition-[border-color,background-color] duration-200"
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {idea.trim().length > 0 && (isEditing || (!result && !generatedImage && !loading && !generatingImage)) && (
                <motion.div
                  ref={settingsRef}
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 20 }}
                  className="overflow-visible px-4 pb-12 -mx-4 -mb-12"
                >
                  <div className="space-y-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl mt-4 relative overflow-hidden">
                    {/* Close Settings Button (only if results exist) */}
                    {(result || generatedImage) && (
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="absolute top-6 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                        title={lang === 'ko' ? '결과 보기' : 'Show Results'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Group B: Visual Layer */}
                    <div className="space-y-10">
                      {/* Master Settings: Concept & Dimension (Vertical Layout) */}
                      <div className="flex flex-col gap-10">
                        {masterCategories.map((category) => {
                          const CategoryIcon = category.key === 'concept' ? Sparkles : Palette;
                          return (
                            <div key={category.key} className="space-y-4">
                              <div className="flex items-center gap-2 ml-1">
                                <CategoryIcon className="w-4 h-4 text-white" />
                                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-white">
                                  {t[category.key as keyof typeof t] as string}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {category.options.map((opt) => {
                                  const Icon = opt.icon;
                                  const isSelected = selectedOptions.includes(opt.label);
                                  return (
                                    <button
                                      key={opt.label}
                                      onClick={() => toggleOption(opt.label)}
                                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-xs transition-all border ${
                                        isSelected 
                                          ? 'bg-white border-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)]' 
                                          : 'bg-white/5 border-white/5 text-white hover:border-white/20'
                                      }`}
                                    >
                                      <Icon className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-white'}`} />
                                      {t.styles[opt.label as keyof typeof t.styles] || opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <AnimatePresence mode="wait">
                        {selectedDimension && (
                          <motion.div
                            key="sub-options"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-10 overflow-hidden"
                          >
                            <div className="h-px bg-white/10 w-full" />

                            {/* Sub Options: Dynamic based on Dimension */}
                            <div className="space-y-8">
                              {subCategories.map((category) => {
                                const CategoryIcon = 
                                  category.key === 'icon_style' ? Pencil :
                                  category.key === 'icon_finish' ? Layers :
                                  category.key === 'icon_container' ? Box :
                                  category.key === 'form' || category.key === 'technique' ? PenTool :
                                  category.key === 'subject' ? ImageIcon :
                                  category.key === 'finish' || category.key === 'texture_effect' ? Layers :
                                  category.key === 'shotType' ? Maximize :
                                  category.key === 'structure' ? (selectedDimension === 'Real Photo' ? Aperture : Box) :
                                  category.key === 'material' ? (selectedDimension === 'Real Photo' ? Move : Gem) :
                                  category.key === 'scene' || category.key === 'bg_composition' ? Layout :
                                  Sun;
                                return (
                                  <div key={category.key} className="space-y-4">
                                    <div className="flex items-center gap-2 ml-1">
                                      <CategoryIcon className="w-3.5 h-3.5 text-white/60" />
                                      <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white/60">
                                        {t[category.key as keyof typeof t] as string}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      {category.options.map((opt) => {
                                        const Icon = opt.icon;
                                        const isSelected = selectedOptions.includes(opt.label);
                                        return (
                                          <button
                                            key={opt.label}
                                            onClick={() => toggleOption(opt.label)}
                                            className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-[11px] transition-all border ${
                                              isSelected 
                                                ? 'bg-white border-white text-black shadow-[0_5px_15px_rgba(255,255,255,0.15)]' 
                                                : 'bg-white/5 border-white/5 text-white hover:border-white/20'
                                            }`}
                                          >
                                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-white'}`} />
                                            {t.styles[opt.label as keyof typeof t.styles] || opt.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/10 w-full" />

                            {/* Group C: Color Strategy */}
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 gap-6">
                                {/* Background Color */}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-1.5 ml-1">
                                    <Droplets className="w-3 h-3 text-white" />
                                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-white">
                                      {t.bgColor}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                                    {paletteColors.map((color) => {
                                      const isSelected = selectedBgColors.includes(color.value);
                                      return (
                                        <button
                                          key={`bg-${color.name}`}
                                          onClick={() => {
                                            setSelectedBgColors(prev => 
                                              prev.includes(color.value) 
                                                ? prev.filter(c => c !== color.value) 
                                                : [...prev, color.value]
                                            );
                                          }}
                                          className={`group relative w-8 h-8 rounded-full transition-all duration-300 ${
                                            isSelected 
                                              ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                                              : 'hover:scale-110'
                                          }`}
                                          style={{ backgroundColor: color.value }}
                                          title={color.name}
                                        >
                                          {isSelected && (
                                            <Check className={`absolute inset-0 m-auto w-4 h-4 ${
                                              ['#FFFFFF', '#FFCC00'].includes(color.value) ? 'text-black' : 'text-white'
                                            }`} />
                                          )}
                                        </button>
                                      );
                                    })}

                                    {/* Custom BG Color Button */}
                                    <div className="relative" ref={bgButtonRef}>
                                      <button
                                        onClick={() => {
                                          if (activeCustomBg) {
                                            setSelectedBgColors(prev => prev.filter(c => c !== activeCustomBg));
                                            setActivePickerType(null);
                                          } else {
                                            setActivePickerType(activePickerType === 'bg' ? null : 'bg');
                                          }
                                        }}
                                        className={`group relative w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center border-2 ${
                                          activePickerType === 'bg' || activeCustomBg
                                            ? 'border-transparent ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                                            : 'border-white/20 hover:border-white/40 hover:scale-110'
                                        }`}
                                        style={{ 
                                          backgroundColor: activeCustomBg || (activePickerType === 'bg' ? customColor : 'rgba(255,255,255,0.1)') 
                                        }}
                                        title="Custom Background Color"
                                      >
                                        {activeCustomBg ? (
                                          <Check className={`w-4 h-4 ${isLightColor(activeCustomBg) ? 'text-black' : 'text-white'}`} />
                                        ) : (
                                          <Plus className="w-4 h-4 text-white/40 group-hover:text-white/60" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Object Color */}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-1.5 ml-1">
                                    <Box className="w-3 h-3 text-white" />
                                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-white">
                                      {t.objColor}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                                    {paletteColors.map((color) => {
                                      const isSelected = selectedObjectColors.includes(color.value);
                                      return (
                                        <button
                                          key={`obj-${color.name}`}
                                          onClick={() => {
                                            setSelectedObjectColors(prev => 
                                              prev.includes(color.value) 
                                                ? prev.filter(c => c !== color.value) 
                                                : [...prev, color.value]
                                            );
                                          }}
                                          className={`group relative w-8 h-8 rounded-full transition-all duration-300 ${
                                            isSelected 
                                              ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                                              : 'hover:scale-110'
                                          }`}
                                          style={{ backgroundColor: color.value }}
                                          title={color.name}
                                        >
                                          {isSelected && (
                                            <Check className={`absolute inset-0 m-auto w-4 h-4 ${
                                              ['#FFFFFF', '#FFCC00'].includes(color.value) ? 'text-black' : 'text-white'
                                            }`} />
                                          )}
                                        </button>
                                      );
                                    })}

                                    {/* Custom Object Color Button */}
                                    <div className="relative" ref={objectButtonRef}>
                                      <button
                                        onClick={() => {
                                          if (activeCustomObj) {
                                            setSelectedObjectColors(prev => prev.filter(c => c !== activeCustomObj));
                                            setActivePickerType(null);
                                          } else {
                                            setActivePickerType(activePickerType === 'object' ? null : 'object');
                                          }
                                        }}
                                        className={`group relative w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center border-2 ${
                                          activePickerType === 'object' || activeCustomObj
                                            ? 'border-transparent ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                                            : 'border-white/20 hover:border-white/40 hover:scale-110'
                                        }`}
                                        style={{ 
                                          backgroundColor: activeCustomObj || (activePickerType === 'object' ? customColor : 'rgba(255,255,255,0.1)') 
                                        }}
                                        title="Custom Object Color"
                                      >
                                        {activeCustomObj ? (
                                          <Check className={`w-4 h-4 ${isLightColor(activeCustomObj) ? 'text-black' : 'text-white'}`} />
                                        ) : (
                                          <Plus className="w-4 h-4 text-white/40 group-hover:text-white/60" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/10 w-full" />

                            {/* Group D: Camera & Ratio */}
                            <div className="grid grid-cols-2 gap-4">
                              <CustomDropdown 
                                label={t.camera} 
                                value={t.cameraOpts[selectedCamera as keyof typeof t.cameraOpts] || selectedCamera} 
                                options={cameraOptions} 
                                displayOptions={cameraOptions.map(opt => t.cameraOpts[opt as keyof typeof t.cameraOpts] || opt)}
                                onChange={setSelectedCamera} 
                                icon={Camera}
                              />
                              <CustomDropdown 
                                label={t.ratio} 
                                value={selectedRatio} 
                                options={ratioOptions} 
                                onChange={setSelectedRatio} 
                                icon={Maximize}
                              />
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/10 w-full" />

                            {/* Group E: Reference Image */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 ml-1">
                                <ImageIcon className="w-3 h-3 text-white" />
                                <label className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-white">
                                  {t.refImage}
                                </label>
                              </div>
                              <div 
                                className={`relative group h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden ${
                                  referenceImage ? 'border-white/40 bg-white/5' : 'border-white/20 hover:border-white/40 bg-white/[0.02]'
                                }`}
                              >
                                {analyzing && (
                                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white font-bold animate-pulse">
                                      {t.analyzing}
                                    </span>
                                  </div>
                                )}
                                {referenceImage ? (
                                  <>
                                    <img src={referenceImage} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Reference" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={handleRemoveImage}
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="w-6 h-6 text-white/20 group-hover:text-white/40 transition-colors" />
                                    <span className="text-[10px] uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors px-4 text-center">
                                      {t.uploadDesc}
                                    </span>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={handleImageUpload}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Combined Generate Button */}
                            <div className="pt-6">
                              <button
                                onClick={handleGenerateAll}
                                disabled={loading || generatingImage || !idea.trim()}
                                className="w-full py-5 bg-[#0071e3] text-white rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] transition-all hover:bg-[#0077ed] disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_15px_50px_rgba(0,113,227,0.4)] flex items-center justify-center gap-3"
                              >
                                {loading || generatingImage ? (
                                  <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4" />
                                    {t.generate}
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Section: Horizontal Grid */}
          <AnimatePresence mode="wait">
            {(loading || generatingImage || result || generatedImage || imageError) && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="w-full"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-6">
                      <RefreshCw className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
                      {t.forging}
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Insight Dashboard */}
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-8 rounded-[2.5rem] bg-[#0071e3]/15 border border-[#0071e3]/30 backdrop-blur-3xl shadow-2xl space-y-8"
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="text-white w-4 h-4" />
                          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white">{t.insight}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Visual Balance Radar */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                              {t.visualBalance}
                            </div>
                            <div className="h-[220px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                  { subject: lang === 'ko' ? '깊이감' : 'Depth', A: result.insight.visual_balance.depth },
                                  { subject: lang === 'ko' ? '현대성' : 'Modernity', A: result.insight.visual_balance.modernity },
                                  { subject: lang === 'ko' ? '미학' : 'Aesthetic', A: result.insight.visual_balance.aesthetic },
                                  { subject: lang === 'ko' ? '채도' : 'Vibrancy', A: result.insight.visual_balance.vibrancy },
                                  { subject: lang === 'ko' ? '미니멀리즘' : 'Minimalism', A: result.insight.visual_balance.minimalism },
                                ]}>
                                  <PolarGrid stroke="#ffffff20" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 7 }} />
                                  <Radar name="Balance" dataKey="A" stroke="#0071e3" fill="#0071e3" fillOpacity={0.5} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Texture Density Bar */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                              {t.textureDensity}
                            </div>
                            <div className="h-[220px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                  { name: lang === 'ko' ? '반사율' : 'Reflectivity', value: result.insight.texture_density.reflectivity },
                                  { name: lang === 'ko' ? '투명도' : 'Transparency', value: result.insight.texture_density.transparency },
                                  { name: lang === 'ko' ? '거칠기' : 'Roughness', value: result.insight.texture_density.roughness },
                                ]} layout="vertical">
                                  <XAxis type="number" hide domain={[0, 100]} />
                                  <YAxis dataKey="name" type="category" tick={{ fill: '#ffffff60', fontSize: 7 }} width={60} />
                                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    { [0, 1, 2].map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={['#0071e3', '#00d1ff', '#00ffcc'][index]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-widest text-white/40">
                              {t.temp}
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase">{result.insight.tone_manner.temperature}</span>
                          </div>
                          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-widest text-white/40">
                              {t.dyn}
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase">{result.insight.tone_manner.dynamism}</span>
                          </div>
                        </div>

                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
                          <div className="flex items-center gap-1.5 text-[8px] font-sans font-semibold uppercase tracking-widest text-white/60">
                            {t.designIntent}
                          </div>
                          <p className="text-[10px] text-white/80 leading-relaxed italic">
                            "{result.designIntent}"
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Right Column: Image + Prompts */}
                    <div className="space-y-8">
                      {/* 2. Generated Image or Error/Loading */}
                      {(generatingImage || generatedImage || imageError) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col gap-4"
                        >
                          <div className="relative group rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-3xl p-4 min-h-[300px] flex items-center justify-center">
                            {generatingImage ? (
                              <div className="flex flex-col items-center gap-4 text-center">
                                <RefreshCw className="w-8 h-8 text-white animate-spin" />
                                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
                                  {t.forging}
                                </span>
                              </div>
                            ) : generatedImage ? (
                              <>
                                <img 
                                  src={generatedImage} 
                                  alt="Generated" 
                                  className="w-full h-auto rounded-2xl shadow-2xl"
                                  referrerPolicy="no-referrer"
                                />
                                
                                {/* Save Button Overlay */}
                                <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = generatedImage;
                                      link.download = `generated-image-${Date.now()}.png`;
                                      link.click();
                                    }}
                                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-white transition-all hover:scale-110"
                                    title={lang === 'ko' ? '이미지 저장' : 'Save Image'}
                                  >
                                    <Download className="w-5 h-5" />
                                  </button>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-white text-[10px] font-medium italic">"{idea}"</p>
                                </div>
                              </>
                            ) : imageError ? (
                              <div className="flex flex-col items-center gap-4 text-center p-10">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                  <ImageIcon className="w-6 h-6 text-white/20" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{lang === 'ko' ? '이미지 생성 불가' : 'Image Generation Unavailable'}</p>
                                  <p className="text-[10px] text-white/40 leading-relaxed max-w-[240px]">{imageError}</p>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </motion.div>
                      )}

                      {/* 3. Prompts */}
                      {result && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          {/* Midjourney Prompt Card */}
                          <div className="glass-card p-6 rounded-[2.5rem]">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2.5">
                                <Cloud className="text-white w-3.5 h-3.5" />
                                <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-white">Midjourney (v6.0)</span>
                              </div>
                              <button 
                                onClick={() => handleCopy(result.midjourney, 'mj')}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
                              >
                                {copiedId === 'mj' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <p className="text-[10px] font-mono bg-black/40 p-4 rounded-xl border border-white/10 leading-relaxed break-words text-white backdrop-blur-md">
                              {result.midjourney}
                            </p>
                          </div>

                          {/* DALL-E 3 Prompt Card */}
                          <div className="glass-card p-6 rounded-[2.5rem]">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2.5">
                                <Sparkles className="text-white w-3.5 h-3.5" />
                                <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-white">DALL-E 3</span>
                              </div>
                              <button 
                                onClick={() => handleCopy(result.dalle, 'dalle')}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
                              >
                                {copiedId === 'dalle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <p className="text-[10px] font-mono bg-black/40 p-4 rounded-xl border border-white/10 leading-relaxed break-words text-white backdrop-blur-md">
                              {result.dalle}
                            </p>
                          </div>

                          {/* Stable Diffusion Card */}
                          <div className="glass-card p-6 rounded-[2.5rem]">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2.5">
                                <Zap className="text-white w-3.5 h-3.5" />
                                <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-white">Stable Diffusion (SDXL)</span>
                              </div>
                              <button 
                                onClick={() => handleCopy(result.stableDiffusion, 'sd')}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
                              >
                                {copiedId === 'sd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <p className="text-[10px] font-mono bg-black/40 p-4 rounded-xl border border-white/10 leading-relaxed break-words text-white backdrop-blur-md">
                              {result.stableDiffusion}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : activeTab === 'HISTORY' ? (
        /* History Tab Content */
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-4xl mx-auto space-y-6"
            >
              {userTier === 'TEAM' && (
                <div className="flex items-center justify-between p-6 rounded-[2rem] bg-[#0071e3]/10 border border-[#0071e3]/20 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-[#0071e3]/20">
                      <Users className="w-6 h-6 text-[#0071e3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white tracking-tight">
                        {lang === 'ko' ? '공동 HISTORY 작업실' : 'Shared TEAM Workspace'}
                      </h4>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        {lang === 'ko' ? '팀원들과 실시간으로 기록을 공유하고 있습니다' : 'Sharing history with team members in real-time'}
                      </p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-[#0071e3] flex items-center justify-center text-[10px] font-bold text-white">
                      +5
                    </div>
                  </div>
                </div>
              )}

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-white/20 space-y-4">
                  <Clock className="w-16 h-16" />
                  <p className="text-sm font-bold tracking-widest uppercase">
                    {lang === 'ko' ? '아직 생성된 기록이 없습니다' : 'No history yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((log) => (
                    <div 
                      key={log.id}
                      className="group p-1 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="p-6 space-y-6">
                        {/* Summary Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <span className="px-3 py-1 rounded-lg bg-white/10 text-[10px] font-black text-white/60 tracking-widest">
                              {log.id}
                            </span>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  {log.visualStyle} - {log.subject}
                                </span>
                                <span className="text-[10px] text-white/40">
                                  {log.date}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {log.options.slice(0, 3).map((opt, i) => (
                                  <span key={i} className="text-[9px] text-white/30 uppercase tracking-tighter">
                                    {opt}{i < Math.min(log.options.length, 3) - 1 ? ' /' : ''}
                                  </span>
                                ))}
                                {log.options.length > 3 && (
                                  <span className="text-[9px] text-white/30">...</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(log.prompt, log.id)}
                              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                            >
                              {copiedId === log.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {lang === 'ko' ? '복사하기' : 'COPY'}
                            </button>
                            <button
                              onClick={() => restoreHistory(log)}
                              className="px-4 py-2 rounded-xl bg-[#0071e3]/20 border border-[#0071e3]/40 text-[10px] font-bold text-[#0071e3] hover:bg-[#0071e3]/40 transition-all flex items-center gap-2"
                            >
                              <RefreshCw className="w-3 h-3" />
                              {lang === 'ko' ? '불러오기' : 'RESTORE'}
                            </button>
                            <button
                              onClick={() => setSelectedHistoryId(selectedHistoryId === log.id ? null : log.id)}
                              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform ${selectedHistoryId === log.id ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Detailed View */}
                        <AnimatePresence>
                          {selectedHistoryId === log.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-6 border-t border-white/10 space-y-6">
                                {/* Insights */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {Object.entries(log.insights.visual_balance).map(([key, val]) => (
                                    <div key={key} className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                      <div className="text-[8px] uppercase tracking-widest text-white/40 mb-1">{key}</div>
                                      <div className="text-sm font-bold text-white">{val}%</div>
                                    </div>
                                  ))}
                                </div>

                                {/* Prompt */}
                                <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">PROMPT LOG</span>
                                  </div>
                                  <p className="text-xs leading-relaxed text-white/80 font-mono italic">
                                    {log.prompt}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* Upgrade Tab Content */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  {lang === 'ko' ? '당신에게 맞는 요금제를 선택하세요' : 'Choose the plan that fits you'}
                </h2>
                <p className="text-white/40 text-sm tracking-widest uppercase font-bold">
                  {lang === 'ko' ? '더 강력한 기능으로 창의력을 발휘하세요' : 'Unleash your creativity with more power'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['FREE', 'PRO', 'TEAM'].map((tier) => (
                  <div 
                    key={tier}
                    className={`relative p-8 rounded-[2.5rem] backdrop-blur-3xl border transition-all duration-500 ${
                      userTier === tier 
                        ? 'bg-white/10 border-white/40 shadow-[0_0_50px_-12px_rgba(255,255,255,0.2)]' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col h-full space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white tracking-tight">{tier}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">{t.pricing[tier.toLowerCase() as keyof typeof t.pricing].price}</span>
                          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">/ month</span>
                        </div>
                      </div>

                      <div className="h-px bg-white/10 w-full" />

                      <ul className="space-y-4">
                        {t.pricing[tier.toLowerCase() as keyof typeof t.pricing].features.map((feature: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-1 p-1 rounded-full bg-[#0071e3] shadow-[0_0_15px_rgba(0,113,227,0.4)] flex-shrink-0">
                              <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                            </div>
                            <span className="text-xs text-white/90 leading-relaxed font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => {
                          if (tier !== 'FREE') {
                            setUserTier(tier as 'FREE' | 'PRO' | 'TEAM');
                            setRestoreMessage(lang === 'ko' ? `${tier} 요금제로 업그레이드되었습니다!` : `Upgraded to ${tier} plan!`);
                            setTimeout(() => setRestoreMessage(null), 3000);
                          }
                        }}
                        disabled={userTier === tier}
                        className={`w-full mt-auto py-4 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase transition-all ${
                          userTier === tier
                            ? 'bg-white/5 border border-white/10 text-white/20 cursor-default'
                            : (tier === 'PRO' || tier === 'TEAM')
                              ? 'bg-white text-black hover:scale-[1.02] active:scale-[0.98]'
                              : 'bg-white/10 text-white hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        {userTier === tier 
                          ? (lang === 'ko' ? '사용 중' : 'ACTIVE') 
                          : (lang === 'ko' ? '선택하기' : 'SELECT PLAN')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="w-full max-w-6xl mt-auto pt-24 pb-12 space-y-8">
          <div className="h-px bg-white/10 w-full" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                SYSTEM READY // <span className="text-white">ⓒ 2026 AI IMAGIGEN</span>
              </p>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
                Powered by Gemini 2.5 Flash ({userTier} Tier)
              </span>
            </div>
          </div>
        </footer>
      </div>
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-12 text-center space-y-8">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10 text-indigo-400" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase">
                    {upgradeReason === 'limit' ? t.upgrade.limitReached : t.upgrade.proOnly}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {upgradeReason === 'limit' ? t.upgrade.limitReachedDesc : t.upgrade.proOnlyDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      setActiveTab('UPGRADE');
                    }}
                    className="w-full py-5 rounded-2xl bg-white text-black text-[11px] font-black tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {t.upgrade.upgradeBtn}
                  </button>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-full py-5 rounded-2xl bg-white/5 text-white/40 text-[11px] font-black tracking-[0.2em] uppercase hover:text-white transition-all"
                  >
                    {lang === 'ko' ? '나중에 하기' : 'MAYBE LATER'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activePickerType && (
          <>
            {/* Transparent Backdrop to catch clicks without dimming */}
            <div 
              className="fixed inset-0 z-[90]"
              onClick={() => setActivePickerType(null)}
            />
            
            <motion.div
              ref={pickerRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed z-[100] p-6 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] min-w-[300px] border border-white/20"
              style={{ 
                bottom: pickerPosition.bottom,
                right: pickerPosition.right,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(30px) saturate(160%)',
                WebkitBackdropFilter: 'blur(30px) saturate(160%)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/90">
                  Custom {activePickerType === 'bg' ? 'Background' : 'Object'} Color
                </span>
                <button 
                  onClick={() => setActivePickerType(null)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>
              
              <div className="custom-picker-wrapper mb-5">
                <HexColorPicker 
                  color={customColor} 
                  onChange={(color) => {
                    setCustomColor(color);
                    if (activePickerType === 'bg') {
                      setSelectedBgColors(prev => {
                        const filtered = activeCustomBg ? prev.filter(c => c !== activeCustomBg) : prev;
                        return filtered.includes(color) ? filtered : [...filtered, color];
                      });
                    } else {
                      setSelectedObjectColors(prev => {
                        const filtered = activeCustomObj ? prev.filter(c => c !== activeCustomObj) : prev;
                        return filtered.includes(color) ? filtered : [...filtered, color];
                      });
                    }
                  }} 
                />
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div 
                  className="w-8 h-8 rounded-xl border border-white/20 shadow-inner" 
                  style={{ backgroundColor: customColor }}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight">Hex Code</span>
                  <span className="text-[13px] font-mono text-white uppercase tracking-wider leading-none">{customColor}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
