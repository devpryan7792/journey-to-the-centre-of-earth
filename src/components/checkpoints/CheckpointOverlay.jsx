import React, { useRef, useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { useScrollStore } from '../../store/useScrollStore';
import { CHECKPOINTS } from '../../data/checkpoints';
import { ILLUSTRATION_CONFIG } from './illustrationConfig';
import { useShery } from './useShery';
import './CheckpointOverlay.css';

export function CheckpointOverlay() {
  const currentCheckpoint = useScrollStore((state) => state.currentCheckpoint);
  const narrativeProgress = useScrollStore((state) => state.narrativeProgress);
  const localProgress = useScrollStore((state) => state.localProgress);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Compute overlay opacity to match the new 15% - 85% reading zone
  let overlayOpacity = 0;
  if (localProgress >= 0.1 && localProgress < 0.15) {
    overlayOpacity = (localProgress - 0.1) / 0.05;
  } else if (localProgress >= 0.15 && localProgress <= 0.85) {
    overlayOpacity = 1;
  } else if (localProgress > 0.85 && localProgress <= 0.9) {
    overlayOpacity = 1 - (localProgress - 0.85) / 0.05;
  }

  const isActive = currentCheckpoint.card !== null && overlayOpacity > 0;
  const config = ILLUSTRATION_CONFIG[currentCheckpoint.id];

  // Refs
  const overlayRef     = useRef();
  const illustrationRef = useRef();
  const labelRef       = useRef();
  const titleRef       = useRef();
  const bodyRef        = useRef();
  const prevIdRef      = useRef(-1);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse tracking for spotlight
  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  // Apply opacity and spotlight directly every render
  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.style.opacity = overlayOpacity;
    // We REMOVE the pointerEvents override so it stays pointer-events-none, allowing the Canvas underneath to receive hover/click logic!
    
    // Spotlight Effect (CSS Mask)
    if (illustrationRef.current) {
        illustrationRef.current.style.maskImage = `radial-gradient(circle 350px at ${mousePos.x}% ${mousePos.y}%, black 0%, transparent 100%)`;
        illustrationRef.current.style.WebkitMaskImage = `radial-gradient(circle 350px at ${mousePos.x}% ${mousePos.y}%, black 0%, transparent 100%)`;
    }
  });

  // GSAP text + image animation on checkpoint change
  useEffect(() => {
    if (!isActive) return;
    if (prevIdRef.current === currentCheckpoint.id) return;
    prevIdRef.current = currentCheckpoint.id;

    // Reset components to initial blurred, wide-spaced state
    gsap.set([labelRef.current, bodyRef.current], { 
      opacity: 0, 
      y: 40,
      filter: 'blur(10px)',
      clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' 
    });

    // Animate title letters if they exist
    let titleChars = [];
    if (titleRef.current) {
        titleChars = titleRef.current.querySelectorAll('.title-char');
        gsap.set(titleChars, {
            opacity: 0,
            y: 30,
            filter: 'blur(12px)',
            paddingLeft: '10px' // initial wide letter spacing simulation
        });
    }

    const tl = gsap.timeline();
    
    tl.to(labelRef.current, { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        clipPath: 'polygon(0% -20%, 100% -20%, 100% 120%, 0% 120%)', 
        duration: 0.8, 
        ease: 'power4.out' 
      })
      
    if (titleChars.length > 0) {
      tl.to(titleChars, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          paddingLeft: '0px',
          duration: 1.2,
          stagger: 0.04,
          ease: 'power3.out'
      }, '-=0.6');
    }

    tl.to(bodyRef.current,  { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        clipPath: 'polygon(0% -20%, 100% -20%, 100% 120%, 0% 120%)', 
        duration: 1.2, 
        ease: 'power3.out' 
      }, '-=0.8');

    // Image entrance (Parallax/Scale)
    if (illustrationRef.current) {
      gsap.fromTo(illustrationRef.current,
        { opacity: 0, scale: 1.15, filter: 'blur(10px)' },
        { opacity: 1, scale: 1.0, filter: 'blur(0px)', duration: 1.8, ease: 'power3.out' }
      );
    }
  }, [currentCheckpoint.id, isActive]);

  // Shery.js mouse distortion on the illustration
  useShery(isActive);

  if (!config) return null;

  return (
    <div
      ref={overlayRef}
      className="checkpoint-overlay"
      style={{ '--glow-color': config.glowColor }}
    >
      {/* Corner ornaments */}
      <div className="checkpoint-corner tl" />
      <div className="checkpoint-corner tr" />
      <div className="checkpoint-corner bl" />
      <div className="checkpoint-corner br" />

      {/* Background: Glassmorphism blur filtering to match cinematic 1864 atmospheric guidelines */}
      <div
        className="checkpoint-bg"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,0.1) 0%, rgba(20, 15, 12, 0.7) 100%)`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      />

      {/* Grain */}
      <div className="checkpoint-grain" />

      {/* Atmospheric Particles (Dust Motes) */}
      <div className="mural-particles">
          {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="mural-particle"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 4 + 1}px`,
                    height: `${Math.random() * 4 + 1}px`,
                    animationDelay: `${Math.random() * 10}s`,
                    animationDuration: `${Math.random() * 10 + 10}s`,
                    opacity: Math.random() * 0.4 + 0.1
                }}
              />
          ))}
      </div>

      {/* Vignette */}
      <div
        className="checkpoint-vignette"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, transparent 10%, rgba(0,0,0,0.85) 100%)`
        }}
      />

      {/* Main content grid */}
      <div className="checkpoint-content">

        {/* LEFT: Illustration (The Mural) 3D Parallax Perspective Card Effect */}
        <div 
          className="checkpoint-illustration-wrap" 
          style={{ perspective: '1200px' }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transformStyle: 'preserve-3d',
              // Increased the degree multiplier significantly so the 3D rotation acts as a hard physical pop-out
              transform: `rotateX(${-(mousePos.y - 50) * 0.6}deg) rotateY(${(mousePos.x - 50) * 0.6}deg) translateZ(40px)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* DUAL LAYER LOGIC: If a background/foreground image pair is defined in config, render dual parallax. Otherwise render single image. */}
            {config.backgroundImage && config.foregroundImage ? (
              <>
                <img
                  ref={illustrationRef}
                  src={config.backgroundImage}
                  alt={currentCheckpoint.card?.title || 'Background'}
                  loading="lazy"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="checkpoint-illustration"
                  style={{
                      transform: 'translateZ(-40px) scale(1.05)', // Background pushed out
                      filter: `drop-shadow(0 20px 40px rgba(0,0,0,0.8)) brightness(1.2) contrast(1.2) sepia(0.2) hue-rotate(${
                          currentCheckpoint.id === 3 ? '120deg'   
                          : currentCheckpoint.id === 4 ? '180deg'   
                          : currentCheckpoint.id === 6 ? '0deg'     
                          : '20deg'                                  
                      })` 
                  }}
                />
                <img
                  src={config.foregroundImage}
                  alt={currentCheckpoint.card?.title || 'Foreground'}
                  loading="lazy"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="checkpoint-illustration"
                  style={{
                      position: 'absolute',
                      transform: 'translateZ(60px)', // Foreground actor popped towards the user
                      pointerEvents: 'none',
                      filter: `brightness(1.2) contrast(1.2) sepia(0.2) hue-rotate(${
                          currentCheckpoint.id === 3 ? '120deg'   
                          : currentCheckpoint.id === 4 ? '180deg'   
                          : currentCheckpoint.id === 6 ? '0deg'     
                          : '20deg'                                  
                      })` 
                  }}
                />
              </>
            ) : (
              <img
                ref={illustrationRef}
                src={config.image}
                alt={currentCheckpoint.card?.title || ''}
                loading="lazy"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="checkpoint-illustration"
                style={{
                    filter: `drop-shadow(0 20px 40px rgba(0,0,0,0.8)) brightness(1.2) contrast(1.2) sepia(0.2) hue-rotate(${
                        currentCheckpoint.id === 3 ? '120deg'   // tunnels: teal shift
                        : currentCheckpoint.id === 4 ? '180deg'   // sea: blue shift
                        : currentCheckpoint.id === 6 ? '0deg'     // explosion: keep warm
                        : '20deg'                                  // rest: slight warm gold
                    })` 
                }}
              />
            )}
            
            {/* Dynamic Glass Glare matching flashlight position */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                mixBlendMode: 'overlay',
                transform: 'translateZ(1px)', // Keeps glare slightly above the image physically
                maxHeight: '80vh',
                maxWidth: '90%',
              }}
            />
          </div>
        </div>

        {/* RIGHT: Text */}
        <div className="checkpoint-text">
          <div className="checkpoint-top-line" />
          <span ref={labelRef} className="checkpoint-label">
            {currentCheckpoint.card?.label}
          </span>
          <h2 ref={titleRef} className="checkpoint-title">
            {currentCheckpoint.card?.title?.split('').map((char, i) => (
              <span 
                key={i} 
                className="title-char" 
                style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
              >
                {char}
              </span>
            ))}
          </h2>
          <div
            className="checkpoint-depth-badge"
          >
            {currentCheckpoint.depth}
          </div>
          <p
            ref={bodyRef}
            className="checkpoint-body text-reveal"
            style={{
                '--reveal-progress': `${narrativeProgress * 100}%`,
                filter: narrativeProgress > 0.98 ? 'drop-shadow(0 0 8px rgba(242, 230, 201, 0.4))' : 'none',
                width: '100%',
                transition: 'filter 0.8s ease'
            }}
            dangerouslySetInnerHTML={{
              __html: currentCheckpoint.card?.body.replace(/\n/g, '<br/>')
            }}
          />
          
          {/* Animated Cave Recital Hint */}
          <div className="recital-hint">
            <div className="wave-icon">
                <span></span><span></span><span></span>
            </div>
            {narrativeProgress < 0.95 ? "The cave whispers its secrets..." : "The path reveals itself once more."}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="checkpoint-scroll-hint">
        Continue Scrolling
      </div>
    </div>
  );
}
