/**
 * ============================================================================
 * CATALOGUE LOCAL — MAISON HIVERIA (8 RAYONS DE NOËL)
 * ============================================================================
 * Modifiez librement les produits ci-dessous :
 *  - Pour ajouter un produit dans un rayon, ajoutez simplement un objet avec :
 *    title, price, rating, badge, description, imageUrl, amazonUrl
 *    (et en option `cutoutUrl` pour un objet détouré transparent posé en 3D).
 *  - Les objets détourés et les hotspots lumineux se placent automatiquement et
 *    harmonieusement sur les tables et étagères selon le nombre de produits.
 *  - Pour personnaliser le décor 360° d'un rayon, modifiez son `panoramaUrl`.
 *
 * URLs directes par rayon :
 *  - ?rayon=sapins     (ou #rayon-sapins)
 *  - ?rayon=lumieres   (ou #rayon-lumieres)
 *  - ?rayon=table      (ou #rayon-table)
 *  - ?rayon=couronnes  (ou #rayon-couronnes)
 *  - ?rayon=village    (ou #rayon-village)
 *  - ?rayon=bougies    (ou #rayon-bougies)
 *  - ?rayon=textiles   (ou #rayon-textiles)
 *  - ?rayon=cadeaux    (ou #rayon-cadeaux)
 * ============================================================================
 */

export type AisleSlug =
  | 'sapins'
  | 'lumieres'
  | 'table'
  | 'couronnes'
  | 'village'
  | 'bougies'
  | 'textiles'
  | 'cadeaux';

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
  /** Photo studio éditoriale affichée dans la fiche produit et le catalogue 2D */
  imageUrl: string;
  /** Optionnel : visuel détouré transparent (WebP/PNG) posé directement sur les tables 3D */
  cutoutUrl?: string;
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

/** Emplacement calculé automatiquement sur les tables et étagères 3D */
export interface ShelfSlot {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  rotationY?: number;
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

/** Lien officiel vers la boutique / liste Amazon de Noël */
export const AMAZON_STORE_URL =
  'https://www.amazon.fr/hz/wishlist/ls/38CYLEWXEVK2Y?ref_=wl_share';

export const AMAZON_LEGAL_DISCLOSURE =
  'En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises.';

/** Décor panoramique hivernal alpin par défaut */
const DEFAULT_PANORAMA_URL = '/src/assets/images/pano_alpes_hiver_1795308790426.webp';

/**
 * ============================================================================
 * DONNÉES DES 8 RAYONS & PRODUITS (À PERSONNALISER ICI)
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
        cutoutUrl: '/src/assets/images/cutout_sapin_nordmann_1795382817568.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Coffret 24 Boules Verre Soufflé Or Champagne',
        price: '44,90 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Assortiment mat, brillant et strié qui capte chaque reflet de vos guirlandes sans alourdir les branches.',
        imageUrl: '/src/assets/images/prod_boules_champagne_1795308789084.webp',
        cutoutUrl: '/src/assets/images/cutout_boules_champagne_1795382817150.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Parure 18 Boules Velours Sapin & Laiton',
        price: '36,50 €',
        rating: 4.7,
        badge: 'Idée cadeau',
        description:
          'Finition veloutée vert forêt et attaches en laiton brossé pour une silhouette de sapin très couture.',
        imageUrl: '/src/assets/images/prod_boules_emeraude_1795308791363.webp',
        cutoutUrl: '/src/assets/images/cutout_boules_emeraude_1795382816979.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Trio de Boîtes Cadeaux Décoratives Ruban Satin',
        price: '49,90 €',
        rating: 4.8,
        badge: 'Idée cadeau',
        description:
          'Habille instantanément le pied du sapin avec un volume chaleureux en lin ivoire, velours bordeaux et rubans dorés.',
        imageUrl: '/src/assets/images/prod_cadeaux_satin_1795308790213.webp',
        cutoutUrl: '/src/assets/images/cutout_cadeaux_satin_1795382817759.webp',
        amazonUrl: AMAZON_STORE_URL,
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
        cutoutUrl: '/src/assets/images/cutout_etoile_laiton_1795382817644.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Guirlande Micro-LED Fil Laiton 20 m Blanc Chaud',
        price: '24,90 €',
        rating: 4.8,
        badge: 'Best-seller',
        description:
          'Fil ultra-fin quasi invisible de jour et huit modes d’intensité douce pour sublimer sapins et consoles.',
        imageUrl: '/src/assets/images/prod_guirlande_microled_1795308789553.webp',
        cutoutUrl: '/src/assets/images/cutout_guirlande_microled_1795383086108.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Lanterne Chalet Laiton Vieilli & Bougie LED Vacillante',
        price: '62,00 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Verre biseauté et flamme réaliste sans fumée pour créer une lueur de foyer sur console ou rebord de fenêtre.',
        imageUrl: '/src/assets/images/prod_lanterne_chalet_1795308791976.webp',
        cutoutUrl: '/src/assets/images/cutout_lanterne_chalet_1795383086516.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Rideau Lumineux Cascade Étoilée 3x2 m Télécommandé',
        price: '29,90 €',
        rating: 4.7,
        badge: 'Best-seller',
        description:
          'Transforme instantanément une baie vitrée en ciel d’hiver féerique avec variateur d’intensité discret.',
        imageUrl: '/src/assets/images/prod_rideau_lumineux_1795308791611.webp',
        cutoutUrl: '/src/assets/images/cutout_rideau_lumineux_1795383087410.webp',
        amazonUrl: AMAZON_STORE_URL,
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
        cutoutUrl: '/src/assets/images/cutout_chandelier_laiton_1795383085963.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Assiettes de Présentation Porcelaine Filet Or (Lot de 6)',
        price: '89,00 €',
        rating: 4.8,
        badge: 'Best-seller',
        description:
          'Porcelaine fine ivoire soulignée d’un liseré doré artisanal pour dresser une table digne des grandes maisons.',
        imageUrl: '/src/assets/images/prod_assiettes_or_1795308791362.webp',
        cutoutUrl: '/src/assets/images/cutout_assiettes_or_1795383085897.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Seau à Champagne Laiton Martelé Double Paroi',
        price: '69,90 €',
        rating: 4.9,
        badge: 'Idée cadeau',
        description:
          'Conserve vos cuvées à température idéale sans condensation sur la nappe grâce à sa paroi isotherme.',
        imageUrl: '/src/assets/images/prod_seau_champagne_1795308791730.webp',
        cutoutUrl: '/src/assets/images/cutout_seau_champagne_1795383185831.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Coffret 6 Flûtes en Cristal Taillé Main & Ronds Dorés',
        price: '64,00 €',
        rating: 4.8,
        badge: 'Best-seller',
        description:
          'Facettes lumineuses d’une grande finesse acoustique qui subliment l’effervescence des toasts de fête.',
        imageUrl: '/src/assets/images/prod_flutes_cristal_1795308790884.webp',
        cutoutUrl: '/src/assets/images/cutout_flutes_cristal_1795383186373.webp',
        amazonUrl: AMAZON_STORE_URL,
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
        cutoutUrl: '/src/assets/images/cutout_couronne_alpine_1795383184955.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Trio de Cloches Alpines en Laiton Patiné sur Corde',
        price: '42,50 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Tintement doux et patine authentique à suspendre sur une porte en bois ou le long d’une rampe d’escalier.',
        imageUrl: '/src/assets/images/prod_cloches_laiton_1795308792290.webp',
        cutoutUrl: '/src/assets/images/cutout_cloches_laiton_1795383183664.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Guirlande de Cheminée & Linteau Cèdre Givré 180 cm',
        price: '56,90 €',
        rating: 4.8,
        badge: 'Best-seller',
        description:
          'Tige flexible à mémoire de forme qui épouse encadrements de portes et manteaux de cheminée en toute élégance.',
        imageUrl: '/src/assets/images/prod_guirlande_cheminee_1795308791189.webp',
        cutoutUrl: '/src/assets/images/cutout_guirlande_cheminee_1795383186212.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Lanterne d’Accueil Extérieure Bronze Doré IP44',
        price: '74,00 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Résiste au givre et accueille vos invités d’une lumière dorée automatique dès la tombée de la nuit.',
        imageUrl: '/src/assets/images/prod_lanterne_perron_1795308790527.webp',
        cutoutUrl: '/src/assets/images/cutout_lanterne_perron_1795383264325.webp',
        amazonUrl: AMAZON_STORE_URL,
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
        cutoutUrl: '/src/assets/images/cutout_chalet_alpin_1795383265579.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Boule à Neige Musicale Chalet d’Or sur Socle Noyer',
        price: '48,00 €',
        rating: 4.9,
        badge: 'Coup de cœur',
        description:
          'Globe en verre épais à mécanisme mécanique traditionnel diffusant une mélodie d’hiver sans pile.',
        imageUrl: '/src/assets/images/prod_boule_neige_1795308791733.webp',
        cutoutUrl: '/src/assets/images/cutout_boule_neige_1795383263809.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Casse-Noisette de Collection Bois Laqué Or & Velours',
        price: '54,00 €',
        rating: 4.8,
        badge: 'Idée cadeau',
        description:
          'Silhouetté à la main en bois noble avec dorures satinées pour apporter une signature patrimoniale à votre décor.',
        imageUrl: '/src/assets/images/prod_casse_noisette_1795308792483.webp',
        cutoutUrl: '/src/assets/images/cutout_casse_noisette_1795383264324.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Carrousel Musical de Noël Ivoire & Laiton Animé',
        price: '66,50 €',
        rating: 4.8,
        badge: 'Idée cadeau',
        description:
          'Manège miniature rotatif aux reflets dorés qui captive petits et grands dès la mise en lumière.',
        imageUrl: '/src/assets/images/prod_carrousel_dore_1795308790884.webp',
        cutoutUrl: '/src/assets/images/cutout_carrousel_dore_1795383263915.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
    ],
  },
  {
    slug: 'bougies',
    indexLabel: '06',
    title: "Bougies & Parfums d'Hiver",
    shortLabel: 'Bougies',
    subtitle: 'Senteurs sapin de Noël, ambre épicé, cloches en verre et photophores dorés.',
    panoramaUrl: DEFAULT_PANORAMA_URL,
    products: [
      {
        title: 'Bougie Parfumée Sapin & Cèdre sous Cloche Verre & Laiton',
        price: '46,90 €',
        rating: 4.9,
        badge: 'Best-seller',
        description:
          'Verre cannelé vert forêt protégé par sa cloche soufflée bouche pour préserver les notes boisées entre chaque allumage.',
        imageUrl: '/src/assets/images/prod_bougie_cloche_1795384996566.webp',
        cutoutUrl: '/src/assets/images/cutout_bougie_cloche_1795384763993.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Diffuseur à Bâtonnets Ambre, Cannelle & Orange Confite',
        price: '38,50 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Flacon apothicaire en verre ambré facetté et tiges de rotin noir diffusant un parfum d’hiver continu durant trois mois.',
        imageUrl: '/src/assets/images/prod_diffuseur_ambre_1795384994781.webp',
        cutoutUrl: '/src/assets/images/cutout_diffuseur_ambre_1795384763752.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Coffret 3 Bougies de Noël Laiton Martelé & Cire de Soja',
        price: '54,00 €',
        rating: 4.9,
        badge: 'Idée cadeau',
        description:
          'Écrin velours vert sapin réunissant trois senteurs hivernales coulées à la main dans des pots dorés réutilisables.',
        imageUrl: '/src/assets/images/prod_coffret_bougies_1795384996678.webp',
        cutoutUrl: '/src/assets/images/cutout_coffret_bougies_1795384762624.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Photophore Étoilé en Verre Mercure Doré & Laiton',
        price: '32,90 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Verre vieilli gravé d’étoiles fines qui projette une constellation dorée chaleureuse sur vos consoles et buffets.',
        imageUrl: '/src/assets/images/prod_photophore_mercure_1795384995907.webp',
        cutoutUrl: '/src/assets/images/cutout_photophore_mercure_1795384763754.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
    ],
  },
  {
    slug: 'textiles',
    indexLabel: '07',
    title: 'Plaids, Coussins & Cocooning',
    shortLabel: 'Cocooning',
    subtitle: 'Fausse fourrure neige polaire, velours bordeaux et mailles d’hiver.',
    panoramaUrl: DEFAULT_PANORAMA_URL,
    products: [
      {
        title: 'Plaid Fausse Fourrure Neige Polaire Doublé Velours 150×200 cm',
        price: '69,00 €',
        rating: 4.9,
        badge: 'Best-seller',
        description:
          'Toucher nuage ultra-doux blanc neige et envers velours ivoire pour réchauffer instantanément canapé ou bout de lit.',
        imageUrl: '/src/assets/images/prod_plaid_fourrure_1795384995793.webp',
        cutoutUrl: '/src/assets/images/cutout_plaid_fourrure_1795384760663.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Duo de Coussins Velours Bordeaux & Passepoil Or Champagne',
        price: '44,90 €',
        rating: 4.8,
        badge: 'Coup de cœur',
        description:
          'Velours matelassé profond souligné d’un biais satiné doré pour signer un salon festif chic et intemporel.',
        imageUrl: '/src/assets/images/prod_coussins_bordeaux_1795384997089.webp',
        cutoutUrl: '/src/assets/images/cutout_coussins_bordeaux_1795384762987.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Chaussettes de Noël Tricot Torsadé Ivoire & Fourrure (Lot de 3)',
        price: '34,50 €',
        rating: 4.8,
        badge: 'Best-seller',
        description:
          'Grosse maille crème et revers pelucheux blanc neige à suspendre au manteau de cheminée ou le long de l’escalier.',
        imageUrl: '/src/assets/images/prod_chaussettes_tricot_1795385107446.webp',
        cutoutUrl: '/src/assets/images/cutout_chaussettes_tricot_1795384840783.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Jupe de Sapin Fausse Fourrure Neige & Flocons Brodés Or',
        price: '42,00 €',
        rating: 4.7,
        badge: 'Idée cadeau',
        description:
          'Dissimule avec élégance le pied du sapin sous un manteau immaculé brodé de flocons champagne lumineux.',
        imageUrl: '/src/assets/images/prod_jupe_sapin_1795385108803.webp',
        cutoutUrl: '/src/assets/images/cutout_jupe_sapin_1795384841143.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
    ],
  },
  {
    slug: 'cadeaux',
    indexLabel: '08',
    title: 'Calendriers & Coffrets Cadeaux',
    shortLabel: 'Cadeaux',
    subtitle: 'Calendriers de l’Avent en bois, pauses gourmandes et art d’offrir.',
    panoramaUrl: DEFAULT_PANORAMA_URL,
    products: [
      {
        title: 'Calendrier de l’Avent Chalet Bois Sculpté LED 24 Tiroirs',
        price: '74,90 €',
        rating: 4.9,
        badge: 'Best-seller',
        description:
          'Maison alpine réutilisable en noyer et bois crème aux tiroirs numérotés dorés, illuminée par des LED blanc chaud.',
        imageUrl: '/src/assets/images/prod_calendrier_avent_1795385110050.webp',
        cutoutUrl: '/src/assets/images/cutout_calendrier_avent_1795384839419.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Coffret Dégustation Thés & Épices de Noël Boîte Or & Sapin',
        price: '39,90 €',
        rating: 4.8,
        badge: 'Idée cadeau',
        description:
          'Quatre mélanges d’hiver aux agrumes, cannelle et vanille présentés avec une passoire dorée dans un écrin satin.',
        imageUrl: '/src/assets/images/prod_coffret_thes_1795385108503.webp',
        cutoutUrl: '/src/assets/images/cutout_coffret_thes_1795384835127.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Service à Chocolat Chaud Céramique Ivoire & Filet Or',
        price: '52,00 €',
        rating: 4.9,
        badge: 'Coup de cœur',
        description:
          'Chocolatière cannelée et duo de tasses bordées d’or pour savourer vos goûters d’hiver au coin du feu.',
        imageUrl: '/src/assets/images/prod_service_chocolat_1795385110585.webp',
        cutoutUrl: '/src/assets/images/cutout_service_chocolat_1795384840125.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
      {
        title: 'Coffret Emballage Cadeau Luxe Rubans Velours & Sceaux Cire',
        price: '29,90 €',
        rating: 4.8,
        badge: 'Idée cadeau',
        description:
          'Bobines velours bordeaux et vert sapin, étiquettes dorées, ciseaux laiton et tampon à cire pour des paquets couture.',
        imageUrl: '/src/assets/images/prod_set_emballage_1795385119224.webp',
        cutoutUrl: '/src/assets/images/cutout_set_emballage_1795384843581.webp',
        amazonUrl: AMAZON_STORE_URL,
      },
    ],
  },
];

/**
 * ============================================================================
 * PLACEMENT AUTOMATIQUE ET HARMONIEUX DES OBJETS DÉTOURÉS & HOTSPOTS 3D
 * ============================================================================
 * Calcule automatiquement la position 3D sur la table centrale et les étagères
 * de l'alcôve selon le nombre de produits présents dans le rayon (de 1 à N).
 */
function computeAutomaticShelfSlot(index: number, totalCount: number): ShelfSlot {
  // Pièce maîtresse (index 0) posée directement sur le socle / table centrale
  if (index === 0) {
    return {
      x: 0,
      y: 0.74,
      z: 0.88,
      width: 1.2,
      height: 1.24,
      rotationY: 0,
    };
  }

  // Disposition équilibrée en triangle d'or sur les étagères pour 4 produits
  if (totalCount === 4) {
    const goldenTriangleSlots: readonly ShelfSlot[] = [
      {
        x: -1.62,
        y: 1.54,
        z: -0.78,
        width: 1.26,
        height: 1.06,
        rotationY: 0.14,
      },
      {
        x: 0,
        y: 1.84,
        z: -0.96,
        width: 1.32,
        height: 1.08,
        rotationY: 0,
      },
      {
        x: 1.62,
        y: 1.54,
        z: -0.78,
        width: 1.26,
        height: 1.06,
        rotationY: -0.14,
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
      z: isCenter ? -0.96 : -0.78,
      width: 1.24,
      height: 1.04,
      rotationY: Number((-x * 0.09).toFixed(3)),
    };
  }

  const lowerCount = Math.ceil(galleryCount / 2);
  const upperCount = galleryCount - lowerCount;
  const isLower = galleryIndex < lowerCount;
  const rowIndex = isLower ? galleryIndex : galleryIndex - lowerCount;
  const rowTotal = isLower ? lowerCount : upperCount;

  const maxSpan = isLower ? 3.8 : 3.2;
  const t = rowTotal === 1 ? 0.5 : rowIndex / (rowTotal - 1);
  const x = (t - 0.5) * maxSpan;
  const width = Math.max(0.86, Math.min(1.18, 4.1 / Math.max(rowTotal, 2)));

  return {
    x: Number(x.toFixed(3)),
    y: isLower ? 1.54 : 2.38,
    z: isLower ? -0.76 : -0.96,
    width: Number(width.toFixed(3)),
    height: Number((width * 0.92).toFixed(3)),
    rotationY: Number((-x * 0.08).toFixed(3)),
  };
}

/** Catalogue complet prêt à l'emploi avec placement automatique sur les tables 3D */
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
