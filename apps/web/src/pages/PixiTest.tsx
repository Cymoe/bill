import React, { useEffect, useRef } from 'react';

export const PixiTest: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPixi = async () => {
      if (!containerRef.current) return;

      try {
        console.log('Loading Pixi.js...');
        const PIXI = await import('pixi.js');
        console.log('Pixi.js loaded!', PIXI);

        // Create a simple test
        const app = new PIXI.Application({
          width: 800,
          height: 600,
          backgroundColor: 0x1099bb,
        });

        containerRef.current.appendChild(app.view as HTMLCanvasElement);

        // Create a simple animated square
        const square = new PIXI.Graphics();
        square.beginFill(0xff0000);
        square.drawRect(0, 0, 100, 100);
        square.endFill();
        square.x = 350;
        square.y = 250;
        
        app.stage.addChild(square);

        // Animate it
        app.ticker.add(() => {
          square.rotation += 0.01;
        });

        console.log('Pixi test complete - you should see a rotating red square');
      } catch (error) {
        console.error('Failed to load Pixi:', error);
      }
    };

    loadPixi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-white text-3xl mb-8">Pixi.js Test Page</h1>
      <div ref={containerRef} className="border-2 border-white rounded-lg overflow-hidden" />
      <p className="text-white mt-4">You should see a rotating red square above</p>
    </div>
  );
}; 