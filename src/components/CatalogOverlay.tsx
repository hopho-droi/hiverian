import React, { useEffect } from 'react';
import { ArrowRight, Box, Star, X } from 'lucide-react';
import {
  AMAZON_LEGAL_DISCLOSURE,
  BRAND_NAME,
  CATALOG,
  SEASONAL_BANNER_LABEL,
  getAisleBySlug,
  type AisleSlug,
} from '../catalog';
import { ProductImage } from './ProductImage';

interface CatalogOverlayProps {
  isOpen: boolean;
  activeAisleSlug: AisleSlug;
  onSelectAisle: (slug: AisleSlug) => void;
  onInspectIn3D: (productId: string) => void;
  onClose: () => void;
}

/**
 * Vue Catalogue 2D Noël luxe synchronisée avec le fichier local src/catalog.ts.
 */
export const CatalogOverlay: React.FC<CatalogOverlayProps> = ({
  isOpen,
  activeAisleSlug,
  onSelectAisle,
  onInspectIn3D,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeAisle = getAisleBySlug(activeAisleSlug);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-[#071E18] text-[#FFF9F0]"
      role="dialog"
      aria-modal="true"
      aria-label="Vue Catalogue 2D"
    >
      {/* Barre supérieure avec marges de sécurité Android */}
      <header className="safe-top flex shrink-0 items-center justify-between gap-4 border-b border-[#E5B85B]/30 bg-[#0B2B22] px-4 pb-3.5 sm:px-8">
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <span className="font-serif text-lg font-semibold tracking-tight text-[#FFF9F0]">
            {BRAND_NAME}
          </span>
          <span aria-hidden="true" className="hidden text-[#E5B85B]/60 sm:inline">
            ·
          </span>
          <span className="hidden text-xs font-medium text-[#E5B85B] sm:inline">
            {SEASONAL_BANNER_LABEL}
          </span>
        </div>

        {/* Navigation rayons bureau */}
        <nav
          aria-label="Rayons du catalogue"
          className="hidden items-center gap-6 lg:flex"
        >
          {CATALOG.map((aisle) => {
            const isActive = aisle.slug === activeAisleSlug;
            return (
              <button
                key={aisle.slug}
                type="button"
                onClick={() => onSelectAisle(aisle.slug)}
                className={`border-b-2 py-1 text-sm transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-[#E5B85B] font-semibold text-[#FFF9F0]'
                    : 'border-transparent text-[#D4CFC4] hover:text-[#E5B85B]'
                }`}
              >
                {aisle.shortLabel}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-[44px] items-center gap-2 border border-[#E5B85B]/50 bg-[#071E18] px-4 py-2 text-xs font-semibold text-[#FFF9F0] transition-colors active:bg-[#123D31] hover:border-[#E5B85B] hover:text-[#E5B85B] whitespace-nowrap shrink-0"
        >
          <Box className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
          <span>Retour en 3D</span>
          <X className="ml-0.5 h-3.5 w-3.5 text-[#D4CFC4]" aria-hidden="true" />
        </button>
      </header>

      {/* Onglets rayons mobile & Android */}
      <div className="no-scrollbar flex shrink-0 snap-x snap-mandatory items-center gap-1.5 overflow-x-auto border-b border-[#E5B85B]/20 bg-[#09241C] px-4 py-2.5 lg:hidden">
        {CATALOG.map((aisle) => {
          const isActive = aisle.slug === activeAisleSlug;
          return (
            <button
              key={aisle.slug}
              type="button"
              onClick={() => onSelectAisle(aisle.slug)}
              className={`min-h-[44px] snap-center px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border border-[#E5B85B]/45 bg-gradient-to-r from-[#9B1B26] to-[#B91C1C] font-semibold text-[#FFF9F0]'
                  : 'text-[#D4CFC4] active:bg-[#123D31] hover:bg-[#123D31] hover:text-[#FFF9F0]'
              }`}
            >
              {aisle.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Grille produit scrollable */}
      <main className="luxury-scroll safe-bottom-sheet flex-1 overflow-y-auto px-4 pt-6 sm:px-8 sm:pt-8">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-8 flex flex-col justify-between gap-3 border-b border-[#E5B85B]/25 pb-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium text-[#E5B85B]">
                Rayon {activeAisle.indexLabel} · {activeAisle.products.length} pièces sélectionnées
              </p>
              <h1 className="mt-1.5 font-serif text-2xl font-semibold text-[#FFF9F0] [text-wrap:balance] sm:text-3xl">
                {activeAisle.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#D4CFC4]">
                {activeAisle.subtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {activeAisle.products.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col border border-[#E5B85B]/28 bg-[#0B2B22] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#E5B85B]/65"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#071E18]">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.title}
                    className="transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="border border-[#E5B85B]/30 bg-[#9B1B26] px-2 py-0.5 text-[11px] font-semibold text-[#FFF9F0]">
                        {product.badge}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums text-[#FFF9F0]">
                        <Star
                          className="h-3.5 w-3.5 fill-[#E5B85B] text-[#E5B85B]"
                          aria-hidden="true"
                        />
                        {product.rating.toFixed(1)}/5
                      </span>
                    </div>

                    <h2 className="mt-3 font-serif text-lg font-semibold leading-snug text-[#FFF9F0]">
                      {product.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#D4CFC4]">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-[#E5B85B]/18 pt-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-lg font-semibold tabular-nums text-[#E5B85B]">
                        {product.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => onInspectIn3D(product.id)}
                        className="text-xs font-medium text-[#FFF9F0]/90 underline decoration-[#E5B85B]/55 underline-offset-4 transition-colors hover:text-[#E5B85B]"
                      >
                        Voir en 3D
                      </button>
                    </div>

                    <a
                      href={product.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="mt-3.5 flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#E5B85B]/40 bg-gradient-to-r from-[#9B1B26] to-[#B91C1C] px-4 py-2.5 text-xs font-semibold tracking-wide text-[#FFF9F0] shadow-[0_6px_18px_rgba(155,27,38,0.42)] transition-all hover:brightness-110"
                    >
                      <span>Voir l’offre sur Amazon</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <footer className="mt-12 border-t border-[#E5B85B]/20 pt-6 text-center text-xs text-[#C2CFC9]">
            <p>{AMAZON_LEGAL_DISCLOSURE}</p>
          </footer>
        </div>
      </main>
    </div>
  );
};
