import React from 'react';

const CyberpunkBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020205]">
      {/* Base Image */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-cover bg-fixed"
        style={{ 
          backgroundImage: `url('https://github.com/primobeat/prompt-creator/blob/main/u6997844369_A_hyper-realistic_profile_view_of_a_cyberpunk_wom_5915a2c6-0c39-48d5-a497-c36672a0e063_1.png?raw=true')`,
          backgroundPosition: 'right center'
        }}
      />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.2) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} 
      />

      {/* Left Fade for Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020205] via-[#020205]/80 to-transparent w-full md:w-[70%]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020205]/40 via-transparent to-[#020205]/80" />

      {/* Digital Noise/Grain */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ 
          backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`
        }}
      />

      {/* Subtle Purple/Blue Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default CyberpunkBackground;
