'use client';
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
}

export const WindParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // 250 wind stream particles flowing across the map
    const particleCount = 250;
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 15 + Math.random() * 25,
      speed: 1.5 + Math.random() * 2.5,
      angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.3, // SW to NE cyclone flow
      alpha: 0.3 + Math.random() * 0.5,
    }));

    const render = () => {
      // Clear transparent canvas every frame (do NOT fillRect dark background!)
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        const dx = Math.cos(p.angle) * p.length;
        const dy = -Math.sin(p.angle) * p.length;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + dx, p.y + dy);

        if (p.speed > 3.0) {
          ctx.strokeStyle = `rgba(255, 159, 10, ${p.alpha})`; // Orange stream
          ctx.lineWidth = 1.8;
        } else {
          ctx.strokeStyle = `rgba(90, 200, 250, ${p.alpha})`; // Cyan stream
          ctx.lineWidth = 1.2;
        }

        ctx.lineCap = 'round';
        ctx.stroke();

        // Move particle forward
        p.x += Math.cos(p.angle) * p.speed;
        p.y -= Math.sin(p.angle) * p.speed;

        // Reset particle if out of bounds
        if (p.x > width + 50 || p.y < -50 || p.x < -50 || p.y > height + 50) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.alpha = 0.3 + Math.random() * 0.5;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} />;
};
