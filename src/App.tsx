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
  Layers as LayersIcon, Info, ChevronDown
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { 
  expandPrompt, PromptExpansion, StyleOption, 
  InsightDashboard as InsightType 
} from './services/geminiService';

const CustomDropdown = ({ 
  label, 
  value, 
  options, 
  onChange 
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (val: string) => void 
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
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-bold text-white flex items-center justify-between hover:bg-white/10 transition-all outline-none"
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
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-[11px] font-bold text-left transition-all ${
                  value === opt 
                    ? 'bg-white text-black' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [idea, setIdea] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<StyleOption[]>([]);
  const [selectedBgColor, setSelectedBgColor] = useState<string | null>(null);
  const [selectedObjectColor, setSelectedObjectColor] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<string>('Eye Level');
  const [selectedRatio, setSelectedRatio] = useState<string>('1:1');
  const [customColor, setCustomColor] = useState('#707070');
  const [activePickerType, setActivePickerType] = useState<'bg' | 'object' | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const bgButtonRef = useRef<HTMLDivElement>(null);
  const objectButtonRef = useRef<HTMLDivElement>(null);
  const [pickerPosition, setPickerPosition] = useState({ bottom: 0, right: 0 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromptExpansion | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const styleCategories: { title: string; options: { label: StyleOption; icon: any }[] }[] = [
    {
      title: 'Art Form',
      options: [
        { label: 'Clean Flat', icon: Box },
        { label: 'Neo Plastic', icon: Gamepad2 },
        { label: 'Paper Craft', icon: Layers },
      ]
    },
    {
      title: 'Material & Texture',
      options: [
        { label: 'Soft & Fluffy', icon: CloudSun },
        { label: 'Playful Pop', icon: Zap },
        { label: 'Jelly Iridescent', icon: Droplets },
      ]
    },
    {
      title: 'Atmosphere & Lighting',
      options: [
        { label: 'Glossy Glass', icon: Gem },
        { label: 'Candy Chrome', icon: Candy },
        { label: 'Frosted Mist', icon: Wind },
      ]
    }
  ];

  const paletteColors = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Orange', value: '#FF9500' },
    { name: 'Yellow', value: '#FFCC00' },
    { name: 'Green', value: '#34C759' },
    { name: 'Blue', value: '#007AFF' },
    { name: 'Purple', value: '#9D00FF' },
    { name: 'Pink', value: '#FF1493' },
  ];

  const moodOptions = [
    { name: 'Vibrant', class: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500' },
    { name: 'Pastel', class: 'bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200' },
    { name: 'Dark', class: 'bg-gradient-to-tr from-gray-900 via-slate-800 to-zinc-900' },
    { name: 'Monotone', class: 'bg-gradient-to-tr from-gray-300 via-gray-500 to-gray-700' },
    { name: 'Neon', class: 'bg-gradient-to-tr from-green-400 via-cyan-400 to-blue-500' },
    { name: 'Warm', class: 'bg-gradient-to-tr from-orange-400 via-red-400 to-amber-500' },
  ];

  const cameraOptions = ['Macro', 'Isometric', 'Low Angle', 'Eye Level', 'Wide Shot', 'Top Down'];
  const ratioOptions = ['1:1', '4:5', '16:9', '9:16', '3:2', '2:3'];

  const toggleOption = (option: StyleOption) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option) 
        : [...prev, option]
    );
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    try {
      const getColorDescription = (color: string | null) => {
        if (!color) return undefined;
        const paletteMatch = paletteColors.find(c => c.value === color);
        return paletteMatch ? `${paletteMatch.name} tones` : color;
      };

      const bgColor = getColorDescription(selectedBgColor);
      const objectColor = getColorDescription(selectedObjectColor);

      const data = await expandPrompt(
        idea, 
        selectedOptions, 
        bgColor, 
        objectColor, 
        selectedMood || undefined,
        selectedCamera,
        selectedRatio
      );
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('프롬프트 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setActivePickerType(null);
      }
    };
    if (activePickerType) {
      document.addEventListener('mousedown', handleClickOutside);
      
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
  }, [activePickerType]);

  return (
    <div className="relative min-h-screen flex flex-col items-center">
      {/* Background Container */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#111]">
        {/* Simpler, Brighter Monotone Desert */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2560&auto=format&fit=crop" 
            alt="Simple Desert"
            className="w-full h-full object-cover grayscale brightness-[0.55] contrast-[1.4] scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Subtle Grain Texture */}
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Refined Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)] opacity-40" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center p-6 md:p-12 min-h-screen">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white mb-3">
            Prompt Creator
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-white/40">
            Advanced Visual Analysis & Professional Prompt Engineering
          </p>
        </motion.header>

        <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 glass-card p-8 rounded-[2.5rem] lg:sticky lg:top-12 h-fit"
          >
            {/* Group A: Core Concept */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white ml-1">
                  Your Idea
                </label>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your vision..."
                  className="w-full h-24 p-6 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 focus:bg-white/10 outline-none transition-all text-base placeholder:text-white/40 resize-none backdrop-blur-xl text-white"
                />
              </div>

              {/* Camera & Ratio */}
              <div className="grid grid-cols-2 gap-4">
                <CustomDropdown 
                  label="Camera" 
                  value={selectedCamera} 
                  options={cameraOptions} 
                  onChange={setSelectedCamera} 
                />
                <CustomDropdown 
                  label="Ratio" 
                  value={selectedRatio} 
                  options={ratioOptions} 
                  onChange={setSelectedRatio} 
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 w-full" />

            {/* Group B: Visual Layer */}
            <div className="space-y-6">
              <div className="space-y-6">
                {styleCategories.map((category) => (
                  <div key={category.title} className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">
                      {category.title}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {category.options.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = selectedOptions.includes(opt.label);
                        return (
                          <button
                            key={opt.label}
                            onClick={() => toggleOption(opt.label)}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-[11px] font-bold transition-all border ${
                              isSelected 
                                ? 'bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                                : 'bg-white/5 border-white/5 text-white hover:border-white/20 backdrop-blur-md'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-white'}`} />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 w-full" />

            {/* Group C: Color Strategy */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Color Mood */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">
                    Color Mood
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.name}
                        onClick={() => setSelectedMood(selectedMood === mood.name ? null : mood.name)}
                        className={`group relative aspect-square rounded-xl transition-all duration-300 ${
                          selectedMood === mood.name 
                            ? 'ring-2 ring-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                            : 'hover:scale-105 opacity-60 hover:opacity-100'
                        } ${mood.class}`}
                        title={mood.name}
                      >
                        {selectedMood === mood.name && (
                          <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-md" />
                        )}
                        <span className="absolute -bottom-6 left-0 right-0 text-[8px] font-bold uppercase tracking-tighter text-white/40 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {mood.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Color */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">
                    Background Color
                  </span>
                  <div className="flex flex-wrap justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                    {paletteColors.map((color) => (
                      <button
                        key={`bg-${color.name}`}
                        onClick={() => setSelectedBgColor(selectedBgColor === color.value ? null : color.value)}
                        className={`group relative w-8 h-8 rounded-full transition-all duration-300 ${
                          selectedBgColor === color.value 
                            ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {selectedBgColor === color.value && (
                          <Check className={`absolute inset-0 m-auto w-4 h-4 ${
                            ['#FFFFFF', '#FFCC00'].includes(color.value) ? 'text-black' : 'text-white'
                          }`} />
                        )}
                      </button>
                    ))}

                    {/* Custom BG Color Button */}
                    <div className="relative" ref={bgButtonRef}>
                      <button
                        onClick={() => setActivePickerType(activePickerType === 'bg' ? null : 'bg')}
                        className={`group relative w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center border-2 ${
                          selectedBgColor === customColor && activePickerType !== 'object'
                            ? 'border-transparent bg-white/20 ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                            : 'border-white/20 hover:border-white/40 hover:scale-110'
                        }`}
                        style={selectedBgColor === customColor ? { backgroundColor: customColor } : {}}
                        title="Custom Background Color"
                      >
                        {selectedBgColor === customColor ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Plus className="w-4 h-4 text-white/40 group-hover:text-white/60" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Object Color */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">
                    Object Color
                  </span>
                  <div className="flex flex-wrap justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                    {paletteColors.map((color) => (
                      <button
                        key={`obj-${color.name}`}
                        onClick={() => setSelectedObjectColor(selectedObjectColor === color.value ? null : color.value)}
                        className={`group relative w-8 h-8 rounded-full transition-all duration-300 ${
                          selectedObjectColor === color.value 
                            ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {selectedObjectColor === color.value && (
                          <Check className={`absolute inset-0 m-auto w-4 h-4 ${
                            ['#FFFFFF', '#FFCC00'].includes(color.value) ? 'text-black' : 'text-white'
                          }`} />
                        )}
                      </button>
                    ))}

                    {/* Custom Object Color Button */}
                    <div className="relative" ref={objectButtonRef}>
                      <button
                        onClick={() => setActivePickerType(activePickerType === 'object' ? null : 'object')}
                        className={`group relative w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center border-2 ${
                          selectedObjectColor === customColor && activePickerType !== 'bg'
                            ? 'border-transparent bg-white/20 ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                            : 'border-white/20 hover:border-white/40 hover:scale-110'
                        }`}
                        style={selectedObjectColor === customColor ? { backgroundColor: customColor } : {}}
                        title="Custom Object Color"
                      >
                        {selectedObjectColor === customColor ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Plus className="w-4 h-4 text-white/40 group-hover:text-white/60" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !idea.trim()}
              className="w-full py-4.5 bg-[#0071e3] text-white rounded-2xl font-bold text-xs uppercase tracking-[0.15em] transition-all hover:bg-[#0077ed] disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_10px_40px_rgba(0,113,227,0.4)]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Prompt
                </div>
              )}
            </button>
          </motion.div>

          {/* Right: Result Section */}
          <div className="w-full h-full">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-white/40 border-2 border-dashed border-white/20 rounded-[2.5rem] p-12 text-center backdrop-blur-sm"
                >
                  <div className="mb-6">
                    <RefreshCw className="w-10 h-10 text-white animate-spin" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Forging Your Vision...</span>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 h-full"
                >
                {/* Midjourney Prompt Card */}
                <div className="glass-card p-7 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <Cloud className="text-white w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Midjourney (v6.0)</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(result.midjourney, 'mj')}
                      className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white"
                    >
                      {copiedId === 'mj' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs font-mono bg-black/40 p-5 rounded-2xl border border-white/10 leading-relaxed break-words text-white backdrop-blur-md">
                    {result.midjourney}
                  </p>
                </div>

                {/* DALL-E 3 Prompt Card */}
                <div className="glass-card p-7 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="text-white w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">DALL-E 3</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(result.dalle, 'dalle')}
                      className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white"
                    >
                      {copiedId === 'dalle' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs font-mono bg-black/40 p-5 rounded-2xl border border-white/10 leading-relaxed break-words text-white backdrop-blur-md">
                    {result.dalle}
                  </p>
                </div>

                {/* Stable Diffusion Card */}
                <div className="glass-card p-7 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <Zap className="text-white w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Stable Diffusion (SDXL)</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(result.stableDiffusion, 'sd')}
                      className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white"
                    >
                      {copiedId === 'sd' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs font-mono bg-black/40 p-5 rounded-2xl border border-white/10 leading-relaxed break-words text-white backdrop-blur-md">
                    {result.stableDiffusion}
                  </p>
                </div>

                {/* Design Intent Card */}
                <div className="p-7 rounded-[2.5rem] bg-[#0071e3]/15 border border-[#0071e3]/30 backdrop-blur-3xl shadow-2xl">
                  <div className="flex items-center gap-2.5 mb-4">
                    <Layout className="text-white w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Design Intent</span>
                  </div>
                  <p className="text-white text-xs leading-relaxed font-medium">
                    {result.designIntent}
                  </p>
                </div>

                {/* Insight Dashboard */}
                <div className="p-8 rounded-[2.5rem] bg-[#0071e3]/15 border border-[#0071e3]/30 backdrop-blur-3xl shadow-2xl space-y-8">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Insight Dashboard</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Visual Balance Radar */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        Visual Balance
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                            { subject: 'Vibrancy', A: result.insight.visual_balance.vibrancy },
                            { subject: 'Minimalism', A: result.insight.visual_balance.minimalism },
                            { subject: 'Complexity', A: result.insight.visual_balance.complexity },
                            { subject: 'Softness', A: result.insight.visual_balance.softness },
                            { subject: 'Futurism', A: result.insight.visual_balance.futurism },
                          ]}>
                            <PolarGrid stroke="#ffffff20" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 8 }} />
                            <Radar name="Balance" dataKey="A" stroke="#0071e3" fill="#0071e3" fillOpacity={0.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Texture Density Bar */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        Texture Density
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Reflectivity', value: result.insight.texture_density.reflectivity },
                            { name: 'Transparency', value: result.insight.texture_density.transparency },
                            { name: 'Roughness', value: result.insight.texture_density.roughness },
                          ]} layout="vertical">
                            <XAxis type="number" hide domain={[0, 100]} />
                            <YAxis dataKey="name" type="category" tick={{ fill: '#ffffff60', fontSize: 8 }} width={80} />
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-white/40">
                        Temperature
                      </div>
                      <span className="text-xs font-bold text-white uppercase">{result.insight.tone_manner.temperature}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-white/40">
                        Dynamism
                      </div>
                      <span className="text-xs font-bold text-white uppercase">{result.insight.tone_manner.dynamism}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/60">
                      Director's Comment
                    </div>
                    <p className="text-[11px] text-white/80 leading-relaxed italic">
                      "{result.insight.designer_comment}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-white/40 border-2 border-dashed border-white/20 rounded-[2.5rem] p-12 text-center backdrop-blur-sm"
              >
                <div className="p-6 rounded-full bg-white/10 mb-6">
                  <Sparkles className="w-10 h-10 opacity-40" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-2">Ready to Forge</h3>
                <p className="text-[10px] uppercase tracking-widest opacity-60 leading-relaxed">
                  Select your styles and describe your vision<br/>to generate professional AI prompts
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

        {/* Footer */}
        <footer className="mt-auto pt-24 pb-12 text-center">
          <p className="text-[9px] text-white font-bold uppercase tracking-[0.3em]">
            &copy; 2024 Prompt Creator by Mets HIT
          </p>
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
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
                      setSelectedBgColor(color);
                    } else {
                      setSelectedObjectColor(color);
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
