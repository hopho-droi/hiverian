/**
 * ============================================================================
 * CATALOGUE LOCAL — MAISON HIVERIA (5 RAYONS DE NOËL)
 * ============================================================================
 * Modifiez librement les produits ci-dessous :
 *  - Pour ajouter un produit dans un rayon, ajoutez simplement un objet avec :
 *    title, price, rating, badge, description, imageUrl, amazonUrl.
 *  - Les vitrines 3D et les hotspots lumineux se placent automatiquement et
 *    harmonieusement selon le nombre de produits dans chaque rayon.
 *  - Pour personnaliser le décor 360° d'un rayon, modifiez son `panoramaUrl`.
 *
 * URLs directes par rayon :
 *  - ?rayon=sapins     (ou #rayon-sapins)
 *  - ?rayon=lumieres   (ou #rayon-lumieres)
 *  - ?rayon=table      (ou #rayon-table)
 *  - ?rayon=couronnes  (ou #rayon-couronnes)
 *  - ?rayon=village    (ou #rayon-village)
 * ============================================================================
 */

export type AisleSlug = 'sapins' | 'lumieres' | 'table' | 'couronnes' | 'village';

export type ProductBadge = 'Coup de cœur' | 'Best-seller' | 'Idée cadeau';

/** Produit simple à éditer directement dans ce fichier */
export interface CatalogProductInput {
  /** Nom complet du produit affiché sur la fiche et le catalogue 2D */
  title: string;
  /** Prix indicatif formaté (ex. "49,90 €") */
  price: string;
  /** Note moyenne sur 5 (ex. 4.8) */
  rating: number;
  /** Badge éditorial affiché en rouge velours */
  badge: ProductBadge;
  /** Courte description bénéfice client (1 à 2 lignes) */
  description: string;
  /** Chemin local ou URL de la photo produit (laisser vide pour le visuel de secours) */
  imageUrl: string;
  /** Lien affilié Amazon */
  amazonUrl: string;
}

/** Définition brute d'un rayon dans le catalogue local */
export interface CatalogAisleInput {
  /** Identifiant URL du rayon (?rayon=...) */
  slug: AisleSlug;
  /** Numéro d'ordre affiché sur l'enseigne */
  indexLabel: string;
  /** Titre complet du rayon */
  title: string;
  /** Libellé court dans la barre de navigation */
  shortLabel: string;
  /** Sous-titre éditorial affiché dans la Vue Catalogue 2D */
  subtitle: string;
  /** Chemin ou URL du décor panoramique 360° du rayon */
  panoramaUrl: string;
  /** Liste des produits exposés dans ce rayon */
  products: readonly CatalogProductInput[];
}

/** Emplacement calculé automatiquement dans l'alcôve 3D */
export interface ShelfSlot {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  rotationY?: number;
  tiltX?: number;
}

/** Produit enrichi automatiquement pour le rendu 3D et les fiches */
export interface ProductItem extends CatalogProductInput {
  id: string;
  aisleId: AisleSlug;
  isHero: boolean;
  shelfSlot: ShelfSlot;
}

/** Rayon enrichi prêt pour la scène 3D et le catalogue 2D */
export interface AisleConfig {
  id: AisleSlug;
  slug: AisleSlug;
  indexLabel: string;
  title: string;
  shortLabel: string;
  subtitle: string;
  panoramaUrl: string;
  products: readonly ProductItem[];
}

export const BRAND_NAME = 'Maison Hiveria';
export const SEASONAL_BANNER_LABEL = 'Collection Noël';

export const AMAZON_LEGAL_DISCLOSURE =
  'En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises.';

/** Décor panoramique hivernal alpin par défaut */
const DEFAULT_PANORAMA_URL = '/src/assets/images/pano_alpes_hiver_1795308790426.webp';

/**
 * ============================================================================
 * DONNÉES DES 5 RAYONS & PRODUITS (À PERSONNALISER ICI)
 * ============================================================================
 */
const RAW_CATALOG: readonly CatalogAisleInput[] = [
  {
    slug: 'sapins',
    indexLabel: '01',
    title: 'Sapins & Boules de Noël',
    shortLabel: 'Sapins',
    subtitle: 'Nordmann enneigés, verre soufflé bouche et parures or champagne.',
    panoramaUrl: DEFAULT_PANORAMA_URL,
    products: [
      {
        title: 'Sapin Nordmann Enneigé 180 cm sur Socle Bois',
        price: '169,00 €',
        rating: 4.9,
        badge: 'Best-seller',
        description:
          'Aiguilles réalistes au toucher souple avec givrage délicat et montage parapluie en cinq minutes.',
        imageUrl: '/src/assets/images/studio_sapin_boules_1795306671437.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=sapin+noel+enneige+180cm+luxe&tag=maisonhiveria-21',
      },
      {
        title: 'Coffret 24 Boules Verre Soufflé Or Champagne',
        price: '44,90 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Assortiment mat, brillant et strié qui capte chaque reflet de vos guirlandes sans alourdir les branches.',
        imageUrl: '/src/assets/images/prod_boules_champagne_1795308789084.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=boules+noel+verre+or+champagne&tag=maisonhiveria-21',
      },
      {
        title: 'Parure 18 Boules Velours Sapin & Laiton',
        price: '36,50 €',
        rating: 4.7,
        badge: 'Idée cadeau',
        description:
          'Finition veloutée vert forêt et attaches en laiton brossé pour une silhouette de sapin très couture.',
        imageUrl: '/src/assets/images/prod_boules_emeraude_1795308791363.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=boules+noel+velours+vert+sapin&tag=maisonhiveria-21',
      },
      {
        title: 'Trio de Boîtes Cadeaux Décoratives Ruban Satin',
        price: '49,90 €',
        rating: 4.8,
        badge: 'Idée cadeau',
        description:
          'Habille instantanément le pied du sapin avec un volume chaleureux en lin ivoire, velours bordeaux et rubans dorés.',
        imageUrl: '/src/assets/images/prod_cadeaux_satin_1795308790213.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=boites+cadeaux+decoratives+pied+sapin&tag=maisonhiveria-21',
      },
    ],
  },
  {
    slug: 'lumieres',
    indexLabel: '02',
    title: 'Guirlandes & Lumières Féeriques',
    shortLabel: 'Lumières',
    subtitle: 'Micro-LED 2700K blanc chaud, étoiles en laiton et lanternes alpines.',
    panoramaUrl: DEFAULT_PANORAMA_URL,
    products: [
      {
        title: 'Étoile Architecturale en Laiton & Verre LED 2700K',
        price: '54,90 €',
        rating: 4.9,
        badge: 'Coup de cœur',
        description:
          'Structure géométrique dorée diffusant un halo ambré apaisant avec minuterie automatique six heures.',
        imageUrl: '/src/assets/images/studio_lumieres_feeriques_1795306670300.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=etoile+lumineuse+laiton+verre+noel&tag=maisonhiveria-21',
      },
      {
        title: 'Guirlande Micro-LED Fil Laiton 20 m Blanc Chaud',
        price: '24,90 €',
        rating: 4.8,
        badge: 'Best-seller',
        description:
          'Fil ultra-fin quasi invisible de jour et huit modes d’intensité douce pour sublimer sapins et consoles.',
        imageUrl: '/src/assets/images/prod_guirlande_microled_1795308789553.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=guirlande+micro+led+fil+cuivre+blanc+chaud+20m&tag=maisonhiveria-21',
      },
      {
        title: 'Lanterne Chalet Laiton Vieilli & Bougie LED Vacillante',
        price: '62,00 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Verre biseauté et flamme réaliste sans fumée pour créer une lueur de foyer sur console ou rebord de fenêtre.',
        imageUrl: '/src/assets/images/prod_lanterne_chalet_1795308791976.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=lanterne+noel+laiton+verre+bougie+led&tag=maisonhiveria-21',
      },
      {
        title: 'Rideau Lumineux Cascade Étoilée 3x2 m Télécommandé',
        price: '29,90 €',
        rating: 4.7,
        badge: 'Best-seller',
        description:
          'Transforme instantanément une baie vitrée en ciel d’hiver féerique avec variateur d’intensité discret.',
        imageUrl: '/src/assets/images/prod_rideau_lumineux_1795308791611.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=rideau+lumineux+noel+blanc+chaud+telecommande&tag=maisonhiveria-21',
      },
    ],
  },
  {
    slug: 'table',
    indexLabel: '03',
    title: 'Arts de la Table & Réveillon',
    shortLabel: 'Table',
    subtitle: 'Chandeliers sculpturaux, cristal taillé et porcelainiers festifs.',
    panoramaUrl: DEFAULT_PANORAMA_URL,
    products: [
      {
        title: 'Chandelier 3 Branches Laiton Brossé & Bougies Cire',
        price: '78,00 €',
        rating: 4.9,
        badge: 'Coup de cœur',
        description:
          'Pièce maîtresse élancée au fini or satiné qui structure la table du réveillon sans masquer vos convives.',
        imageUrl: '/src/assets/images/studio_arts_table_1795306672903.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=chandelier+3+branches+laiton+dore+table+noel&tag=maisonhiveria-21',
      },
      {
        title: 'Assiettes de Présentation Porcelaine Filet Or (Lot de 6)',
        price: '89,00 €',
        rating: 4.8,
        badge: 'Best-seller',
        description:
          'Porcelaine fine ivoire soulignée d’un liseré doré artisanal pour dresser une table digne des grandes maisons.',
        imageUrl: '/src/assets/images/prod_assiettes_or_1795308791362.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=assiettes+presentation+porcelaine+filet+or&tag=maisonhiveria-21',
      },
      {
        title: 'Seau à Champagne Laiton Martelé Double Paroi',
        price: '69,90 €',
        rating: 4.9,
        badge: 'Idée cadeau',
        description:
          'Conserve vos cuvées à température idéale sans condensation sur la nappe grâce à sa paroi isotherme.',
        imageUrl: '/src/assets/images/prod_seau_champagne_1795308791730.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=seau+a+champagne+dore+martele+isotherme&tag=maisonhiveria-21',
      },
      {
        title: 'Coffret 6 Flûtes en Cristal Taillé Main & Ronds Dorés',
        price: '64,00 €',
        rating: 4.8,
        badge: 'Best-seller',
        description:
          'Facettes lumineuses d’une grande finesse acoustique qui subliment l’effervescence des toasts de fête.',
        imageUrl: '/src/assets/images/prod_flutes_cristal_1795308790884.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=flutes+champagne+cristal+taille+coffret&tag=maisonhiveria-21',
      },
    ],
  },
  {
    slug: 'couronnes',
    indexLabel: '04',
    title: "Couronnes & Décoration d'Entrée",
    shortLabel: 'Couronnes',
    subtitle: 'Couronnes d’accueil artisanales, nœuds velours et cloches alpines.',
    panoramaUrl: DEFAULT_PANORAMA_URL,
    products: [
      {
        title: 'Couronne de Porte Alpine 55 cm & Nœud Velours Champagne',
        price: '68,00 €',
        rating: 4.9,
        badge: 'Best-seller',
        description:
          'Feuillage dense pin, eucalyptus et pommes de pin dorées pour une entrée majestueuse dès le pas de la porte.',
        imageUrl: '/src/assets/images/studio_couronne_entree_1795306671470.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=couronne+porte+noel+eucalyptus+noeud+velours&tag=maisonhiveria-21',
      },
      {
        title: 'Trio de Cloches Alpines en Laiton Patiné sur Corde',
        price: '42,50 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Tintement doux et patine authentique à suspendre sur une porte en bois ou le long d’une rampe d’escalier.',
        imageUrl: '/src/assets/images/prod_cloches_laiton_1795308792290.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=cloches+noel+laiton+vintage+corde&tag=maisonhiveria-21',
      },
      {
        title: 'Guirlande de Cheminée & Linteau Cèdre Givré 180 cm',
        price: '56,90 €',
        rating: 4.8,
        badge: 'Best-seller',
        description:
          'Tige flexible à mémoire de forme qui épouse encadrements de portes et manteaux de cheminée en toute élégance.',
        imageUrl: '/src/assets/images/prod_guirlande_cheminee_1795308791189.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=guirlande+sapin+cedre+cheminee+noel+180cm&tag=maisonhiveria-21',
      },
      {
        title: 'Lanterne d’Accueil Extérieure Bronze Doré IP44',
        price: '74,00 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Résiste au givre et accueille vos invités d’une lumière dorée automatique dès la tombée de la nuit.',
        imageUrl: '/src/assets/images/prod_lanterne_perron_1795308790527.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=lanterne+exterieure+noel+led+bronze+dore&tag=maisonhiveria-21',
      },
    ],
  },
  {
    slug: 'village',
    indexLabel: '05',
    title: 'Villages de Noël & Objets Déco',
    shortLabel: 'Villages',
    subtitle: 'Chalets lumineux en céramique, boules à neige et automates poétiques.',
    panoramaUrl: DEFAULT_PANORAMA_URL,
    products: [
      {
        title: 'Chalet Alpin Illuminé en Céramique & Bois Sculpté',
        price: '79,90 €',
        rating: 4.9,
        badge: 'Best-seller',
        description:
          'Façades finement peintes à la main, toits enneigés et fenêtres ambrées LED pour animer un rebord ou une bibliothèque.',
        imageUrl: '/src/assets/images/studio_village_noel_1795306672311.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=village+noel+chalet+lumineux+ceramique+bois&tag=maisonhiveria-21',
      },
      {
        title: 'Boule à Neige Musicale Chalet d’Or sur Socle Noyer',
        price: '48,00 €',
        rating: 4.9,
        badge: 'Coup de cœur',
        description:
          'Globe en verre épais à mécanisme mécanique traditionnel diffusant une mélodie d’hiver sans pile.',
        imageUrl: '/src/assets/images/prod_boule_neige_1795308791733.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=boule+a+neige+musicale+noel+socle+bois+luxe&tag=maisonhiveria-21',
      },
      {
        title: 'Casse-Noisette de Collection Bois Laqué Or & Velours',
        price: '54,00 €',
        rating: 4.8,
        badge: 'Idée cadeau',
        description:
          'Silhouetté à la main en bois noble avec dorures satinées pour apporter une signature patrimoniale à votre décor.',
        imageUrl: '/src/assets/images/prod_casse_noisette_1795308792483.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=casse+noisette+bois+noel+or+velours+38cm&tag=maisonhiveria-21',
      },
      {
        title: 'Carrousel Musical de Noël Ivoire & Laiton Animé',
        price: '66,50 €',
        rating: 4.8,
        badge: 'Idée cadeau',
        description:
          'Manège miniature rotatif aux reflets dorés qui captive petits et grands dès la mise en lumière.',
        imageUrl: '/src/assets/images/prod_carrousel_dore_1795308790884.webp',
        amazonUrl:
          'https://www.amazon.fr/s?k=carrousel+musical+noel+lumineux+dore&tag=maisonhiveria-21',
      },
    ],
  },
];

/**
 * ============================================================================
 * PLACEMENT AUTOMATIQUE ET HARMONIEUX DES VITRINES & HOTSPOTS 3D
 * ============================================================================
 * Calcule automatiquement la position 3D dans l'alcôve selon le nombre de
 * produits présents dans le rayon (de 1 à N produits), sans aucune saisie
 * manuelle de coordonnées.
 */
function computeAutomaticShelfSlot(index: number, totalCount: number): ShelfSlot {
  // Pièce maîtresse (index 0) toujours mise en majesté sur le socle central
  if (index === 0) {
    return {
      x: 0,
      y: 0.74,
      z: 0.88,
      width: 1.2,
      height: 0.9,
      rotationY: 0,
      tiltX: -0.07,
    };
  }

  // Disposition en triangle d'or exacte pour 4 produits (configuration classique)
  if (totalCount === 4) {
    const goldenTriangleSlots: readonly ShelfSlot[] = [
      {
        x: -1.62,
        y: 1.54,
        z: -0.78,
        width: 1.24,
        height: 0.93,
        rotationY: 0.16,
        tiltX: -0.03,
      },
      {
        x: 0,
        y: 1.84,
        z: -0.94,
        width: 1.26,
        height: 0.945,
        rotationY: 0,
        tiltX: 0.02,
      },
      {
        x: 1.62,
        y: 1.54,
        z: -0.78,
        width: 1.24,
        height: 0.93,
        rotationY: -0.16,
        tiltX: -0.03,
      },
    ];
    return goldenTriangleSlots[index - 1];
  }

  // Répartition harmonieuse automatique pour 2, 3, 5, 6+ produits sur les étagères
  const galleryIndex = index - 1;
  const galleryCount = Math.max(1, totalCount - 1);

  if (galleryCount <= 3) {
    const span = galleryCount === 1 ? 0 : galleryCount === 2 ? 2.8 : 3.24;
    const t = galleryCount === 1 ? 0.5 : galleryIndex / (galleryCount - 1);
    const x = (t - 0.5) * span;
    const isCenter = Math.abs(x) < 0.15;
    return {
      x: Number(x.toFixed(3)),
      y: isCenter ? 1.84 : 1.54,
      z: isCenter ? -0.94 : -0.78,
      width: 1.22,
      height: 0.915,
      rotationY: Number((-x * 0.1).toFixed(3)),
      tiltX: isCenter ? 0.02 : -0.03,
    };
  }

  // Pour 5 produits ou plus : répartition fluide sur deux niveaux (crédence + mezzanine)
  const lowerCount = Math.ceil(galleryCount / 2);
  const upperCount = galleryCount - lowerCount;
  const isLower = galleryIndex < lowerCount;
  const rowIndex = isLower ? galleryIndex : galleryIndex - lowerCount;
  const rowTotal = isLower ? lowerCount : upperCount;

  const maxSpan = isLower ? 3.8 : 3.2;
  const t = rowTotal === 1 ? 0.5 : rowIndex / (rowTotal - 1);
  const x = (t - 0.5) * maxSpan;
  const width = Math.max(0.86, Math.min(1.16, 4.1 / Math.max(rowTotal, 2)));
  const height = Number((width * 0.75).toFixed(3));

  return {
    x: Number(x.toFixed(3)),
    y: isLower ? 1.54 : 2.38,
    z: isLower ? -0.76 : -0.96,
    width: Number(width.toFixed(3)),
    height,
    rotationY: Number((-x * 0.09).toFixed(3)),
    tiltX: isLower ? -0.03 : 0.03,
  };
}

/** Catalogue complet prêt à l'emploi avec placement automatique des vitrines et hotspots */
export const CATALOG: readonly AisleConfig[] = RAW_CATALOG.map((aisle) => {
  const total = aisle.products.length;
  return {
    id: aisle.slug,
    slug: aisle.slug,
    indexLabel: aisle.indexLabel,
    title: aisle.title,
    shortLabel: aisle.shortLabel,
    subtitle: aisle.subtitle,
    panoramaUrl: aisle.panoramaUrl,
    products: aisle.products.map((product, idx) => ({
      ...product,
      id: `${aisle.slug}-${idx + 1}`,
      aisleId: aisle.slug,
      isHero: idx === 0,
      shelfSlot: computeAutomaticShelfSlot(idx, total),
    })),
  };
});

export const VALID_AISLE_SLUGS: readonly AisleSlug[] = CATALOG.map((a) => a.slug);

export function isValidAisleSlug(value: string | null | undefined): value is AisleSlug {
  if (!value) return false;
  return (VALID_AISLE_SLUGS as readonly string[]).includes(value.toLowerCase());
}

/**
 * Lit le rayon initial depuis ?rayon=<slug> ou #rayon-<slug> au chargement.
 * Retourne 'sapins' par défaut si aucun paramètre valide n'est présent.
 */
export function getInitialAisleSlugFromUrl(): AisleSlug {
  if (typeof window === 'undefined') return 'sapins';

  const params = new URLSearchParams(window.location.search);
  const queryRayon = params.get('rayon')?.trim().toLowerCase();
  if (isValidAisleSlug(queryRayon)) {
    return queryRayon;
  }

  const hash = window.location.hash.replace(/^#/, '').trim().toLowerCase();
  if (hash.startsWith('rayon-')) {
    const hashSlug = hash.slice('rayon-'.length);
    if (isValidAisleSlug(hashSlug)) {
      return hashSlug;
    }
  } else if (hash.startsWith('rayon=')) {
    const hashSlug = hash.slice('rayon='.length);
    if (isValidAisleSlug(hashSlug)) {
      return hashSlug;
    }
  } else if (isValidAisleSlug(hash)) {
    return hash;
  }

  return 'sapins';
}

/** Met à jour l'URL sans rechargement via history.replaceState */
export function updateUrlForAisle(slug: AisleSlug): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('rayon', slug);
  if (url.hash.startsWith('#rayon')) {
    url.hash = '';
  }
  window.history.replaceState({ rayon: slug }, '', url.toString());
}

/** Construit le lien partageable d'un rayon (?rayon=...) */
export function buildAisleShareUrl(slug: AisleSlug): string {
  if (typeof window === 'undefined') return `?rayon=${slug}`;
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('rayon', slug);
  url.hash = '';
  return url.toString();
}

export function getAisleBySlug(slug: AisleSlug): AisleConfig {
  return CATALOG.find((a) => a.slug === slug) ?? CATALOG[0];
}

export function getProductById(productId: string | null): ProductItem | null {
  if (!productId) return null;
  for (const aisle of CATALOG) {
    const found = aisle.products.find((p) => p.id === productId);
    if (found) return found;
  }
  return null;
}
