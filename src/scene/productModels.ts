import * as THREE from 'three';
import type { ProductItem } from '../catalog';

export interface BuiltProductAsset {
  group: THREE.Group;
  /** The 2.5D cutout mesh (rotates subtly toward camera on Y axis for realistic depth) */
  facingPivot: THREE.Group;
  collider: THREE.Mesh;
  /** Local anchor offset above plinth/shelf for hotspot & focus camera */
  hotspotLocalOffset: THREE.Vector3;
  /** Loads the transparent cutout / product texture on demand (idempotent) */
  loadTexture: () => void;
  /** Disposables owned specifically by this product showcase */
  ownDisposables: Array<{ dispose: () => void }>;
}

export interface SharedProductMaterials {
  brushedGold: THREE.MeshPhysicalMaterial;
  matteWalnut: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
}

/**
 * Creates a soft elliptical contact shadow texture placed directly under each
 * cutout product so it appears physically grounded on the wooden tables & shelves.
 */
function createGroundContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 14, 128, 128, 124);
  grad.addColorStop(0, 'rgba(4, 10, 8, 0.78)');
  grad.addColorStop(0.45, 'rgba(4, 10, 8, 0.44)');
  grad.addColorStop(0.78, 'rgba(4, 10, 8, 0.14)');
  grad.addColorStop(1, 'rgba(4, 10, 8, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Shared PBR material pool across all 20 showroom products to keep 60 FPS on Android.
 */
export function createSharedProductMaterials(isSoftwareGl: boolean): SharedProductMaterials {
  const brushedGold = new THREE.MeshPhysicalMaterial({
    color: 0xe5b85b,
    metalness: 0.9,
    roughness: 0.24,
    clearcoat: 0.3,
    anisotropy: isSoftwareGl ? 0 : 0.65,
    envMapIntensity: 1.25,
  });

  const matteWalnut = new THREE.MeshStandardMaterial({
    color: 0x362217,
    metalness: 0.04,
    roughness: 0.76,
  });

  const shadowTex = createGroundContactShadowTexture();
  const contactShadow = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });

  return {
    brushedGold,
    matteWalnut,
    contactShadow,
  };
}

/**
 * Creates a discreet luxury boutique tent-card price plaque resting on the table
 * in front of each product (spruce green, velvet crimson badge, champagne gold price).
 */
function createPlaqueTexture(
  price: string,
  badge: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0B2B22';
  ctx.fillRect(0, 0, 512, 96);

  ctx.strokeStyle = 'rgba(229, 184, 91, 0.85)';
  ctx.lineWidth = 3;
  ctx.strokeRect(5, 5, 502, 86);

  ctx.fillStyle = '#9B1B26';
  ctx.fillRect(16, 20, 232, 56);

  ctx.fillStyle = '#FFF9F0';
  ctx.font = '600 21px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge.toUpperCase(), 132, 48);

  ctx.fillStyle = '#E5B85B';
  ctx.font = '600 32px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(price, 484, 48);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Subtle transparent placeholder silhouette shown for a split second while a
 * product cutout texture streams in.
 */
function createLoadingPlaceholderTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  const grad = ctx.createRadialGradient(64, 72, 6, 64, 72, 48);
  grad.addColorStop(0, 'rgba(229, 184, 91, 0.22)');
  grad.addColorStop(1, 'rgba(229, 184, 91, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Builds a frameless 2.5D photorealistic product cutout resting directly on the
 * wooden tables, shelves, and central plinth of the 3D Christmas chalet:
 * - Transparent RGBA WebP cutout bottom-aligned flush with y = 0
 * - Auto-fitted to each cutout's real aspect ratio on load
 * - Soft contact shadow underneath on the timber surface
 * - Miniature museum brass price tent-card in front of the base
 * - Subtle camera-facing pivot so the object retains realistic presence as you orbit
 */
export function buildProductShowcase(
  product: ProductItem,
  mats: SharedProductMaterials,
  textureLoader: THREE.TextureLoader,
  maxAnisotropy: number
): BuiltProductAsset {
  const group = new THREE.Group();
  group.name = `product_${product.id}`;
  const ownDisposables: Array<{ dispose: () => void }> = [];

  const track = <T extends { dispose: () => void }>(item: T): T => {
    ownDisposables.push(item);
    return item;
  };

  const { width: maxSlotW, height: maxSlotH } = product.shelfSlot;
  const isHero = product.isHero;
  const visualSourceUrl = product.cutoutUrl || product.imageUrl;

  // Target display box inside the shelf/plinth slot (generous presence, realistic scale)
  const targetMaxW = isHero ? 1.18 : maxSlotW * 0.96;
  const targetMaxH = isHero ? 1.24 : maxSlotH * 1.06;

  // 1. Soft grounded contact shadow resting directly on the wood surface (y = 0.004)
  const shadowGeo = track(new THREE.PlaneGeometry(1, 1));
  const contactShadowMesh = new THREE.Mesh(shadowGeo, mats.contactShadow);
  contactShadowMesh.rotation.x = -Math.PI / 2;
  contactShadowMesh.position.set(0, 0.005, 0.02);
  contactShadowMesh.scale.set(targetMaxW * 0.84, isHero ? 0.62 : 0.46, 1);
  contactShadowMesh.renderOrder = 1;
  group.add(contactShadowMesh);

  // 2. Camera-facing pivot holding the frameless 2.5D cutout plane
  const facingPivot = new THREE.Group();
  group.add(facingPivot);

  const placeholderTex = track(createLoadingPlaceholderTexture());
  const cutoutMat = track(
    new THREE.MeshStandardMaterial({
      map: placeholderTex,
      emissiveMap: placeholderTex,
      emissive: new THREE.Color(0xfff5e4),
      emissiveIntensity: 0.62,
      roughness: 0.62,
      metalness: 0.04,
      transparent: true,
      alphaTest: 0.015,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );

  // Unit 1x1 plane scaled dynamically to the cutout's true cropped aspect ratio
  const cutoutGeo = track(new THREE.PlaneGeometry(1, 1));
  const cutoutMesh = new THREE.Mesh(cutoutGeo, cutoutMat);
  const initialW = targetMaxW * 0.78;
  const initialH = targetMaxH * 0.88;
  cutoutMesh.scale.set(initialW, initialH, 1);
  cutoutMesh.position.set(0, initialH * 0.5, 0);
  // Hero front cutout always renders cleanly above rear shelf cutouts
  cutoutMesh.renderOrder = isHero ? 4 : 2;
  facingPivot.add(cutoutMesh);

  // 3. Discreet luxury engraved brass & spruce price tent-card resting on the table
  const plaqueTex = track(createPlaqueTexture(product.price, product.badge, maxAnisotropy));
  const plaqueMat = track(
    new THREE.MeshStandardMaterial({
      map: plaqueTex,
      emissiveMap: plaqueTex,
      emissive: new THREE.Color(0xfff1d4),
      emissiveIntensity: 0.34,
      roughness: 0.34,
      metalness: 0.16,
    })
  );
  const plaqueW = isHero ? 0.38 : 0.34;
  const plaqueH = 0.072;
  const plaqueZ = isHero ? 0.34 : 0.25;

  const plaqueHolder = new THREE.Group();
  plaqueHolder.position.set(0, 0.032, plaqueZ);
  plaqueHolder.rotation.x = -0.44;
  group.add(plaqueHolder);

  const plaqueBacking = new THREE.Mesh(
    track(new THREE.BoxGeometry(plaqueW + 0.014, plaqueH + 0.012, 0.012)),
    mats.brushedGold
  );
  plaqueHolder.add(plaqueBacking);

  const plaqueFace = new THREE.Mesh(
    track(new THREE.PlaneGeometry(plaqueW, plaqueH)),
    plaqueMat
  );
  plaqueFace.position.z = 0.007;
  plaqueHolder.add(plaqueFace);

  // 4. Invisible touch collider on layer 1 sized cleanly to the object
  const colliderGeo = track(new THREE.BoxGeometry(1, 1, 0.38));
  const colliderMat = track(new THREE.MeshBasicMaterial({ visible: false }));
  const collider = new THREE.Mesh(colliderGeo, colliderMat);
  collider.scale.set(initialW + 0.14, initialH + 0.12, 1);
  collider.position.set(0, initialH * 0.5, 0.04);
  collider.layers.set(1);
  collider.userData.productId = product.id;
  collider.userData.aisleId = product.aisleId;
  group.add(collider);

  const hotspotLocalOffset = new THREE.Vector3(0, initialH * 0.28 + 0.06, 0.14);

  // 5. On-demand texture loader that preserves exact natural aspect ratio & flush y = 0 placement
  let textureRequested = false;
  const loadTexture = () => {
    if (textureRequested) return;
    textureRequested = true;
    if (!visualSourceUrl || !visualSourceUrl.trim()) return;

    textureLoader.load(
      visualSourceUrl,
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.anisotropy = maxAnisotropy;
        loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTex.magFilter = THREE.LinearFilter;
        loadedTex.needsUpdate = true;
        ownDisposables.push(loadedTex);

        // Compute exact fitted width & height from the real cropped cutout dimensions
        const img = loadedTex.image as { width?: number; height?: number } | undefined;
        const aspect =
          img && img.width && img.height && img.height > 0 ? img.width / img.height : 1;

        let fitH = targetMaxH;
        let fitW = fitH * aspect;
        if (fitW > targetMaxW) {
          fitW = targetMaxW;
          fitH = fitW / aspect;
        }

        cutoutMesh.scale.set(fitW, fitH, 1);
        // Bottom-most opaque pixel sits strictly at y = 0 (flush on the table/shelf)
        cutoutMesh.position.set(0, fitH * 0.5, 0);

        contactShadowMesh.scale.set(
          Math.max(0.36, Math.min(targetMaxW * 0.96, fitW * 0.92)),
          isHero ? 0.58 : 0.42,
          1
        );

        collider.scale.set(Math.max(0.55, fitW + 0.14), Math.max(0.55, fitH + 0.12), 1);
        collider.position.set(0, fitH * 0.5, 0.04);

        cutoutMat.map = loadedTex;
        cutoutMat.emissiveMap = loadedTex;
        cutoutMat.needsUpdate = true;
      },
      undefined,
      () => {
        // Silent fallback if URL is unreachable
      }
    );
  };

  return {
    group,
    facingPivot,
    collider,
    hotspotLocalOffset,
    loadTexture,
    ownDisposables,
  };
}
