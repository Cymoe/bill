import React, { useEffect, useRef, useState } from 'react';

interface SimpleCanvasProps {
  scrollProgress: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface BlueprintLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  chaos: number;
  targetX1?: number;
  targetY1?: number;
  targetX2?: number;
  targetY2?: number;
}

interface AIAgent {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  trail: { x: number; y: number }[];
  glowIntensity: number;
}

interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  targetHeight: number;
  color: string;
  glowIntensity: number;
}

export const SimpleCanvas: React.FC<SimpleCanvasProps> = ({ scrollProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const blueprintLines = useRef<BlueprintLine[]>([]);
  const aiAgents = useRef<AIAgent[]>([]);
  const buildings = useRef<Building[]>([]);
  const animationRef = useRef<number>();
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Initialize entities
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles (Stage 0)
    particles.current = [];
    for (let i = 0; i < 50; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    // Initialize blueprint lines (Stage 1)
    blueprintLines.current = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create chaotic lines
    for (let i = 0; i < 40; i++) {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = angle1 + (Math.random() - 0.5) * Math.PI;
      const r1 = 100 + Math.random() * 200;
      const r2 = 100 + Math.random() * 200;
      
      blueprintLines.current.push({
        x1: centerX + Math.cos(angle1) * r1,
        y1: centerY + Math.sin(angle1) * r1,
        x2: centerX + Math.cos(angle2) * r2,
        y2: centerY + Math.sin(angle2) * r2,
        chaos: 1
      });
    }

    // Initialize AI agents (Stage 2)
    aiAgents.current = [];
    for (let i = 0; i < 3; i++) {
      aiAgents.current.push({
        x: centerX + (i - 1) * 200,
        y: centerY,
        targetX: centerX + (i - 1) * 200,
        targetY: centerY,
        trail: [],
        glowIntensity: 0
      });
    }

    // Initialize buildings (Stage 4)
    buildings.current = [];
    const buildingData = [
      { x: -300, width: 80, height: 200, color: '#00aaff' },
      { x: -150, width: 100, height: 250, color: '#00ffc3' },
      { x: 0, width: 120, height: 300, color: '#00aaff' },
      { x: 150, width: 90, height: 220, color: '#00ffc3' },
      { x: 280, width: 110, height: 280, color: '#00aaff' }
    ];

    buildingData.forEach(data => {
      buildings.current.push({
        x: centerX + data.x,
        y: centerY + 150,
        width: data.width,
        height: 0,
        targetHeight: data.height,
        color: data.color,
        glowIntensity: 0
      });
    });

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0f1f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Stage 0: The Problem (0-10%)
      if (scrollProgress <= 0.1) {
        // Draw particles
        particles.current.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Wrap around
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
          
          ctx.fillStyle = `rgba(0, 170, 255, ${particle.opacity * (1 - scrollProgress * 10)})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw title
        ctx.save();
        ctx.font = 'bold 56px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - scrollProgress * 10})`;
        ctx.fillText('The Chaos of Construction', centerX, centerY - 50);
        
        ctx.font = '24px Inter, Arial';
        ctx.fillStyle = `rgba(0, 170, 255, ${1 - scrollProgress * 10})`;
        ctx.fillText('Scroll to transform chaos into clarity', centerX, centerY + 20);
        ctx.restore();
      }

      // Stage 1: Blueprint Maze (11-30%)
      if (scrollProgress > 0.1 && scrollProgress <= 0.3) {
        const stageProgress = (scrollProgress - 0.1) / 0.2;
        
        // Draw blueprint lines
        ctx.strokeStyle = `rgba(0, 170, 255, ${0.6 * stageProgress})`;
        ctx.lineWidth = 1;
        
        blueprintLines.current.forEach((line, index) => {
          const lineProgress = Math.min(1, stageProgress * 3 - index / blueprintLines.current.length);
          if (lineProgress > 0) {
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            const currentX2 = line.x1 + (line.x2 - line.x1) * lineProgress;
            const currentY2 = line.y1 + (line.y2 - line.y1) * lineProgress;
            ctx.lineTo(currentX2, currentY2);
            ctx.stroke();
          }
        });

        // Draw pain points
        const painPoints = [
          { text: 'Cost Overruns', x: centerX - 200, y: centerY - 100 },
          { text: 'Missed Deadlines', x: centerX + 150, y: centerY },
          { text: 'Inaccurate Bids', x: centerX - 100, y: centerY + 120 }
        ];

        painPoints.forEach((point, index) => {
          const fadeIn = Math.min(1, (stageProgress - 0.3 - index * 0.2) * 5);
          const fadeOut = Math.max(0, 1 - (stageProgress - 0.7 - index * 0.1) * 5);
          const opacity = fadeIn * fadeOut;
          
          if (opacity > 0) {
            ctx.font = '20px Inter, Arial';
            ctx.fillStyle = `rgba(255, 100, 100, ${opacity * 0.8})`;
            ctx.textAlign = 'center';
            ctx.fillText(point.text, point.x, point.y);
          }
        });
      }

      // Stage 2: Commercial Solution (31-50%)
      if (scrollProgress > 0.3 && scrollProgress <= 0.5) {
        const stageProgress = (scrollProgress - 0.3) / 0.2;
        
        // Draw organizing blueprint lines
        ctx.strokeStyle = 'rgba(0, 170, 255, 0.4)';
        ctx.lineWidth = 1;
        
        blueprintLines.current.forEach((line, index) => {
          // Calculate organized positions (grid layout)
          if (!line.targetX1) {
            const gridX = (index % 8) * 80 - 280;
            const gridY = Math.floor(index / 8) * 80 - 160;
            line.targetX1 = centerX + gridX;
            line.targetY1 = centerY + gridY;
            line.targetX2 = centerX + gridX + 60;
            line.targetY2 = centerY + gridY;
          }
          
          // Interpolate between chaos and order
          const x1 = line.x1 + (line.targetX1 - line.x1) * stageProgress;
          const y1 = line.y1 + (line.targetY1 - line.y1) * stageProgress;
          const x2 = line.x2 + (line.targetX2 - line.x2) * stageProgress;
          const y2 = line.y2 + (line.targetY2 - line.y2) * stageProgress;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });

        // Draw AI agents
        aiAgents.current.forEach((agent, index) => {
          agent.glowIntensity = Math.sin(Date.now() * 0.002 + index) * 0.3 + 0.7;
          
          // Update position
          const targetX = centerX + Math.cos(Date.now() * 0.0005 + index * 2) * 150;
          const targetY = centerY + Math.sin(Date.now() * 0.0007 + index * 2) * 100;
          agent.x += (targetX - agent.x) * 0.05;
          agent.y += (targetY - agent.y) * 0.05;
          
          // Add to trail
          agent.trail.push({ x: agent.x, y: agent.y });
          if (agent.trail.length > 20) agent.trail.shift();
          
          // Draw trail
          agent.trail.forEach((point, i) => {
            ctx.fillStyle = `rgba(0, 255, 195, ${(i / agent.trail.length) * 0.3 * stageProgress})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });
          
          // Draw agent
          const gradient = ctx.createRadialGradient(agent.x, agent.y, 0, agent.x, agent.y, 20);
          gradient.addColorStop(0, `rgba(0, 255, 195, ${agent.glowIntensity * stageProgress})`);
          gradient.addColorStop(1, 'rgba(0, 255, 195, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, 20, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = `rgba(0, 255, 195, ${stageProgress})`;
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw text
        ctx.font = 'bold 36px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${stageProgress})`;
        ctx.fillText('Precision Bidding for Commercial Scale', centerX, centerY - 200);
        
        if (stageProgress > 0.5) {
          ctx.font = '20px Inter, Arial';
          ctx.fillStyle = `rgba(0, 255, 195, ${(stageProgress - 0.5) * 2})`;
          ctx.fillText('10x Faster Estimating', centerX, centerY - 160);
        }
      }

      // Stage 3: Residential Solution (51-70%)
      if (scrollProgress > 0.5 && scrollProgress <= 0.7) {
        const stageProgress = (scrollProgress - 0.5) / 0.2;
        
        // Draw floor plan transformation
        ctx.strokeStyle = `rgba(0, 170, 255, ${0.6})`;
        ctx.lineWidth = 2;
        
        // Draw a house outline
        const houseX = centerX - 150;
        const houseY = centerY - 100;
        const houseWidth = 300;
        const houseHeight = 200;
        
        ctx.beginPath();
        ctx.rect(houseX, houseY, houseWidth, houseHeight);
        
        // Draw rooms
        ctx.moveTo(houseX + houseWidth / 3, houseY);
        ctx.lineTo(houseX + houseWidth / 3, houseY + houseHeight);
        ctx.moveTo(houseX + 2 * houseWidth / 3, houseY);
        ctx.lineTo(houseX + 2 * houseWidth / 3, houseY + houseHeight);
        ctx.moveTo(houseX, houseY + houseHeight / 2);
        ctx.lineTo(houseX + houseWidth / 3, houseY + houseHeight / 2);
        
        ctx.stroke();
        
        // Draw text
        ctx.font = 'bold 36px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${stageProgress})`;
        ctx.fillText('Instant Quotes for Remodelers', centerX, centerY + 150);
        
        if (stageProgress > 0.5) {
          ctx.font = '20px Inter, Arial';
          ctx.fillStyle = `rgba(0, 255, 195, ${(stageProgress - 0.5) * 2})`;
          ctx.fillText('Delight Your Clients', centerX, centerY + 190);
        }
      }

      // Stage 4: Investor's Vision (71-90%)
      if (scrollProgress > 0.7 && scrollProgress <= 0.9) {
        const stageProgress = (scrollProgress - 0.7) / 0.2;
        
        // Draw rising buildings
        buildings.current.forEach((building, index) => {
          building.height = building.targetHeight * stageProgress;
          building.glowIntensity = Math.sin(Date.now() * 0.001 + index) * 0.3 + 0.7;
          
          // Draw building
          const gradient = ctx.createLinearGradient(
            building.x, building.y,
            building.x, building.y - building.height
          );
          gradient.addColorStop(0, building.color);
          gradient.addColorStop(1, `${building.color}33`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(
            building.x - building.width / 2,
            building.y - building.height,
            building.width,
            building.height
          );
          
          // Draw glow
          ctx.shadowBlur = 20 * building.glowIntensity;
          ctx.shadowColor = building.color;
          ctx.strokeStyle = building.color;
          ctx.strokeRect(
            building.x - building.width / 2,
            building.y - building.height,
            building.width,
            building.height
          );
          ctx.shadowBlur = 0;
          
          // Draw simple chart on tallest building
          if (index === 2 && stageProgress > 0.5) {
            const chartOpacity = (stageProgress - 0.5) * 2;
            ctx.strokeStyle = `rgba(255, 255, 255, ${chartOpacity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(building.x - 40, building.y - building.height / 2);
            ctx.lineTo(building.x - 20, building.y - building.height / 2 - 20);
            ctx.lineTo(building.x, building.y - building.height / 2 - 10);
            ctx.lineTo(building.x + 20, building.y - building.height / 2 - 30);
            ctx.lineTo(building.x + 40, building.y - building.height / 2 - 40);
            ctx.stroke();
          }
        });
        
        // Draw text
        ctx.font = 'bold 36px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${stageProgress})`;
        ctx.fillText('Data-Driven ROI for Developers', centerX, centerY - 250);
        
        if (stageProgress > 0.5) {
          ctx.font = '20px Inter, Arial';
          ctx.fillStyle = `rgba(0, 255, 195, ${(stageProgress - 0.5) * 2})`;
          ctx.fillText('Predictive Forecasting', centerX, centerY - 210);
        }
      }

      // Stage 5: Clarity Realized (91-100%)
      if (scrollProgress > 0.9) {
        const stageProgress = (scrollProgress - 0.9) / 0.1;
        
        // Draw complete cityscape
        buildings.current.forEach((building) => {
          building.height = building.targetHeight;
          
          // Draw building with full glow
          const gradient = ctx.createLinearGradient(
            building.x, building.y,
            building.x, building.y - building.height
          );
          gradient.addColorStop(0, building.color);
          gradient.addColorStop(1, `${building.color}33`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(
            building.x - building.width / 2,
            building.y - building.height,
            building.width,
            building.height
          );
          
          // Soft glow
          ctx.shadowBlur = 30;
          ctx.shadowColor = building.color;
          ctx.strokeStyle = building.color;
          ctx.strokeRect(
            building.x - building.width / 2,
            building.y - building.height,
            building.width,
            building.height
          );
          ctx.shadowBlur = 0;
        });
        
        // Draw final text
        ctx.font = 'bold 48px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${stageProgress})`;
        ctx.fillText('From Blueprint to Bottom Line.', centerX, centerY - 250);
        ctx.fillText('Automated.', centerX, centerY - 200);
        
        // Draw CTA button
        if (stageProgress > 0.5) {
          const buttonOpacity = (stageProgress - 0.5) * 2;
          const buttonY = centerY + 50;
          const buttonWidth = 250;
          const buttonHeight = 60;
          const buttonX = centerX - buttonWidth / 2;
          
          // Button glow effect
          if (isButtonHovered) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffc3';
          }
          
          // Button background
          const buttonGradient = ctx.createLinearGradient(
            buttonX, buttonY,
            buttonX + buttonWidth, buttonY + buttonHeight
          );
          buttonGradient.addColorStop(0, isButtonHovered ? '#00ffc3' : '#00aaff');
          buttonGradient.addColorStop(1, isButtonHovered ? '#00aaff' : '#0088cc');
          
          ctx.fillStyle = buttonGradient;
          ctx.beginPath();
          ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
          ctx.fill();
          
          // Button text
          ctx.shadowBlur = 0;
          ctx.font = 'bold 20px Inter, Arial';
          ctx.fillStyle = '#0a0f1f';
          ctx.textAlign = 'center';
          ctx.fillText('Explore the Platform', centerX, buttonY + buttonHeight / 2 + 7);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scrollProgress, isButtonHovered]);

  // Handle mouse move for button hover
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const buttonY = centerY + 50;
      const buttonWidth = 250;
      const buttonHeight = 60;
      const buttonX = centerX - buttonWidth / 2;
      
      const isOverButton = scrollProgress > 0.95 &&
        x >= buttonX && x <= buttonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight;
      
      setIsButtonHovered(isOverButton);
      canvas.style.cursor = isOverButton ? 'pointer' : 'default';
    };

    const handleClick = (e: MouseEvent) => {
      if (isButtonHovered) {
        console.log('CTA Button clicked!');
        // Add your navigation logic here
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [scrollProgress, isButtonHovered]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}; 