import React, { useEffect, useRef, useState } from "react";

export const MinimalPixi: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pixiLoaded, setPixiLoaded] = useState(false);
  const textRef = useRef<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadPixi = async () => {
      if (!canvasRef.current) return;

      try {
        console.log("🚀 Loading minimal Pixi experience...");
        const PIXI = await import("pixi.js");
        
        const app = new PIXI.Application({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x1a1a2e,
          resizeTo: window,
        });

        canvasRef.current.appendChild(app.view as HTMLCanvasElement);
        setPixiLoaded(true);

        // Create a simple text that updates with scroll
        const text = new PIXI.Text("Scroll Progress: 0%", {
          fontFamily: "Arial",
          fontSize: 48,
          fill: 0xffffff,
        });
        text.anchor.set(0.5);
        text.x = app.view.width / 2;
        text.y = app.view.height / 2;
        textRef.current = text;
        
        app.stage.addChild(text);

        console.log("✅ Minimal Pixi loaded successfully");
      } catch (error) {
        console.error("❌ Failed to load Pixi:", error);
      }
    };

    loadPixi();
  }, []);

  // Update Pixi text when scroll changes
  useEffect(() => {
    if (textRef.current) {
      textRef.current.text = `Scroll Progress: ${Math.round(scrollProgress * 100)}%`;
      textRef.current.style.fill = scrollProgress > 0.5 ? 0x00ff00 : 0xffffff;
    }
  }, [scrollProgress]);

  return (
    <div className="bg-gray-900">
      {/* Debug info */}
      <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded z-50">
        <p>Scroll: {Math.round(scrollProgress * 100)}%</p>
        <p>Pixi Loaded: {pixiLoaded ? "✅" : "❌"}</p>
      </div>

      {/* Scroll container */}
      <div className="h-[400vh] relative">
        {/* Fixed Pixi canvas */}
        <div className="fixed inset-0" ref={canvasRef} />
        
        {/* Scroll markers */}
        <div className="absolute top-[0vh] w-full text-center text-white text-6xl py-20">
          START - Scroll Down
        </div>
        <div className="absolute top-[100vh] w-full text-center text-white text-4xl py-20">
          25% Mark
        </div>
        <div className="absolute top-[200vh] w-full text-center text-white text-4xl py-20">
          50% Mark
        </div>
        <div className="absolute top-[300vh] w-full text-center text-white text-4xl py-20">
          75% Mark
        </div>
      </div>
    </div>
  );
};
