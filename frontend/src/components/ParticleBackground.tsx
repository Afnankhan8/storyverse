import React, { useEffect } from 'react';

const ParticleBackground: React.FC = () => {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: linear-gradient(135deg, #8B5CF6, #EC4899);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
        opacity: ${0.3 + Math.random() * 0.5};
      `;
      document.querySelector('.particle-container')?.appendChild(particle);
      setTimeout(() => particle.remove(), 8000);
    };
    
    const interval = setInterval(createParticle, 200);
    return () => clearInterval(interval);
  }, []);

  return <div className="particle-container fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
};

export default ParticleBackground;