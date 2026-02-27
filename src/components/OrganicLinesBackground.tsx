import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Line {
  points: Point[];
  color: string;
  width: number;
  opacity: number;
}

const OrganicLinesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', resize);
    resize();

    const lineCount = 15;
    const segmentCount = 40;
    const lines: Line[] = [];

    // Initialize lines
    for (let i = 0; i < lineCount; i++) {
      const points: Point[] = [];
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      
      for (let j = 0; j < segmentCount; j++) {
        points.push({
          x: startX,
          y: startY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        });
      }

      lines.push({
        points,
        color: `rgba(0, ${150 + Math.random() * 105}, 255, ${0.1 + Math.random() * 0.2})`,
        width: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.3,
      });
    }

    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Background fade effect for trails (optional, but let's keep it clean for now)
      // ctx.fillStyle = 'rgba(2, 2, 5, 0.1)';
      // ctx.fillRect(0, 0, width, height);

      lines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Update points
        const head = line.points[0];
        
        // Organic movement using sine waves and randomness
        head.vx += Math.sin(time * 0.001 + head.x * 0.01) * 0.05;
        head.vy += Math.cos(time * 0.001 + head.y * 0.01) * 0.05;
        
        // Friction
        head.vx *= 0.99;
        head.vy *= 0.99;

        head.x += head.vx;
        head.y += head.vy;

        // Screen wrap or bounce
        if (head.x < 0) head.x = width;
        if (head.x > width) head.x = 0;
        if (head.y < 0) head.y = height;
        if (head.y > height) head.y = 0;

        // Follow the leader for segments
        for (let j = line.points.length - 1; j > 0; j--) {
          const p = line.points[j];
          const prev = line.points[j - 1];
          
          // Smoothly move towards previous point
          p.x += (prev.x - p.x) * 0.15;
          p.y += (prev.y - p.y) * 0.15;
        }

        // Draw the line
        ctx.moveTo(line.points[0].x, line.points[0].y);
        for (let j = 1; j < line.points.length; j++) {
          const p = line.points[j];
          // Check for screen wrap to avoid drawing long lines across screen
          const dist = Math.hypot(p.x - line.points[j-1].x, p.y - line.points[j-1].y);
          if (dist < 100) {
            ctx.lineTo(p.x, p.y);
          } else {
            ctx.moveTo(p.x, p.y);
          }
        }
        ctx.stroke();

        // Add glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = line.color;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default OrganicLinesBackground;
