import React from 'react';

interface FlakeSpec {
  id: number;
  leftPercent: number;
  sizePx: number;
  durationSec: number;
  delaySec: number;
  driftPx: number;
  opacity: number;
  warmTint: boolean;
}

// Deterministic lightweight set of 26 soft ambient snowflakes (zero runtime timers)
const SNOWFLAKES: readonly FlakeSpec[] = Array.from({ length: 26 }, (_, i) => {
  const seed = (i + 1) * 37;
  return {
    id: i,
    leftPercent: ((seed * 19) % 98) + 1,
    sizePx: 2.5 + (i % 4) * 1.15,
    durationSec: 11 + (i % 7) * 2.2,
    delaySec: -((i * 1.7) % 16),
    driftPx: (i % 2 === 0 ? 1 : -1) * (16 + (i % 5) * 8),
    opacity: 0.22 + (i % 4) * 0.11,
    warmTint: i % 5 === 0,
  };
});

/**
 * Discreet falling snow overlay sitting cleanly above the background without
 * ever intercepting clicks, touch gestures, or impacting 60 FPS WebGL.
 */
export const SnowfallLayer: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[15] overflow-hidden"
    >
      {SNOWFLAKES.map((flake) => (
        <span
          key={flake.id}
          className="snowflake-particle absolute top-0 rounded-full"
          style={
            {
              left: `${flake.leftPercent}%`,
              width: `${flake.sizePx}px`,
              height: `${flake.sizePx}px`,
              backgroundColor: flake.warmTint ? '#E5B85B' : '#FFF9F0',
              boxShadow: flake.warmTint
                ? '0 0 6px rgba(229, 184, 91, 0.55)'
                : '0 0 5px rgba(255, 249, 240, 0.5)',
              '--snow-duration': `${flake.durationSec}s`,
              '--snow-delay': `${flake.delaySec}s`,
              '--snow-drift': `${flake.driftPx}px`,
              '--snow-opacity': String(flake.opacity),
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
