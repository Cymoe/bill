import React, { useEffect, useState } from 'react';
import { SimpleCanvas } from './experience/SimpleCanvas';

export const Experience: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Ensure body is scrollable for this page
  useEffect(() => {
    // Force scrollable state
    document.body.style.overflow = 'visible';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'visible';
    document.documentElement.style.height = 'auto';
    
    // Debug
    console.log('Page setup:', {
      bodyHeight: document.body.scrollHeight,
      windowHeight: window.innerHeight,
      overflow: getComputedStyle(document.body).overflow
    });
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const progress = scrollHeight > 0 ? Math.min(Math.max(scrolled / scrollHeight, 0), 1) : 0;
      
      console.log('Scroll debug:', {
        scrollHeight,
        scrolled,
        progress,
        bodyHeight: document.body.scrollHeight,
        windowHeight: window.innerHeight
      });
      
      setScrollProgress(progress);
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  return (
    <div style={{ overflow: 'visible', minHeight: '100vh' }}>
      {/* Fixed canvas that stays in viewport */}
      <div className="fixed inset-0 w-full h-screen z-10">
        <SimpleCanvas scrollProgress={scrollProgress} />
      </div>
      
      {/* Debug info */}
      <div className="fixed top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 z-20 space-y-1">
        <div className="text-white text-sm font-bold">Scroll: {Math.round(scrollProgress * 100)}%</div>
        <div className="text-gray-300 text-xs">Height: 400vh</div>
        <button 
          onClick={() => window.scrollTo(0, 1000)} 
          className="bg-blue-500 text-white px-2 py-1 text-xs rounded"
        >
          Test Scroll
        </button>
      </div>
      
      {/* Scrollable content - make sure it creates height */}
      <div style={{ height: '400vh', backgroundColor: 'transparent', position: 'relative' }}>
        <div className="absolute top-0 w-full text-center text-white pt-20">
          <p className="text-2xl opacity-20">Start (0%)</p>
        </div>
        <div className="absolute top-[100vh] w-full text-center text-white">
          <p className="text-2xl opacity-20">25%</p>
        </div>
        <div className="absolute top-[200vh] w-full text-center text-white">
          <p className="text-2xl opacity-20">50%</p>
        </div>
        <div className="absolute top-[300vh] w-full text-center text-white">
          <p className="text-2xl opacity-20">75%</p>
        </div>
      </div>
    </div>
  );
}; 