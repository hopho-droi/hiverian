import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Share2, Star, X } from 'lucide-react';
import {
  AMAZON_LEGAL_DISCLOSURE,
  buildAisleShareUrl,
  getAisleBySlug,
  type ProductItem,
} from '../catalog';
import { ProductImage } from './ProductImage';

interface ProductSheetProps {
  product: ProductItem | null;
  onClose: () => void;
}

/**
 * Fiche produit de conversion Noël luxe (lecture seule) :
 * - Desktop (>= 768px) : panneau latéral droit
 * - Mobile / Android (< 768px) : bottom-sheet refermable par glissement vers le bas
 */
export const ProductSheet: React.FC<ProductSheetProps> = ({ product, onClose }) => {
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    setDragOffsetY(0);
    setIsDraggingSheet(false);
    setShareFeedback(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartYRef.current = e.touches[0].clientY;
    setIsDraggingSheet(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartYRef.current === null || e.touches.length !== 1) return;
    const delta = e.touches[0].clientY - touchStartYRef.current;
    if (delta > 0) {
      setDragOffsetY(Math.min(delta, 260));
    } else {
      setDragOffsetY(0);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartYRef.current === null) return;
    const shouldClose = dragOffsetY > 72;
    touchStartYRef.current = null;
    setIsDraggingSheet(false);
    if (shouldClose) {
      setDragOffsetY(0);
      onClose();
    } else {
      setDragOffsetY(0);
    }
  }, [dragOffsetY, onClose]);

  const handleShareProduct = useCallback(async () => {
    if (!product) return;
    const url = buildAisleShareUrl(product.aisleId);
    const shareTitle = `${product.title} — Maison Hiveria`;
    const shareText = `${product.title} (${product.price}) dans notre boutique de Noël 3D.`;

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setShareFeedback(true);
        window.setTimeout(() => setShareFeedback(false), 2200);
      }
    } catch {
      // L'utilisateur a annulé le partage natif
    }
  }, [product]);

  if (!product) return null;

  const aisle = getAisleBySlug(product.aisleId);
  const fullStars = Math.floor(product.rating);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 flex items-end justify-end md:items-stretch"
      role="dialog"
      aria-modal="false"
      aria-labelledby="product-sheet-title"
    >
      {/* Zone de fermeture tactile extérieure sur mobile */}
      <button
        type="button"
        aria-label="Fermer la fiche produit"
        onClick={onClose}
        className="pointer-events-auto fixed inset-0 bg-[#071E18]/45 md:bg-transparent"
      />

      {/* Panneau Vert Sapin & Or Champagne */}
      <aside
        style={
          dragOffsetY > 0
            ? {
                transform: `translate3d(0, ${dragOffsetY}px, 0)`,
                transition: isDraggingSheet ? 'none' : 'transform 200ms ease-out',
              }
            : undefined
        }
        className="luxury-scroll pointer-events-auto relative z-10 flex max-h-[82dvh] w-full flex-col overflow-y-auto rounded-t-2xl border-t border-[#E5B85B]/45 bg-[#0B2B22]/96 text-[#FFF9F0] shadow-[0_-18px_52px_rgba(3,14,11,0.72)] transition-transform duration-200 md:h-full md:max-h-none md:w-[420px] md:rounded-none md:border-l md:border-t-0 md:shadow-[-18px_0_52px_rgba(3,14,11,0.72)]"
      >
        {/* Poignée mobile avec glissement vers le bas */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="touch-none select-none md:touch-auto"
        >
          <div className="flex justify-center pt-3 pb-1 md:hidden" aria-hidden="true">
            <div className="h-1.5 w-12 rounded-full bg-[#E5B85B]/55" />
          </div>

          <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-2 md:px-6 md:pt-6">
            <div className="flex min-w-0 items-center gap-2.5 text-xs">
              <span className="border border-[#E5B85B]/35 bg-[#9B1B26] px-2.5 py-0.5 font-semibold text-[#FFF9F0] whitespace-nowrap">
                {product.badge}
              </span>
              <span aria-hidden="true" className="text-[#E5B85B]">
                ·
              </span>
              <span className="truncate font-medium text-[#E5B85B]">
                {aisle.shortLabel}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => void handleShareProduct()}
                aria-label="Partager ce produit"
                title="Partager"
                className="flex h-11 w-11 items-center justify-center border border-[#E5B85B]/35 bg-[#071E18] text-[#E5B85B] transition-colors active:bg-[#123D31] hover:border-[#E5B85B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5B85B]"
              >
                {shareFeedback ? (
                  <Check className="h-4 w-4 text-[#E5B85B]" aria-hidden="true" />
                ) : (
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer la fiche produit"
                className="flex h-11 w-11 items-center justify-center border border-[#E5B85B]/35 bg-[#071E18] text-[#FFF9F0] transition-colors active:bg-[#123D31] hover:border-[#E5B85B] hover:text-[#E5B85B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5B85B]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Visuel Produit (4:3 avec referrerPolicy="no-referrer" + secours) */}
        <div className="px-5 md:px-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#E5B85B]/35 bg-[#071E18]">
            <ProductImage src={product.imageUrl} alt={product.title} priority />
          </div>
        </div>

        {/* Détails Produit & Bouton d'achat affilié Amazon */}
        <div className="safe-bottom-sheet flex flex-1 flex-col justify-between px-5 pt-5 md:px-6 md:pb-8">
          <div>
            <h2
              id="product-sheet-title"
              className="font-serif text-xl font-semibold leading-snug text-[#FFF9F0] [text-wrap:balance] md:text-2xl"
            >
              {product.title}
            </h2>

            <div className="mt-3.5 flex items-baseline justify-between gap-4 border-b border-[#E5B85B]/20 pb-4">
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-0.5 text-[#E5B85B]"
                  aria-label={`Note ${product.rating} sur 5`}
                >
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <Star
                      key={idx}
                      className={`h-3.5 w-3.5 ${
                        idx < fullStars
                          ? 'fill-[#E5B85B] text-[#E5B85B]'
                          : 'fill-[#E5B85B]/35 text-[#E5B85B]'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold tabular-nums text-[#FFF9F0]">
                  {product.rating.toFixed(1)}/5
                </span>
              </div>

              <div className="text-right">
                <span className="block text-xl font-semibold tabular-nums text-[#E5B85B]">
                  {product.price}
                </span>
                <span className="block text-[11px] text-[#D4CFC4]">
                  Prix indicatif
                </span>
              </div>
            </div>

            <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[#FFF9F0]/90">
              {product.description}
            </p>
          </div>

          <div className="mt-6 space-y-3.5">
            <a
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex min-h-[54px] w-full items-center justify-center gap-2.5 border border-[#E5B85B]/45 bg-gradient-to-r from-[#9B1B26] to-[#B91C1C] px-6 py-3.5 text-sm font-semibold tracking-wide text-[#FFF9F0] shadow-[0_10px_28px_rgba(155,27,38,0.5)] transition-all duration-150 active:scale-[0.99] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5B85B]"
            >
              <span>Voir l’offre sur Amazon</span>
              <ArrowRight className="h-4 w-4 text-[#E5B85B]" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[46px] w-full items-center justify-center border border-[#E5B85B]/30 bg-[#071E18]/75 px-4 py-2 text-xs font-medium text-[#FFF9F0]/90 transition-colors active:bg-[#123D31] hover:border-[#E5B85B]/70 hover:text-[#E5B85B]"
            >
              Continuer la visite du rayon
            </button>

            <p className="pt-1 text-[11px] leading-relaxed text-[#C2CFC9]">
              {AMAZON_LEGAL_DISCLOSURE}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};
