'use client';
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  speed: number;
  angle: number;
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

    // Initialize 250 particles flowing south-west to north-east (cyclonic flow in Bay of Bengal)
    const particleCount = 200;
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      age: Math.floor(Math.random() * 100),
      maxAge: 80 + Math.random() * 60,
      speed: 1.5 + Math.random() * 2.5,
      angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.4
    }));

    const render = () => {
      // Semi-transparent fade effect for particle trails
      ctx.fillStyle = 'rgba(7, 10, 20, 0.15)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.age++;
        if (p.age >= p.maxAge || p.x > width || p.y < 0 || p.x < 0 || p.y > height) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.age = 0;
          p.maxAge = 80 + Math.random() * 60;
        }

        const dx = Math.cos(p.angle) * p.speed;
        const dy = -Math.sin(p.angle) * p.speed;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + dx, p.y + dy);

        // Color coding by speed (cyan for moderate, orange/red for strong wind)
        const alpha = 1 - p.age / p.maxAge;
        if (p.speed > 3.0) {
          ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
        } else {
          ctx.strokeStyle = `rgba(0, 242, 255, ${alpha})`;
        }

        ctx.lineWidth = p.speed > 3.0 ? 2 : 1.2;
        ctx.stroke();

        p.x += dx;
        p.y += dy;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />;
};
