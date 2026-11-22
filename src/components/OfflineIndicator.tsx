import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-[70px] z-30 flex -translate-x-1/2 items-center gap-2 border border-[#E5B85B]/55 bg-[#0B2B22]/96 px-3.5 py-2 text-xs font-medium text-[#FFF9F0] shadow-[0_10px_28px_rgba(3,14,11,0.65)] whitespace-nowrap"
    >
      <WifiOff className="h-3.5 w-3.5 text-[#E5B85B] shrink-0" aria-hidden="true" />
      <span>Mode hors ligne — Boutique en cache active</span>
    </div>
  );
};
