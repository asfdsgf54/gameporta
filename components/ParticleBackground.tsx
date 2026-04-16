'use client';

import { useEffect } from 'react';

export default function ParticleBackground() {
  useEffect(() => {
    // Eski particle'ları temizle
    const existing = document.getElementById('particle-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'particle-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;
    document.body.appendChild(container);

    const particleCount = 80;
    const dots: HTMLDivElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const dot = document.createElement('div');
      const size = Math.random() * 3 + 1.5;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;

      dot.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(210, 210, 210, 0.75);
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        box-shadow: 0 0 ${size * 2}px rgba(210,210,210,0.4);
      `;

      container.appendChild(dot);
      dots.push(dot);
    }

    // Pozisyon ve hız verileri
    const data = dots.map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
    }));

    // SVG çizgi katmanı
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
    `;
    container.appendChild(svg);

    let raf: number;

    const animate = () => {
      // Eski çizgileri temizle
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      for (let i = 0; i < data.length; i++) {
        const p = data[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        dots[i].style.left = p.x + 'px';
        dots[i].style.top = p.y + 'px';

        // Yakın particle'ları bağla
        for (let j = i + 1; j < data.length; j++) {
          const dx = p.x - data[j].x;
          const dy = p.y - data[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const opacity = (1 - dist / 130) * 0.4;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(p.x));
            line.setAttribute('y1', String(p.y));
            line.setAttribute('x2', String(data[j].x));
            line.setAttribute('y2', String(data[j].y));
            line.setAttribute('stroke', `rgba(200,200,200,${opacity})`);
            line.setAttribute('stroke-width', '0.8');
            svg.appendChild(line);
          }
        }
      }

      raf = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      const el = document.getElementById('particle-container');
      if (el) el.remove();
    };
  }, []);

  return null;
}
