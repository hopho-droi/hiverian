import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

/**
 * Luxury Christmas in-app install trigger optimized for Android Chrome,
 * Android Pinterest/in-app WebViews, and iOS Safari.
 * Automatically hides when launched in standalone app mode.
 */
export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, isIOS, isInAppBrowser, install } =
    usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Native Android Chrome / Chromium install prompt
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        aria-label="Installer l'application Maison Hiveria sur Android"
        className="inline-flex min-h-[44px] items-center gap-1.5 border border-[#E5B85B]/55 bg-gradient-to-r from-[#9B1B26] to-[#B91C1C] px-3 py-2 text-xs font-semibold text-[#FFF9F0] shadow-[0_6px_18px_rgba(155,27,38,0.45)] transition-all active:scale-[0.98] hover:brightness-110 whitespace-nowrap shrink-0"
      >
        <Download className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
        <span>Installer</span>
      </button>
    );
  }

  // Guided installation modal for Android browsers without native prompt (e.g. Pinterest in-app browser) or iOS Safari
  if (isAndroid || isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          aria-label="Ajouter l'application sur l'écran d'accueil"
          className="inline-flex min-h-[44px] items-center gap-1.5 border border-[#E5B85B]/50 bg-[#0B2B22]/95 px-3 py-2 text-xs font-semibold text-[#E5B85B] shadow-[0_8px_24px_rgba(3,14,11,0.45)] transition-colors active:bg-[#123D31] hover:border-[#E5B85B] whitespace-nowrap shrink-0"
        >
          <Smartphone className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
          <span className="hidden sm:inline">App</span>
        </button>

        {showGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#071E18]/75 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-guide-title"
          >
            <div className="safe-bottom-sheet w-full max-w-sm border border-[#E5B85B]/45 bg-[#0B2B22] p-5 text-[#FFF9F0] shadow-[0_24px_60px_rgba(0,0,0,0.75)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E5B85B]">
                    Application Mobile
                  </p>
                  <h3
                    id="pwa-guide-title"
                    className="mt-1 font-serif text-lg font-semibold text-[#FFF9F0]"
                  >
                    {isAndroid
                      ? 'Installer sur Android'
                      : 'Ajouter sur l’écran d’accueil'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Fermer le guide d'installation"
                  className="flex h-10 w-10 items-center justify-center border border-[#E5B85B]/35 bg-[#071E18] text-[#FFF9F0]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {isAndroid ? (
                <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#FFF9F0]/90">
                  {isInAppBrowser && (
                    <li>
                      <span className="font-semibold text-[#E5B85B]">1.</span> Touchez le
                      menu en haut à droite et choisissez{' '}
                      <strong className="text-[#FFF9F0]">Ouvrir dans Chrome</strong>.
                    </li>
                  )}
                  <li>
                    <span className="font-semibold text-[#E5B85B]">
                      {isInAppBrowser ? '2.' : '1.'}
                    </span>{' '}
                    Touchez le menu <strong className="text-[#FFF9F0]">⋮</strong> de votre
                    navigateur Android.
                  </li>
                  <li>
                    <span className="font-semibold text-[#E5B85B]">
                      {isInAppBrowser ? '3.' : '2.'}
                    </span>{' '}
                    Sélectionnez{' '}
                    <strong className="text-[#FFF9F0]">Installer l’application</strong> ou{' '}
                    <strong className="text-[#FFF9F0]">Ajouter à l’écran d’accueil</strong>.
                  </li>
                </ol>
              ) : (
                <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#FFF9F0]/90">
                  <li>
                    <span className="font-semibold text-[#E5B85B]">1.</span> Touchez le
                    bouton <strong className="text-[#FFF9F0]">Partager</strong> dans la
                    barre Safari.
                  </li>
                  <li>
                    <span className="font-semibold text-[#E5B85B]">2.</span> Faites défiler
                    puis sélectionnez{' '}
                    <strong className="text-[#FFF9F0]">Sur l’écran d’accueil</strong>.
                  </li>
                </ol>
              )}

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-5 flex min-h-[46px] w-full items-center justify-center border border-[#E5B85B]/45 bg-gradient-to-r from-[#9B1B26] to-[#B91C1C] px-4 py-2.5 text-xs font-semibold text-[#FFF9F0]"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
