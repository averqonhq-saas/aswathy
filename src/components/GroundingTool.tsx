"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react";

export default function GroundingTool() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Rest">(
    "Inhale"
  );
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Gentle soothing chime via Web Audio API
  const playGentleChime = (freq = 432) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.9);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (phase === "Inhale") {
              setPhase("Hold");
              playGentleChime(528);
              return 4;
            } else if (phase === "Hold") {
              setPhase("Exhale");
              playGentleChime(396);
              return 4;
            } else if (phase === "Exhale") {
              setPhase("Rest");
              playGentleChime(330);
              return 4;
            } else {
              setPhase("Inhale");
              setCycleCount((c) => c + 1);
              playGentleChime(432);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, phase, soundEnabled]);

  const handleToggle = () => {
    if (!isActive) {
      playGentleChime(432);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("Inhale");
    setSecondsLeft(4);
    setCycleCount(0);
  };

  const getScaleClass = () => {
    if (!isActive) return "scale-100";
    if (phase === "Inhale") return "scale-125 transition-transform duration-[4000ms] ease-out";
    if (phase === "Hold") return "scale-125 transition-transform duration-300";
    if (phase === "Exhale") return "scale-90 transition-transform duration-[4000ms] ease-in";
    return "scale-90 transition-transform duration-300";
  };

  return (
    <section className="py-space-2xl bg-surface-container-low px-gutter-mobile lg:px-gutter-desktop">
      <div className="max-w-3xl mx-auto rounded-3xl bg-surface border border-parchment-border p-space-xl md:p-space-2xl shadow-sm text-center space-y-space-lg relative overflow-hidden">
        {/* Decorative soft glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>

        <div className="space-y-space-xxs relative z-10">
          <div className="inline-flex items-center gap-space-xs px-space-md py-space-xxs rounded-full bg-surface-container text-secondary font-label-caps text-label-caps uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A Gentle Pause</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight">
            Take a grounding moment.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
            If reaching out feels daunting, take 60 seconds with this guided box
            breathing exercise to settle your nervous system.
          </p>
        </div>

        {/* Breathing Orb Visualization */}
        <div className="py-space-lg flex flex-col items-center justify-center relative">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Outer halo */}
            <div
              className={`absolute inset-0 rounded-full bg-secondary-fixed/30 blur-xl ${getScaleClass()}`}
            ></div>

            {/* Main breathing sphere */}
            <div
              className={`w-36 h-36 rounded-full bg-gradient-to-br from-primary-fixed to-secondary-fixed-dim/70 flex flex-col items-center justify-center shadow-lg border-2 border-surface ${getScaleClass()}`}
            >
              <span className="font-headline-sm text-headline-sm text-primary font-medium tracking-wide">
                {isActive ? phase : "Ready"}
              </span>
              <span className="font-label-caps text-label-caps text-primary/80 text-[12px] font-semibold mt-1">
                {isActive ? `${secondsLeft}s` : "4-4-4-4"}
              </span>
            </div>
          </div>

          {isActive && (
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md italic animate-fadeIn">
              {phase === "Inhale" && "Gently breathe in deeply through your nose..."}
              {phase === "Hold" && "Gently hold the breath, feeling steady..."}
              {phase === "Exhale" && "Slowly release all tension through your mouth..."}
              {phase === "Rest" && "Rest in stillness before the next breath..."}
            </p>
          )}

          {cycleCount > 0 && (
            <span className="text-[11px] font-label-caps uppercase text-secondary tracking-widest mt-1">
              Completed cycles: {cycleCount}
            </span>
          )}
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center justify-center gap-space-sm relative z-10">
          <button
            onClick={handleToggle}
            className="px-space-xl py-space-sm rounded-full bg-primary text-surface hover:bg-primary-container transition-all duration-300 font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-md cursor-pointer"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Begin Breathing</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playGentleChime(432);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              soundEnabled
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
            }`}
            title={soundEnabled ? "Mute chimes" : "Enable soothing chimes"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
