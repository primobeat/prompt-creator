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
  Download, Pencil, StickyNote, Grid
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'ko'>('ko');
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

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
      dimension: "Dimension",
      form: "Form",
      subject: "Subject",
      finish: "Finish",
      shotType: "Shot Type",
      environment: "Environment",
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
        'Vector': 'Vector',
        'Line Art': 'Line Art',
        'Gouache': 'Gouache',
        'Pixel Art': 'Pixel Art',
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
        'Natural Light': 'Natural Light',
        'Studio': 'Studio',
        'Cinematic Neon': 'Cinematic Neon',
        'Mist': 'Mist'
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
        'Top View': 'Top View'
      },
      forging: "Generating imaginary images and prompts..."
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
      dimension: "차원 (Dimension)",
      form: "형태 (Form)",
      subject: "주제 (Subject)",
      finish: "마감 (Finish)",
      shotType: "샷 타입 (Shot Type)",
      environment: "환경 (Environment)",
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
        'Vector': '벡터',
        'Line Art': '라인아트',
        'Gouache': '과슈',
        'Pixel Art': '픽셀아트',
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
        'Natural Light': '자연광',
        'Studio': '스튜디오',
        'Cinematic Neon': '시네마틱 네온',
        'Mist': '안개'
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
        'Top View': '톱 뷰'
      },
      forging: "상상 속 이미지와 프롬프트를 생성하는 중..."
    }
  }[lang];

  const [isDesigning, setIsDesigning] = useState(false);
  const prevSelectedOptionsRef = useRef<StyleOption[]>([]);

  useEffect(() => {
    prevSelectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  const selectedDimension = selectedOptions.find(opt => ['2D Artwork', '3D Rendering', 'Real Photo'].includes(opt));

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
      title: 'DIMENSION',
      key: 'dimension',
      options: [
        { label: '2D Artwork' as StyleOption, icon: Square, desc: lang === 'ko' ? '평면적인 예술적 표현' : 'Flat artistic expression' },
        { label: '3D Rendering' as StyleOption, icon: Box, desc: lang === 'ko' ? '입체적인 디지털 렌더링' : 'Three-dimensional digital rendering' },
        { label: 'Real Photo' as StyleOption, icon: Camera, desc: lang === 'ko' ? '사실적인 사진 촬영 기법' : 'Realistic photography techniques' },
      ]
    }
  ];

  const subCategories: { title: string; key: string; options: { label: StyleOption; icon: any; desc: string }[] }[] = [
    // Step 3: Dynamic STYLE/SUBJECT
    ...(selectedDimension === '2D Artwork' ? [{
      title: 'STYLE',
      key: 'form',
      options: [
        { label: 'Vector' as StyleOption, icon: PenTool, desc: lang === 'ko' ? '깔끔한 벡터 그래픽' : 'Clean vector graphics' },
        { label: 'Line Art' as StyleOption, icon: Pencil, desc: lang === 'ko' ? '섬세한 선 중심의 아트' : 'Intricate line-focused art' },
        { label: 'Gouache' as StyleOption, icon: Palette, desc: lang === 'ko' ? '불투명하고 부드러운 질감' : 'Opaque and soft texture' },
        { label: 'Pixel Art' as StyleOption, icon: Layout, desc: lang === 'ko' ? '고전적인 도트 그래픽' : 'Classic dot graphics' },
      ]
    }] : []),
    ...(selectedDimension === '3D Rendering' ? [{
      title: 'STYLE',
      key: 'form',
      options: [
        { label: 'Isometric' as StyleOption, icon: Layout, desc: lang === 'ko' ? '일정한 각도의 입체 뷰' : 'Fixed-angle 3D view' },
        { label: 'Volume' as StyleOption, icon: Box, desc: lang === 'ko' ? '덩어리감이 강조된 입체' : 'Emphasis on mass and volume' },
        { label: 'Wireframe' as StyleOption, icon: Square, desc: lang === 'ko' ? '구조가 보이는 선형 입체' : 'Structural linear 3D' },
      ]
    }] : []),
    ...(selectedDimension === 'Real Photo' ? [{
      title: 'SUBJECT',
      key: 'subject',
      options: [
        { label: 'Person' as StyleOption, icon: Sparkles, desc: lang === 'ko' ? '인물 중심의 촬영' : 'Portrait-focused photography' },
        { label: 'Landscape' as StyleOption, icon: Wind, desc: lang === 'ko' ? '광활한 자연과 풍경' : 'Vast nature and landscapes' },
        { label: 'Product' as StyleOption, icon: Box, desc: lang === 'ko' ? '제품의 질감과 디테일' : 'Product texture and details' },
        { label: 'Architecture' as StyleOption, icon: Layout, desc: lang === 'ko' ? '건축물의 조형미' : 'Architectural aesthetics' },
      ]
    }] : []),
    // Step 4: Dynamic FINISH/SHOT TYPE
    ...(selectedDimension === '2D Artwork' ? [{
      title: 'FINISH',
      key: 'finish',
      options: [
        { label: 'Halftone' as StyleOption, icon: Grid, desc: lang === 'ko' ? '망점 패턴의 인쇄 질감' : 'Dot pattern print texture' },
        { label: 'Noise' as StyleOption, icon: Wind, desc: lang === 'ko' ? '거친 입자감의 노이즈' : 'Gritty grain noise' },
        { label: 'Paper Texture' as StyleOption, icon: StickyNote, desc: lang === 'ko' ? '종이 특유의 아날로그 질감' : 'Analog paper texture' },
        { label: 'Flat Color' as StyleOption, icon: Layers, desc: lang === 'ko' ? '단순하고 깔끔한 색면' : 'Simple and clean flat colors' },
      ]
    }] : []),
    ...(selectedDimension === '3D Rendering' ? [{
      title: 'FINISH',
      key: 'finish',
      options: [
        { label: 'Glass' as StyleOption, icon: Gem, desc: lang === 'ko' ? '투명하고 맑은 유리' : 'Clear and transparent glass' },
        { label: 'Metal' as StyleOption, icon: Zap, desc: lang === 'ko' ? '차갑고 단단한 금속' : 'Cold and hard metal' },
        { label: 'Clay' as StyleOption, icon: Cloud, desc: lang === 'ko' ? '부드러운 점토 질감' : 'Soft clay texture' },
      ]
    }] : []),
    ...(selectedDimension === 'Real Photo' ? [{
      title: 'SHOT TYPE',
      key: 'shotType',
      options: [
        { label: 'Close-up' as StyleOption, icon: Maximize, desc: lang === 'ko' ? '피사체에 밀착한 구도' : 'Close-up composition' },
        { label: 'Medium Shot' as StyleOption, icon: Wind, desc: lang === 'ko' ? '피사체의 상반신 중심 구도' : 'Medium shot composition' },
        { label: 'Full Shot' as StyleOption, icon: Cloud, desc: lang === 'ko' ? '피사체 전체가 보이는 구도' : 'Full shot composition' },
      ]
    }] : []),
    // Step 5: Dynamic BACKGROUND/ENVIRONMENT
    ...(selectedDimension === '2D Artwork' ? [{
      title: 'BACKGROUND',
      key: 'environment',
      options: [
        { label: 'Solid' as StyleOption, icon: Square, desc: lang === 'ko' ? '깔끔한 단색 배경' : 'Clean solid background' },
        { label: 'Gradient' as StyleOption, icon: Palette, desc: lang === 'ko' ? '부드러운 그라데이션' : 'Smooth gradient background' },
        { label: 'Textured Paper' as StyleOption, icon: StickyNote, desc: lang === 'ko' ? '질감이 살아있는 종이' : 'Textured paper background' },
        { label: 'Abstract Shapes' as StyleOption, icon: Layout, desc: lang === 'ko' ? '감각적인 추상 도형' : 'Sensory abstract shapes' },
        { label: 'Transparent Background' as StyleOption, icon: Maximize, desc: lang === 'ko' ? '투명 배경' : 'Transparent background' },
      ]
    }] : []),
    ...(selectedDimension !== '2D Artwork' ? [{
      title: 'ENVIRONMENT',
      key: 'environment',
      options: [
        { label: 'Natural Light' as StyleOption, icon: Sun, desc: lang === 'ko' ? '밝고 화사한 자연광' : 'Bright natural light' },
        { label: 'Studio' as StyleOption, icon: Camera, desc: lang === 'ko' ? '정교하게 제어된 조명' : 'Precisely controlled lighting' },
        { label: 'Cinematic Neon' as StyleOption, icon: Zap, desc: lang === 'ko' ? '강렬한 색채의 네온' : 'Intense neon colors' },
        { label: 'Mist' as StyleOption, icon: Wind, desc: lang === 'ko' ? '몽환적인 안개 분위기' : 'Dreamy mist atmosphere' },
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

  const cameraOptions = ['Eye Level', 'High Angle', 'Low Angle', 'Top View'];
  const ratioOptions = ['1:1', '4:5', '16:9', '9:16', '3:2', '2:3'];

  const toggleOption = (option: StyleOption) => {
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
        
        // Reset previous settings before analyzing new image
        setSelectedOptions([]);
        setSelectedBgColors([]);
        setSelectedObjectColors([]);
        
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
    
    // Filter selectedOptions to only include currently active/visible options
    const activeOptions = selectedOptions.filter(opt => 
      styleCategories.some(cat => cat.options.some(o => o.label === opt))
    );

    setIsEditing(false);
    setLoading(true);
    setGeneratingImage(true);
    setResult(null);
    setGeneratedImage(null);

    try {
      // Run both in parallel for better performance
      const [promptResult, imageUrl] = await Promise.all([
        expandPrompt(
          idea, 
          activeOptions, 
          formatColors(selectedBgColors), 
          formatColors(selectedObjectColors), 
          selectedCamera,
          selectedRatio as any,
          lang,
          referenceImage || undefined
        ),
        generateWallpaper(
          idea, 
          activeOptions, 
          formatColors(selectedBgColors), 
          formatColors(selectedObjectColors), 
          selectedCamera,
          selectedRatio as any
        )
      ]);

      setResult(promptResult);
      setGeneratedImage(imageUrl);
    } catch (error: any) {
      console.error(error);
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
      <div 
        className="fixed inset-0 -z-10 bg-no-repeat bg-cover bg-[#020205]"
        style={{
          backgroundImage: `url('https://github.com/primobeat/prompt-creator/blob/main/u6997844369_A_hyper-realistic_profile_view_of_a_cyberpunk_wom_5915a2c6-0c39-48d5-a497-c36672a0e063_1.png?raw=true')`,
          backgroundPosition: 'right center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Subtle Purple-Blue Gradient Overlay for readability and mood */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-950/40 to-transparent" />
        
        {/* Subtle Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Intense Glowing Accents (Subtle) */}
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-blue-600/5 blur-[140px] rounded-full" />
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

          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white mb-3">
            AI ImagiGen
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-white/40">
            {t.subtitle}
          </p>
        </motion.header>

        <main className="w-full max-w-7xl mx-auto space-y-12">
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
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onFocus={() => setIsEditing(true)}
                  placeholder={t.placeholder}
                  className="w-full h-20 p-6 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/20 focus:border-white/40 focus:bg-white/10 outline-none transition-all text-lg placeholder:text-white/20 resize-none text-white text-center shadow-2xl"
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
                  className="overflow-hidden"
                >
                  <div className="space-y-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl mt-4 relative">
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
                                  category.key === 'form' ? PenTool :
                                  category.key === 'subject' ? ImageIcon :
                                  category.key === 'finish' ? Layers :
                                  category.key === 'shotType' ? Maximize :
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
                                        onClick={() => setActivePickerType(activePickerType === 'bg' ? null : 'bg')}
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
                                        onClick={() => setActivePickerType(activePickerType === 'object' ? null : 'object')}
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
            {!isEditing && (loading || generatingImage || result || generatedImage) && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="w-full"
              >
                {(loading || generatingImage) ? (
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
                      {/* 2. Generated Image */}
                      {generatedImage && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col gap-4"
                        >
                          <div className="relative group rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-3xl p-4">
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
        </main>

        {/* Footer */}
        <footer className="w-full max-w-6xl mt-auto pt-24 pb-12 space-y-8">
          <div className="h-px bg-white/10 w-full" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500/80">
                  System Operational
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                &copy; 2024 AI ImagiGen
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {[
                { label: 'Documentation', icon: Info },
                { label: 'API Reference', icon: Activity },
                { label: 'Community', icon: Sparkles }
              ].map((link) => (
                <a 
                  key={link.label}
                  href="#" 
                  className="flex items-center gap-2 group transition-colors"
                >
                  <link.icon className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
                Powered by Gemini 2.5 Flash (Free Tier)
              </span>
            </div>
          </div>
        </footer>
      </div>
      <AnimatePresence>
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
                      setSelectedBgColors(prev => prev.includes(color) ? prev : [...prev, color]);
                    } else {
                      setSelectedObjectColors(prev => prev.includes(color) ? prev : [...prev, color]);
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
