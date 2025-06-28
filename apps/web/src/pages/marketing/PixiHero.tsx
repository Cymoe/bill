import React, { useEffect, useRef } from 'react';

// Lazy load Pixi.js only for this component
let PIXI: any = null;

interface PixiHeroProps {
  onLoadComplete?: () => void;
}

export const PixiHero: React.FC<PixiHeroProps> = ({ onLoadComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    // Dynamically import Pixi.js only when this component mounts
    const initPixi = async () => {
      if (!containerRef.current || !mounted) return;

      try {
        // This import happens ONLY when marketing page loads
        PIXI = await import('pixi.js');
        
        const app = new PIXI.Application({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x0A0A0A,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
        });

        containerRef.current.appendChild(app.view as HTMLCanvasElement);
        appRef.current = app;

        // Create stunning visuals
        createConstructionParticles(app);
        createFloatingBlueprints(app);
        createAnimatedLogo(app);
        
        // Handle resize
        const handleResize = () => {
          app.renderer.resize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        onLoadComplete?.();

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('Failed to load Pixi.js:', error);
      }
    };

    initPixi();

    return () => {
      mounted = false;
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [onLoadComplete]);

  // Construction particles effect
  const createConstructionParticles = (app: any) => {
    const particleContainer = new PIXI.Container();
    app.stage.addChild(particleContainer);

    const particles: any[] = [];
    const particleCount = 50;

    // Construction icons as particles
    const icons = ['🔨', '🔧', '⚡', '🏗️', '📐', '💡', '🔩'];

    for (let i = 0; i < particleCount; i++) {
      const text = new PIXI.Text(icons[Math.floor(Math.random() * icons.length)], {
        fontSize: 20 + Math.random() * 20,
      });
      
      text.x = Math.random() * app.view.width;
      text.y = Math.random() * app.view.height;
      text.alpha = 0.3 + Math.random() * 0.3;
      
      const particle = {
        sprite: text,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -Math.random() * 0.5 - 0.5,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      };
      
      particles.push(particle);
      particleContainer.addChild(text);
    }

    // Animate particles
    app.ticker.add(() => {
      particles.forEach(particle => {
        particle.sprite.x += particle.speedX;
        particle.sprite.y += particle.speedY;
        particle.sprite.rotation += particle.rotationSpeed;

        // Reset position when out of bounds
        if (particle.sprite.y < -50) {
          particle.sprite.y = app.view.height + 50;
          particle.sprite.x = Math.random() * app.view.width;
        }
        if (particle.sprite.x < -50 || particle.sprite.x > app.view.width + 50) {
          particle.sprite.x = Math.random() * app.view.width;
        }
      });
    });
  };

  // Floating blueprint lines
  const createFloatingBlueprints = (app: any) => {
    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);

    let time = 0;
    app.ticker.add(() => {
      time += 0.01;
      graphics.clear();
      
      // Draw animated blueprint grid
      graphics.lineStyle(1, 0x3B82F6, 0.1);
      
      const spacing = 50;
      const offset = (time * 10) % spacing;
      
      // Vertical lines
      for (let x = -spacing; x < app.view.width + spacing; x += spacing) {
        graphics.moveTo(x + offset, 0);
        graphics.lineTo(x + offset, app.view.height);
      }
      
      // Horizontal lines
      for (let y = -spacing; y < app.view.height + spacing; y += spacing) {
        graphics.moveTo(0, y + offset);
        graphics.lineTo(app.view.width, y + offset);
      }
    });
  };

  // Animated logo/text
  const createAnimatedLogo = (app: any) => {
    const titleStyle = new PIXI.TextStyle({
      fontFamily: 'Inter, sans-serif',
      fontSize: 72,
      fontWeight: 'bold',
      fill: ['#FFFFFF', '#3B82F6'],
      fillGradientType: 1,
      fillGradientStops: [0, 1],
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowDistance: 0,
    });

    const title = new PIXI.Text('BuildFlow Pro', titleStyle);
    title.anchor.set(0.5);
    title.x = app.view.width / 2;
    title.y = app.view.height / 2 - 50;
    
    const subtitleStyle = new PIXI.TextStyle({
      fontFamily: 'Inter, sans-serif',
      fontSize: 24,
      fill: '#FFFFFF',
      alpha: 0.8,
    });
    
    const subtitle = new PIXI.Text('Construction Management Reimagined', subtitleStyle);
    subtitle.anchor.set(0.5);
    subtitle.x = app.view.width / 2;
    subtitle.y = app.view.height / 2 + 30;
    
    app.stage.addChild(title);
    app.stage.addChild(subtitle);
    
    // Floating animation
    let time = 0;
    app.ticker.add(() => {
      time += 0.02;
      title.y = app.view.height / 2 - 50 + Math.sin(time) * 10;
      subtitle.alpha = 0.5 + Math.sin(time * 1.5) * 0.3;
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10"
      style={{ background: '#0A0A0A' }}
    />
  );
}; 