import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SmileConfig, Particle } from '../types/smile';
import { soundEngine } from '../utils/soundEngine';

interface SillySmileCanvasProps {
  config: SmileConfig;
  className?: string;
  isInteractive?: boolean;
  showAura?: boolean;
  onFaceReact?: (reaction: string) => void;
  aspectRatio?: 'phone' | 'square' | 'fullscreen';
}

export const SillySmileCanvas: React.FC<SillySmileCanvasProps> = ({
  config,
  className = '',
  isInteractive = true,
  showAura = true,
  onFaceReact,
  aspectRatio = 'phone',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic eye tracking coordinates (-1 to 1)
  const [targetLook, setTargetLook] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentLook, setCurrentLook] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Blinking & wink states
  const [isBlinking, setIsBlinking] = useState(false);
  const [leftEyeWink, setLeftEyeWink] = useState(false);
  const [rightEyeWink, setRightEyeWink] = useState(false);

  // Expression reactions
  const [mouthStretch, setMouthStretch] = useState(1);
  const [faceSquish, setFaceSquish] = useState({ x: 1, y: 1 });
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [colorBurstActive, setColorBurstActive] = useState(false);
  const [dizzyRotation, setDizzyRotation] = useState(0);

  // Touch & Swipe tracking
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDragging = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Smooth lerp for eye tracking
  useEffect(() => {
    let active = true;
    const lerpSpeed = 0.18;

    const updateEyePosition = () => {
      if (!active) return;
      setCurrentLook((prev) => ({
        x: prev.x + (targetLook.x - prev.x) * lerpSpeed,
        y: prev.y + (targetLook.y - prev.y) * lerpSpeed,
      }));
      requestAnimationFrame(updateEyePosition);
    };

    const handle = requestAnimationFrame(updateEyePosition);
    return () => {
      active = false;
      cancelAnimationFrame(handle);
    };
  }, [targetLook]);

  // Periodic natural blinking
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const interval = (config.blinkRate || 3.5) * 1000 + (Math.random() * 1500 - 750);
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          // 25% chance of double blink
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setIsBlinking(true);
              setTimeout(() => setIsBlinking(false), 90);
            }, 120);
          }
          scheduleNextBlink();
        }, 110);
      }, interval);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimer);
  }, [config.blinkRate]);

  // Particle emission loop
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particleId = 0;
    let lastTime = performance.now();

    const renderParticles = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Resize canvas to match display size
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ambient aura particles
      if (showAura && config.hasFloatingParticles && Math.random() < 0.25 && particlesRef.current.length < 50) {
        particlesRef.current.push({
          id: particleId++,
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 40,
          vy: - (30 + Math.random() * 60),
          size: Math.random() * 3 + 1.5,
          color: config.primaryColor,
          alpha: 0.8,
          life: 0,
          maxLife: 2.5 + Math.random() * 2,
        });
      }

      // Update & draw
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - progress);

        if (progress >= 1 || currentAlpha <= 0) return false;

        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.3), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return true;
      });

      animFrameRef.current = requestAnimationFrame(renderParticles);
    };

    animFrameRef.current = requestAnimationFrame(renderParticles);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [config.primaryColor, config.hasFloatingParticles, showAura]);

  // Spawn touch particles
  const spawnTouchParticles = useCallback((clientX: number, clientY: number, count = 6) => {
    if (!config.touchParticlesEnabled) return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: Math.random() < 0.6 ? config.primaryColor : config.secondaryColor,
        alpha: 1,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
      });
    }
  }, [config.primaryColor, config.secondaryColor, config.touchParticlesEnabled]);

  // Pointer move handler (mouse or touch)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    setTargetLook({
      x: Math.max(-1, Math.min(1, x * (config.tiltSensitivity || 0.8))),
      y: Math.max(-1, Math.min(1, y * (config.tiltSensitivity || 0.8))),
    });

    if (isDragging.current) {
      spawnTouchParticles(e.clientX, e.clientY, 2);
    }
  };

  // Pointer down (start swipe / tap tracking)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    isDragging.current = true;
    touchStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    spawnTouchParticles(e.clientX, e.clientY, 8);
  };

  // Pointer up (detect tap or swipe)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractive || !touchStartPos.current) {
      isDragging.current = false;
      return;
    }

    const dx = e.clientX - touchStartPos.current.x;
    const dy = e.clientY - touchStartPos.current.y;
    const dt = Date.now() - touchStartPos.current.time;
    const dist = Math.hypot(dx, dy);

    isDragging.current = false;

    // Swipe gesture detected
    if (dist > 45 && dt < 450) {
      handleSwipeGesture(dx, dy);
    } else {
      // Tap gesture
      handleGeneralTap();
    }

    touchStartPos.current = null;
  };

  // Swipe reactions
  const handleSwipeGesture = (dx: number, dy: number) => {
    // Vertical swipe: open mouth or squash
    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) {
        // Swipe UP: Open mouth wide & roar / chomp
        triggerMouthChomp();
        onFaceReact?.('swipe_up');
      } else {
        // Swipe DOWN: Squish face down & bounce
        triggerFaceSquish();
        onFaceReact?.('swipe_down');
      }
    } else {
      // Horizontal swipe: wink & shake
      if (dx > 0) {
        triggerWink('right');
      } else {
        triggerWink('left');
      }
      onFaceReact?.('swipe_horizontal');
    }
  };

  // Tap on face reaction
  const handleGeneralTap = () => {
    if (config.soundOnTouch) {
      soundEngine.play(config.defaultSound || 'chuckle_giggle');
    }

    switch (config.touchReaction) {
      case 'chomp':
        triggerMouthChomp();
        break;
      case 'screech':
        triggerScreech();
        break;
      case 'color_burst':
        triggerColorBurst();
        break;
      case 'dizzy':
        triggerDizzy();
        break;
      case 'wink':
        triggerWink('random');
        break;
      case 'bounce':
      default:
        triggerFaceSquish();
        break;
    }

    onFaceReact?.(config.touchReaction);
  };

  // Trigger individual reactions
  const triggerMouthChomp = () => {
    setMouthStretch(1.6);
    setTimeout(() => setMouthStretch(0.8), 120);
    setTimeout(() => setMouthStretch(1.2), 220);
    setTimeout(() => setMouthStretch(1), 320);
  };

  const triggerFaceSquish = () => {
    setFaceSquish({ x: 1.2, y: 0.8 });
    setTimeout(() => setFaceSquish({ x: 0.9, y: 1.15 }), 130);
    setTimeout(() => setFaceSquish({ x: 1, y: 1 }), 260);
  };

  const triggerScreech = () => {
    setShakeIntensity(12);
    setMouthStretch(1.4);
    setTimeout(() => setShakeIntensity(6), 150);
    setTimeout(() => {
      setShakeIntensity(0);
      setMouthStretch(1);
    }, 350);
  };

  const triggerColorBurst = () => {
    setColorBurstActive(true);
    setTimeout(() => setColorBurstActive(false), 400);
  };

  const triggerDizzy = () => {
    setDizzyRotation(360);
    setTimeout(() => setDizzyRotation(0), 600);
  };

  const triggerWink = (side: 'left' | 'right' | 'random') => {
    const chooseSide = side === 'random' ? (Math.random() < 0.5 ? 'left' : 'right') : side;
    if (chooseSide === 'left') {
      setLeftEyeWink(true);
      setTimeout(() => setLeftEyeWink(false), 300);
    } else {
      setRightEyeWink(true);
      setTimeout(() => setRightEyeWink(false), 300);
    }
  };

  // Dedicated Eye Poke handlers
  const handleEyePoke = (side: 'left' | 'right', e: React.PointerEvent) => {
    e.stopPropagation();
    soundEngine.play('squish_squeak');
    if (side === 'left') {
      setLeftEyeWink(true);
      setTimeout(() => setLeftEyeWink(false), 500);
    } else {
      setRightEyeWink(true);
      setTimeout(() => setRightEyeWink(false), 500);
    }
    setFaceSquish({ x: 1.1, y: 0.9 });
    setTimeout(() => setFaceSquish({ x: 1, y: 1 }), 200);
    onFaceReact?.('eye_poke');
  };

  // Dedicated Mouth Poke handler
  const handleMouthPoke = (e: React.PointerEvent) => {
    e.stopPropagation();
    soundEngine.play('monster_chomp');
    triggerMouthChomp();
    onFaceReact?.('mouth_bite');
  };

  // Gyroscope tilt support for mobile phones
  useEffect(() => {
    if (!isInteractive) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      // gamma: -90 to 90 (left to right tilt)
      // beta: -180 to 180 (front to back tilt)
      const x = Math.max(-1, Math.min(1, e.gamma / 30));
      const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      setTargetLook({ x, y });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isInteractive]);

  // Aspect ratio classes
  const aspectClass =
    aspectRatio === 'phone'
      ? 'aspect-[9/19] w-full max-w-[340px] md:max-w-[380px]'
      : aspectRatio === 'square'
      ? 'aspect-square w-full max-w-[380px]'
      : 'w-full h-full';

  // Eye and Pupil Position math
  const pupilOffsetX = currentLook.x * 22;
  const pupilOffsetY = currentLook.y * 18;
  const eyeSpacing = 75 + (config.eyeDistance || 0);

  // Render SVG eye shapes based on eyeStyle
  const renderEyeShape = (side: 'left' | 'right') => {
    const isWinking = side === 'left' ? leftEyeWink : rightEyeWink;
    const eyeScaleY = isBlinking || isWinking ? 0.08 : 1;
    const eyeScale = config.eyeScale || 1;
    const isRight = side === 'right';

    // Different Eye Styles
    switch (config.eyeStyle) {
      case 'wicked_slit':
        // Creepy slanted evil cat/demon slit
        return (
          <g
            transform={`scale(${eyeScale}, ${eyeScale * eyeScaleY})`}
            className="transition-transform duration-75 origin-center cursor-pointer"
            onPointerDown={(e) => handleEyePoke(side, e)}
          >
            {/* Outer evil eye socket */}
            <path
              d={isRight
                ? "M -40,-10 C -10,-45 40,-35 48,0 C 35,32 -10,25 -40,-10 Z"
                : "M 40,-10 C 10,-45 -40,-35 -48,0 C -35,32 10,25 40,-10 Z"
              }
              fill="url(#eyeGlowGradient)"
              filter="url(#glowFilter)"
              stroke={config.primaryColor}
              strokeWidth="2.5"
            />
            {/* Inner pupil slit */}
            <g transform={`translate(${pupilOffsetX}, ${pupilOffsetY})`}>
              <ellipse
                cx="0"
                cy="0"
                rx={6 * (config.pupilScale || 1)}
                ry={22 * (config.pupilScale || 1)}
                fill={config.secondaryColor}
                filter="url(#innerPupilGlow)"
              />
              <circle cx="-2" cy="-6" r="2.5" fill="#ffffff" opacity="0.9" />
            </g>
          </g>
        );

      case 'psycho_round':
        // Wide crazy stare
        return (
          <g
            transform={`scale(${eyeScale}, ${eyeScale * eyeScaleY})`}
            className="transition-transform duration-75 origin-center cursor-pointer"
            onPointerDown={(e) => handleEyePoke(side, e)}
          >
            <circle
              cx="0"
              cy="0"
              r="34"
              fill="url(#eyeGlowGradient)"
              filter="url(#glowFilter)"
              stroke={config.primaryColor}
              strokeWidth="3"
            />
            <g transform={`translate(${pupilOffsetX * 0.9}, ${pupilOffsetY * 0.9})`}>
              <circle
                cx="0"
                cy="0"
                r={12 * (config.pupilScale || 1)}
                fill={config.secondaryColor}
                filter="url(#innerPupilGlow)"
              />
              <circle cx="3" cy="-4" r="3.5" fill="#ffffff" />
            </g>
          </g>
        );

      case 'cat_crescent':
        // Elegant crescent smile eyes (Cheshire)
        return (
          <g
            transform={`scale(${eyeScale}, ${eyeScale * eyeScaleY})`}
            className="transition-transform duration-75 origin-center cursor-pointer"
            onPointerDown={(e) => handleEyePoke(side, e)}
          >
            <path
              d={isRight
                ? "M -35,-15 C -10,-40 35,-25 45,5 C 20,20 -15,5 -35,-15 Z"
                : "M 35,-15 C 10,-40 -35,-25 -45,5 C -20,20 15,5 35,-15 Z"
              }
              fill="url(#eyeGlowGradient)"
              filter="url(#glowFilter)"
              stroke={config.primaryColor}
              strokeWidth="2"
            />
            <g transform={`translate(${pupilOffsetX}, ${pupilOffsetY})`}>
              <ellipse
                cx="0"
                cy="-2"
                rx={8 * (config.pupilScale || 1)}
                ry={18 * (config.pupilScale || 1)}
                fill={config.secondaryColor}
              />
            </g>
          </g>
        );

      case 'glowing_cross':
        // Cyber glowing cross / star
        return (
          <g
            transform={`scale(${eyeScale}, ${eyeScale * eyeScaleY})`}
            className="transition-transform duration-75 origin-center cursor-pointer"
            onPointerDown={(e) => handleEyePoke(side, e)}
          >
            <circle cx="0" cy="0" r="30" fill="#000000" stroke={config.primaryColor} strokeWidth="2.5" />
            <g transform={`translate(${pupilOffsetX * 0.8}, ${pupilOffsetY * 0.8})`}>
              {/* Star cross */}
              <path
                d="M 0,-24 L 5,-6 L 24,0 L 5,6 L 0,24 L -5,6 L -24,0 L -5,-6 Z"
                fill={config.primaryColor}
                filter="url(#glowFilter)"
              />
              <circle cx="0" cy="0" r="4" fill="#ffffff" />
            </g>
          </g>
        );

      case 'cute_kawaii':
        // Big sparkly anime eyes with heart / stars
        return (
          <g
            transform={`scale(${eyeScale}, ${eyeScale * eyeScaleY})`}
            className="transition-transform duration-75 origin-center cursor-pointer"
            onPointerDown={(e) => handleEyePoke(side, e)}
          >
            <ellipse
              cx="0"
              cy="0"
              rx="32"
              ry="38"
              fill="url(#eyeGlowGradient)"
              stroke={config.primaryColor}
              strokeWidth="2.5"
              filter="url(#glowFilter)"
            />
            <g transform={`translate(${pupilOffsetX * 0.8}, ${pupilOffsetY * 0.8})`}>
              {/* Heart pupil */}
              <path
                d="M 0,10 C -12,0 -16,-12 -8,-18 C -2,-22 0,-14 0,-14 C 0,-14 2,-22 8,-18 C 16,-12 12,0 0,10 Z"
                fill={config.secondaryColor}
                transform="scale(1.2)"
                filter="url(#innerPupilGlow)"
              />
              <circle cx="-10" cy="-12" r="5" fill="#ffffff" />
              <circle cx="8" cy="6" r="3" fill="#ffffff" />
            </g>
          </g>
        );

      case 'derp_googly':
        // Wobbly goofy googly eye
        const derpOffset = isRight ? 6 : -6;
        return (
          <g
            transform={`scale(${eyeScale}, ${eyeScale * eyeScaleY})`}
            className="transition-transform duration-75 origin-center cursor-pointer"
            onPointerDown={(e) => handleEyePoke(side, e)}
          >
            <circle
              cx="0"
              cy="0"
              r="36"
              fill="#ffffff"
              stroke={config.primaryColor}
              strokeWidth="3.5"
              filter="url(#glowFilter)"
            />
            <g transform={`translate(${pupilOffsetX + derpOffset}, ${pupilOffsetY - derpOffset})`}>
              <circle cx="0" cy="0" r={16 * (config.pupilScale || 1)} fill="#0a0a0a" />
              <circle cx="-5" cy="-5" r="4.5" fill="#ffffff" />
            </g>
          </g>
        );

      case 'hypno_spiral':
        // Hypnotic spiral eye
        return (
          <g
            transform={`scale(${eyeScale}, ${eyeScale * eyeScaleY})`}
            className="transition-transform duration-75 origin-center cursor-pointer"
            onPointerDown={(e) => handleEyePoke(side, e)}
          >
            <circle cx="0" cy="0" r="32" fill="#000000" stroke={config.primaryColor} strokeWidth="2.5" />
            <g
              transform={`translate(${pupilOffsetX * 0.5}, ${pupilOffsetY * 0.5}) rotate(${isBlinking ? 0 : Date.now() / 20 % 360})`}
              className="origin-center"
            >
              <path
                d="M 0,0 C 5,-2 10,2 10,8 C 10,16 -2,18 -8,14 C -16,10 -16,-4 -10,-12 C -2,-22 14,-22 22,-14 C 30,-6 28,14 18,24"
                fill="none"
                stroke={config.primaryColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#glowFilter)"
              />
            </g>
          </g>
        );

      case 'lightning_bolt':
        // Lightning bolt pupil
        return (
          <g
            transform={`scale(${eyeScale}, ${eyeScale * eyeScaleY})`}
            className="transition-transform duration-75 origin-center cursor-pointer"
            onPointerDown={(e) => handleEyePoke(side, e)}
          >
            <polygon
              points="-32,-15 0,-35 32,-15 28,25 0,35 -28,25"
              fill="#020813"
              stroke={config.primaryColor}
              strokeWidth="2.5"
              filter="url(#glowFilter)"
            />
            <g transform={`translate(${pupilOffsetX}, ${pupilOffsetY})`}>
              <polygon
                points="2,-20 -10,-2 -2,-2 -8,18 10,0 2,0"
                fill={config.secondaryColor}
                filter="url(#innerPupilGlow)"
              />
            </g>
          </g>
        );

      case 'jack_triangles':
        // Carved jack-o'-lantern triangle eyes
        return (
          <g
            transform={`scale(${eyeScale}, ${eyeScale * eyeScaleY})`}
            className="transition-transform duration-75 origin-center cursor-pointer"
            onPointerDown={(e) => handleEyePoke(side, e)}
          >
            <polygon
              points={isRight ? "35,15 -25,25 0,-30" : "-35,15 25,25 0,-30"}
              fill={config.primaryColor}
              filter="url(#glowFilter)"
              stroke="#ffaa00"
              strokeWidth="2"
            />
            <g transform={`translate(${pupilOffsetX * 0.6}, ${pupilOffsetY * 0.6})`}>
              <circle cx="0" cy="0" r="6" fill="#ffffaa" />
            </g>
          </g>
        );

      case 'glitch_pixel':
      default:
        // Digital pixel rectangle eye
        return (
          <g
            transform={`scale(${eyeScale}, ${eyeScale * eyeScaleY})`}
            className="transition-transform duration-75 origin-center cursor-pointer"
            onPointerDown={(e) => handleEyePoke(side, e)}
          >
            <rect
              x="-32"
              y="-24"
              width="64"
              height="48"
              rx="4"
              fill="#000000"
              stroke={config.primaryColor}
              strokeWidth="3"
              filter="url(#glowFilter)"
            />
            <g transform={`translate(${pupilOffsetX}, ${pupilOffsetY})`}>
              <rect
                x="-12"
                y="-14"
                width="24"
                height="28"
                fill={config.secondaryColor}
                filter="url(#innerPupilGlow)"
              />
              <rect x="-4" y="-8" width="8" height="8" fill="#ffffff" />
            </g>
          </g>
        );
    }
  };

  // Render SVG mouth & teeth based on mouthStyle
  const renderMouthShape = () => {
    const scale = (config.mouthScale || 1) * mouthStretch;

    switch (config.mouthStyle) {
      case 'razor_vampire':
        // Classic wicked smile: wide arc with razor sharp triangular fangs
        return (
          <g
            transform={`scale(${scale})`}
            className="transition-transform duration-100 origin-top cursor-pointer"
            onPointerDown={handleMouthPoke}
          >
            {/* Mouth cavity */}
            <path
              d="M -110,-10 C -70,80 70,80 110,-10 C 60,35 -60,35 -110,-10 Z"
              fill="#000000"
              stroke={config.primaryColor}
              strokeWidth="3.5"
              filter="url(#glowFilter)"
            />
            {/* Top sharp teeth */}
            <path
              d="M -90,0 L -78,28 L -68,8 L -55,38 L -42,12 L -25,45 L -8,15 L 0,46 L 8,15 L 25,45 L 42,12 L 55,38 L 68,8 L 78,28 L 90,0 Z"
              fill={config.hasGoldTooth ? '#ffd700' : config.mouthColor}
              stroke="#000000"
              strokeWidth="1.5"
            />
            {/* Bottom sharp teeth */}
            <path
              d="M -75,45 L -60,25 L -45,52 L -30,28 L -15,55 L 0,30 L 15,55 L 30,28 L 45,52 L 60,25 L 75,45 Z"
              fill={config.mouthColor}
              stroke="#000000"
              strokeWidth="1.5"
            />
          </g>
        );

      case 'jagged_menace':
        // Irregular sharp monster teeth
        return (
          <g
            transform={`scale(${scale})`}
            className="transition-transform duration-100 origin-top cursor-pointer"
            onPointerDown={handleMouthPoke}
          >
            <path
              d="M -115,-20 C -70,95 70,95 115,-20 C 70,40 -70,40 -115,-20 Z"
              fill="#020803"
              stroke={config.primaryColor}
              strokeWidth="3"
              filter="url(#glowFilter)"
            />
            {/* Jagged teeth row */}
            <path
              d="M -100,-8 L -85,32 L -72,6 L -58,40 L -42,10 L -22,48 L 0,12 L 22,48 L 42,10 L 58,40 L 72,6 L 85,32 L 100,-8 Z"
              fill={config.mouthColor}
            />
          </g>
        );

      case 'cheshire_curve':
        // Huge curved toothy grin from ear to ear
        return (
          <g
            transform={`scale(${scale})`}
            className="transition-transform duration-100 origin-top cursor-pointer"
            onPointerDown={handleMouthPoke}
          >
            <path
              d="M -130,-30 C -80,90 80,90 130,-30 C 80,45 -80,45 -130,-30 Z"
              fill="#06010a"
              stroke={config.primaryColor}
              strokeWidth="3"
              filter="url(#glowFilter)"
            />
            {/* Grid teeth divisions */}
            <g stroke="#1a042e" strokeWidth="2.5">
              {[-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100].map((tx, idx) => (
                <rect
                  key={idx}
                  x={tx - 8}
                  y="5"
                  width="16"
                  height={30 - Math.abs(tx) * 0.18}
                  rx="2"
                  fill={config.hasGoldTooth && idx === 6 ? '#ffd700' : config.mouthColor}
                />
              ))}
            </g>
          </g>
        );

      case 'gold_iced':
        // Big grin with iced gold front fangs
        return (
          <g
            transform={`scale(${scale})`}
            className="transition-transform duration-100 origin-top cursor-pointer"
            onPointerDown={handleMouthPoke}
          >
            <path
              d="M -105,-15 C -60,80 60,80 105,-15 C 60,30 -60,30 -105,-15 Z"
              fill="#000000"
              stroke={config.primaryColor}
              strokeWidth="3.5"
              filter="url(#glowFilter)"
            />
            {/* Top teeth with Gold iced caps */}
            <rect x="-65" y="0" width="18" height="24" rx="2" fill="#ffffff" />
            <rect x="-45" y="0" width="20" height="28" rx="2" fill="#ffd700" stroke="#ffaa00" strokeWidth="1.5" />
            <rect x="-22" y="0" width="22" height="30" rx="2" fill="#ffffff" />
            <rect x="2" y="0" width="22" height="30" rx="2" fill="#ffd700" stroke="#ffaa00" strokeWidth="1.5" />
            <rect x="26" y="0" width="20" height="28" rx="2" fill="#ffffff" />
            <rect x="48" y="0" width="18" height="24" rx="2" fill="#ffffff" />
          </g>
        );

      case 'tongue_out':
        // Cute goofy open mouth with pink tongue flopping out
        return (
          <g
            transform={`scale(${scale})`}
            className="transition-transform duration-100 origin-top cursor-pointer"
            onPointerDown={handleMouthPoke}
          >
            <path
              d="M -75,-10 C -45,60 45,60 75,-10 C 40,15 -40,15 -75,-10 Z"
              fill="#1a040d"
              stroke={config.primaryColor}
              strokeWidth="3"
              filter="url(#glowFilter)"
            />
            {/* Two cute top fangs */}
            <polygon points="-40,0 -30,16 -20,0" fill="#ffffff" />
            <polygon points="20,0 30,16 40,0" fill="#ffffff" />
            {/* Bouncy tongue */}
            <path
              d="M -22,25 C -25,65 25,65 22,25 Z"
              fill="#ff4081"
              stroke="#c51162"
              strokeWidth="2"
            />
            <line x1="0" y1="28" x2="0" y2="48" stroke="#c51162" strokeWidth="2" />
          </g>
        );

      case 'stitched_horror':
        // Creepy frankenstein stitches across the lips
        return (
          <g
            transform={`scale(${scale})`}
            className="transition-transform duration-100 origin-top cursor-pointer"
            onPointerDown={handleMouthPoke}
          >
            <path
              d="M -110,-5 C -50,25 50,25 110,-5"
              fill="none"
              stroke={config.primaryColor}
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#glowFilter)"
            />
            {/* Stitches */}
            {[-90, -70, -50, -30, -10, 10, 30, 50, 70, 90].map((sx, i) => (
              <line
                key={i}
                x1={sx}
                y1={-15 + (i % 2) * 4}
                x2={sx + ((i % 3) - 1) * 3}
                y2={15 - (i % 2) * 3}
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </g>
        );

      case 'pumpkin_carved':
        // Triangular jagged jack-o'-lantern carved teeth
        return (
          <g
            transform={`scale(${scale})`}
            className="transition-transform duration-100 origin-top cursor-pointer"
            onPointerDown={handleMouthPoke}
          >
            <path
              d="M -100,-10 L -75,20 L -50,-5 L -25,25 L 0,0 L 25,25 L 50,-5 L 75,20 L 100,-10 C 65,55 -65,55 -100,-10 Z"
              fill={config.primaryColor}
              stroke="#ffaa00"
              strokeWidth="3"
              filter="url(#glowFilter)"
            />
          </g>
        );

      case 'wide_chomp':
      default:
        // Huge gaping chomp mouth
        return (
          <g
            transform={`scale(${scale})`}
            className="transition-transform duration-100 origin-top cursor-pointer"
            onPointerDown={handleMouthPoke}
          >
            <ellipse
              cx="0"
              cy="20"
              rx="95"
              ry="45"
              fill="#000000"
              stroke={config.primaryColor}
              strokeWidth="3.5"
              filter="url(#glowFilter)"
            />
            {/* Top teeth blocks */}
            {[-60, -36, -12, 12, 36, 60].map((x, idx) => (
              <rect
                key={idx}
                x={x - 9}
                y="-15"
                width="18"
                height="22"
                rx="3"
                fill={config.mouthColor}
                stroke="#000000"
                strokeWidth="1.5"
              />
            ))}
            {/* Bottom teeth blocks */}
            {[-48, -24, 0, 24, 48].map((x, idx) => (
              <rect
                key={idx}
                x={x - 9}
                y="32"
                width="18"
                height="20"
                rx="3"
                fill={config.mouthColor}
                stroke="#000000"
                strokeWidth="1.5"
              />
            ))}
          </g>
        );
    }
  };

  // Parallax 3D tilt calculation
  const rotateX = -currentLook.y * 12;
  const rotateY = currentLook.x * 14;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`relative select-none overflow-hidden rounded-3xl flex items-center justify-center ${aspectClass} ${className}`}
      style={{
        backgroundColor: config.backgroundColor || '#020204',
        boxShadow: `0 0 45px ${config.glowColor}25`,
        touchAction: 'none',
      }}
    >
      {/* User Uploaded Custom Background (if any) */}
      {config.userBackgroundImage && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${config.userBackgroundImage})`,
            backgroundSize: config.userBackgroundFit || 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Background Dimmer Overlay */}
      {config.userBackgroundImage && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${config.backgroundDim ?? 0.65})`,
          }}
        />
      )}

      {/* Cyber Scanlines Overlay */}
      {config.hasScanlines && (
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)',
          }}
        />
      )}

      {/* Particle Canvas Layer */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Glowing Ambient Radial Aura */}
      {showAura && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            background: `radial-gradient(circle at ${50 + currentLook.x * 15}% ${45 + currentLook.y * 15}%, ${config.glowColor}35 0%, ${config.glowColor}10 40%, transparent 75%)`,
            filter: `blur(${15 * config.glowIntensity}px)`,
          }}
        />
      )}

      {/* Color Burst Flash effect */}
      {colorBurstActive && (
        <div
          className="absolute inset-0 pointer-events-none z-20 animate-ping opacity-60"
          style={{ backgroundColor: config.primaryColor }}
        />
      )}

      {/* Main 3D Parallax Face Container */}
      <div
        className="relative z-20 w-full h-full flex flex-col items-center justify-center p-4 transition-transform duration-75"
        style={{
          transform: `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${faceSquish.x}, ${faceSquish.y}) rotate(${dizzyRotation}deg) translate(${shakeIntensity ? (Math.random() - 0.5) * shakeIntensity : 0}px, ${shakeIntensity ? (Math.random() - 0.5) * shakeIntensity : 0}px)`,
        }}
      >
        <svg
          viewBox="-200 -240 400 480"
          className="w-full h-full max-h-[92%] drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Dynamic Glow Filter for Neon Silly Smile */}
            <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={4 * (config.glowIntensity || 1)} result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation={10 * (config.glowIntensity || 1)} result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="innerPupilGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Linear eye socket gradient */}
            <radialGradient id="eyeGlowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" />
              <stop offset="70%" stopColor="#0a0306" />
              <stop offset="100%" stopColor={config.primaryColor} stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {/* Optional Demon Horns */}
          {config.hasHorns && (
            <g filter="url(#glowFilter)">
              {/* Left horn */}
              <path
                d="M -85,-110 C -120,-160 -150,-185 -140,-200 C -120,-190 -100,-150 -60,-125 Z"
                fill={config.primaryColor}
                opacity="0.9"
              />
              {/* Right horn */}
              <path
                d="M 85,-110 C 120,-160 150,-185 140,-200 C 120,-190 100,-150 60,-125 Z"
                fill={config.primaryColor}
                opacity="0.9"
              />
            </g>
          )}

          {/* Eyes Group */}
          <g transform="translate(0, -50)">
            {/* Left Eye */}
            <g transform={`translate(-${eyeSpacing}, 0)`}>
              {renderEyeShape('left')}
              {/* Blood tears */}
              {config.hasBloodTears && (
                <path
                  d="M -5,25 C -5,55 -15,75 -8,95 C -2,75 5,55 5,25 Z"
                  fill="#ff0033"
                  filter="url(#glowFilter)"
                />
              )}
            </g>

            {/* Right Eye */}
            <g transform={`translate(${eyeSpacing}, 0)`}>
              {renderEyeShape('right')}
              {/* Blood tears */}
              {config.hasBloodTears && (
                <path
                  d="M -5,25 C -5,55 -15,75 -8,95 C -2,75 5,55 5,25 Z"
                  fill="#ff0033"
                  filter="url(#glowFilter)"
                />
              )}
            </g>
          </g>

          {/* Optional Cheek Blush for Kawaii / Yandere */}
          {config.hasCheekBlush && (
            <g opacity="0.75" filter="url(#glowFilter)">
              <ellipse cx={-eyeSpacing - 15} cy="15" rx="22" ry="12" fill={config.primaryColor} />
              <ellipse cx={eyeSpacing + 15} cy="15" rx="22" ry="12" fill={config.primaryColor} />
            </g>
          )}

          {/* Mouth Group */}
          <g transform="translate(0, 95)">
            {renderMouthShape()}
          </g>
        </svg>
      </div>
    </div>
  );
};
