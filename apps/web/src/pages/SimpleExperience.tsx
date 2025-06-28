import React, { useEffect, useState } from 'react';

export const SimpleExperience: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* Fixed debug info */}
      <div className="fixed top-4 left-4 bg-black text-white p-4 z-50">
        <p>Scroll Y: {scrollY}px</p>
        <p>Page Height: 400vh (4x screen)</p>
      </div>

      {/* Scrollable content */}
      <div className="h-[400vh] bg-gradient-to-b from-blue-900 to-purple-900">
        <div className="fixed inset-0 flex items-center justify-center">
          <h1 className="text-6xl text-white">Scroll Progress: {Math.round((scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%</h1>
        </div>
        
        {/* Markers */}
        <div className="absolute top-[0vh] left-0 w-full h-screen flex items-center justify-center">
          <h2 className="text-4xl text-white">START</h2>
        </div>
        <div className="absolute top-[100vh] left-0 w-full h-screen flex items-center justify-center">
          <h2 className="text-4xl text-white">25%</h2>
        </div>
        <div className="absolute top-[200vh] left-0 w-full h-screen flex items-center justify-center">
          <h2 className="text-4xl text-white">50%</h2>
        </div>
        <div className="absolute top-[300vh] left-0 w-full h-screen flex items-center justify-center">
          <h2 className="text-4xl text-white">END</h2>
        </div>
      </div>
    </div>
  );
}; 