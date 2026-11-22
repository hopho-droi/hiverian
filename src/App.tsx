import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, LayoutGrid, ShoppingBag } from 'lucide-react';
import {
  AMAZON_STORE_URL,
  BRAND_NAME,
  CATALOG,
  SEASONAL_BANNER_LABEL,
  getAisleBySlug,
  getInitialAisleSlugFromUrl,
  getProductById,
  updateUrlForAisle,
  type AisleSlug,
} from './catalog';
import { ChaletBoutiqueScene } from './scene/ChaletBoutiqueScene';
import { ProductSheet } from './components/ProductSheet';
import { CatalogOverlay } from './components/CatalogOverlay';
import { SnowfallLayer } from './components/SnowfallLayer';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [activeAisleSlug, setActiveAisleSlug] = useState<AisleSlug>(() =>
    getInitialAisleSlugFromUrl()
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Couche d'historique légère pour que le bouton Retour Android ferme les panneaux proprement
  const overlayHistoryPushedRef = useRef(false);
  const dockButtonRefs = useRef<Map<AisleSlug, HTMLButtonElement | null>>(new Map());

  const activeAisle = getAisleBySlug(activeAisleSlug);
  const selectedProduct = getProductById(selectedProductId);
  const hasOpenOverlay = Boolean(selectedProductId || isCatalogOpen);

  useEffect(() => {
    if (hasOpenOverlay && !overlayHistoryPushedRef.current) {
      window.history.pushState(
        { ...(window.history.state ?? {}), hiveriaOverlay: true },
        '',
        window.location.href
      );
      overlayHistoryPushedRef.current = true;
    } else if (!hasOpenOverlay && overlayHistoryPushedRef.current) {
      overlayHistoryPushedRef.current = false;
      if (window.history.state && window.history.state.hiveriaOverlay) {
        window.history.back();
      }
    }
  }, [hasOpenOverlay]);

  // Centre automatiquement le rayon actif dans la barre horizontale mobile
  useEffect(() => {
    const activeBtn = dockButtonRefs.current.get(activeAisleSlug);
    if (activeBtn && !isDockCollapsed) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeAisleSlug, isDockCollapsed]);

  // Synchronise le titre de l'onglet avec le rayon actif
  useEffect(() => {
    document.title = `${activeAisle.title} — ${BRAND_NAME}`;
  }, [activeAisle.title]);

  // Gère le geste Retour Android et la navigation directe par URL (?rayon=... / #rayon-...)
  useEffect(() => {
    const onPopState = () => {
      if (overlayHistoryPushedRef.current) {
        overlayHistoryPushedRef.current = false;
        setIsCatalogOpen(false);
        setSelectedProductId(null);
        return;
      }
      setActiveAisleSlug(getInitialAisleSlugFromUrl());
      setSelectedProductId(null);
    };

    const onHashChange = () => {
      setActiveAisleSlug(getInitialAisleSlugFromUrl());
      setSelectedProductId(null);
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  // Raccourci clavier bureau : touche 'H' pour replier/déplier la barre des rayons
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isCatalogOpen) return;
      if (e.key === 'h' || e.key === 'H') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCatalogOpen]);

  const handleSelectAisle = useCallback((slug: AisleSlug) => {
    setActiveAisleSlug(slug);
    setSelectedProductId(null);
    updateUrlForAisle(slug);
  }, []);

  const handleSelectProduct = useCallback(
    (productId: string) => {
      const found = getProductById(productId);
      if (!found) return;
      if (found.aisleId !== activeAisleSlug) {
        setActiveAisleSlug(found.aisleId);
        updateUrlForAisle(found.aisleId);
      }
      setSelectedProductId(found.id);
    },
    [activeAisleSlug]
  );

  const handleInspectFromCatalog = useCallback((productId: string) => {
    const found = getProductById(productId);
    if (!found) return;
    setIsCatalogOpen(false);
    setActiveAisleSlug(found.aisleId);
    updateUrlForAisle(found.aisleId);
    setSelectedProductId(found.id);
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#071E18] text-[#FFF9F0]">
      {/* Scène 3D WebGL plein écran */}
      <ChaletBoutiqueScene
        activeAisleSlug={activeAisleSlug}
        selectedProductId={selectedProductId}
        onSelectProduct={handleSelectProduct}
        onOpenCatalogFallback={() => setIsCatalogOpen(true)}
      />

      {/* Neige douce tombante en arrière-plan (n'intercepte jamais les clics) */}
      <SnowfallLayer />

      {/* Indicateur discret hors ligne */}
      <OfflineIndicator />

      {/* En-tête Noël luxe 100 % public */}
      <header className="safe-top pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 pb-2 sm:px-6 sm:pb-4">
        <div className="pointer-events-auto flex items-center border border-[#E5B85B]/40 bg-[#0B2B22]/94 shadow-[0_8px_24px_rgba(3,14,11,0.5)] shrink-0">
          <a
            href={`?rayon=${activeAisleSlug}`}
            onClick={(e) => {
              e.preventDefault();
              setSelectedProductId(null);
            }}
            className="flex min-h-[44px] items-center px-3 font-serif text-sm font-semibold tracking-tight text-[#FFF9F0] transition-colors hover:text-[#E5B85B] whitespace-nowrap sm:px-3.5 sm:text-lg"
          >
            {BRAND_NAME}
          </a>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-[#E5B85B]/35 sm:block"
          />
          <span className="hidden bg-[#9B1B26]/90 px-3 py-2.5 text-[11px] font-semibold tracking-wide text-[#FFF9F0] whitespace-nowrap sm:inline-block">
            {SEASONAL_BANNER_LABEL}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          <PWAInstallButton />

          <a
            href={AMAZON_STORE_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex min-h-[44px] items-center gap-1.5 border border-[#E5B85B]/50 bg-gradient-to-r from-[#9B1B26] to-[#B91C1C] px-3 py-2 text-xs font-semibold text-[#FFF9F0] shadow-[0_8px_24px_rgba(155,27,38,0.45)] transition-all active:scale-[0.98] hover:brightness-110 whitespace-nowrap shrink-0 sm:px-3.5"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
            <span className="sm:hidden">Amazon</span>
            <span className="hidden sm:inline">Boutique Amazon</span>
          </a>

          <button
            type="button"
            onClick={() => setIsCatalogOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-1.5 border border-[#E5B85B]/50 bg-[#0B2B22]/95 px-3 py-2 text-xs font-semibold text-[#FFF9F0] shadow-[0_8px_24px_rgba(3,14,11,0.45)] transition-colors active:bg-[#123D31] hover:border-[#E5B85B] hover:text-[#E5B85B] whitespace-nowrap shrink-0 sm:px-3.5"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
            <span className="sm:hidden">Catalogue</span>
            <span className="hidden sm:inline">Vue Catalogue 2D</span>
          </button>
        </div>
      </header>

      {/* Barre flottante des rayons (repliable) */}
      <div
        className={`safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-20 flex flex-col items-center px-3 transition-transform duration-200 sm:pb-5 ${
          selectedProduct
            ? 'translate-y-32 opacity-0 md:translate-y-0 md:opacity-100'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsDockCollapsed((prev) => !prev)}
          aria-expanded={!isDockCollapsed}
          aria-label={
            isDockCollapsed
              ? 'Afficher la barre des rayons'
              : 'Masquer la barre des rayons'
          }
          className="pointer-events-auto mb-1 inline-flex min-h-[32px] items-center gap-1.5 border border-[#E5B85B]/40 bg-[#0B2B22]/94 px-3 py-1 text-[11px] font-medium text-[#FFF9F0]/90 transition-colors active:bg-[#123D31] hover:border-[#E5B85B] hover:text-[#E5B85B]"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
              <span>Rayons · {activeAisle.shortLabel}</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
              <span className="hidden sm:inline">Masquer</span>
            </>
          )}
        </button>

        {!isDockCollapsed && (
          <nav
            aria-label="Navigation des rayons de la boutique"
            className="no-scrollbar pointer-events-auto flex max-w-[min(1080px,96vw)] snap-x snap-mandatory scroll-px-2 items-center gap-1 overflow-x-auto border border-[#E5B85B]/45 bg-[#0B2B22]/95 p-1.5 shadow-[0_14px_38px_rgba(3,14,11,0.7)]"
          >
            {CATALOG.map((aisle) => {
              const isActive = aisle.slug === activeAisleSlug;
              return (
                <button
                  key={aisle.slug}
                  ref={(el) => {
                    dockButtonRefs.current.set(aisle.slug, el);
                  }}
                  type="button"
                  onClick={() => handleSelectAisle(aisle.slug)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[44px] snap-center items-center gap-2 px-3.5 py-2 text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 sm:px-4 ${
                    isActive
                      ? 'border border-[#E5B85B]/55 bg-gradient-to-r from-[#9B1B26] to-[#B91C1C] font-semibold text-[#FFF9F0] shadow-[0_4px_14px_rgba(155,27,38,0.45)]'
                      : 'text-[#FFF9F0]/88 active:bg-[#123D31] hover:bg-[#123D31] hover:text-[#E5B85B]'
                  }`}
                >
                  <span
                    className={`hidden text-[10px] tabular-nums sm:inline ${
                      isActive ? 'text-[#E5B85B]' : 'text-[#E5B85B]/80'
                    }`}
                  >
                    {aisle.indexLabel}
                  </span>
                  <span>{aisle.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Fiche Produit (panneau droit bureau / bottom-sheet mobile) */}
      <ProductSheet
        product={selectedProduct}
        onClose={() => setSelectedProductId(null)}
      />

      {/* Vue Catalogue 2D plein écran */}
      <CatalogOverlay
        isOpen={isCatalogOpen}
        activeAisleSlug={activeAisleSlug}
        onSelectAisle={handleSelectAisle}
        onInspectIn3D={handleInspectFromCatalog}
        onClose={() => setIsCatalogOpen(false)}
      />
    </div>
  );
}
