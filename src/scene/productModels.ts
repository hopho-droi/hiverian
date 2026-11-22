import * as THREE from 'three';
import type { ProductItem } from '../catalog';

export interface BuiltProductAsset {
  group: THREE.Group;
  collider: THREE.Mesh;
  /** Local anchor offset above plinth/shelf for hotspot & focus camera */
  hotspotLocalOffset: THREE.Vector3;
  /** Loads the high-resolution product texture on demand (idempotent) */
  loadTexture: () => void;
  /** Optional disposables owned specifically by this product showcase */
  ownDisposables: Array<{ dispose: () => void }>;
}

export interface SharedProductMaterials {
  brushedGold: THREE.MeshPhysicalMaterial;
  antiqueBrass: THREE.MeshStandardMaterial;
  matteWalnut: THREE.MeshStandardMaterial;
  darkHousing: THREE.MeshStandardMaterial;
  warmEmissive: THREE.MeshStandardMaterial;
  vitrineGlass: THREE.MeshPhysicalMaterial;
}

/**
 * Calibrated luxury PBR material pool shared across all 20 architectural
 * showroom vitrines to maintain 60 FPS on mobile GPUs.
 */
export function createSharedProductMaterials(isSoftwareGl: boolean): SharedProductMaterials {
  const brushedGold = new THREE.MeshPhysicalMaterial({
    color: 0xd9b66c,
    metalness: 0.92,
    roughness: 0.22,
    clearcoat: 0.35,
    clearcoatRoughness: 0.22,
    anisotropy: isSoftwareGl ? 0 : 0.78,
    envMapIntensity: 1.35,
  });

  const antiqueBrass = new THREE.MeshStandardMaterial({
    color: 0xb68f48,
    metalness: 0.86,
    roughness: 0.36,
    envMapIntensity: 1.15,
  });

  const matteWalnut = new THREE.MeshStandardMaterial({
    color: 0x362217,
    metalness: 0.04,
    roughness: 0.76,
  });

  const darkHousing = new THREE.MeshStandardMaterial({
    color: 0x16110e,
    metalness: 0.08,
    roughness: 0.84,
  });

  const warmEmissive = new THREE.MeshStandardMaterial({
    color: 0xffebc0,
    emissive: 0xffc062,
    emissiveIntensity: 2.1,
    roughness: 0.2,
    metalness: 0.1,
  });

  // Subtle museum anti-reflective optical glass sitting ahead of each studio photograph
  const vitrineGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    envMapIntensity: 1.45,
  });

  return {
    brushedGold,
    antiqueBrass,
    matteWalnut,
    darkHousing,
    warmEmissive,
    vitrineGlass,
  };
}

/**
 * Creates a clean engraved brass plaque CanvasTexture for the base of each vitrine
 * displaying the product's indicative price and luxury curation badge.
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

  // Velvet Christmas crimson accent band behind badge text
  ctx.fillStyle = '#9B1B26';
  ctx.fillRect(18, 22, 226, 52);

  ctx.fillStyle = '#FFF9F0';
  ctx.font = '600 21px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge.toUpperCase(), 131, 48);

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
 * Generates an architectural spruce-and-gold fallback texture in case `imageUrl`
 * is empty or unavailable in src/catalog.ts.
 */
function createPhotoFallbackTexture(
  title: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 384);
  grad.addColorStop(0, '#071E18');
  grad.addColorStop(1, '#0E352A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 384);

  ctx.strokeStyle = 'rgba(229, 184, 91, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 476, 348);

  ctx.fillStyle = '#9B1B26';
  ctx.fillRect(176, 128, 160, 4);

  ctx.fillStyle = '#E5B85B';
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COLLECTION NOËL', 256, 166);

  ctx.fillStyle = '#FFF9F0';
  ctx.font = '600 25px "Playfair Display", Georgia, serif';
  const shortTitle = title.length > 30 ? `${title.slice(0, 29)}…` : title;
  ctx.fillText(shortTitle, 256, 216);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Builds an Obsess / Emperia-grade photorealistic 3D architectural showcase vitrine
 * (10–12 real PBR parts: walnut stand, brushed gold feet & mitered bezel, backlit LED
 * shadowbox housing, high-res photorealistic studio plate, optical front glass pane,
 * overhanging brass gallery picture lamp on hero pieces, and engraved price plaque).
 *
 * Pivots strictly at bottom-center (y = 0) so every showcase rests flush on its shelf/plinth.
 */
export function buildProductVitrine(
  product: ProductItem,
  mats: SharedProductMaterials,
  textureLoader: THREE.TextureLoader,
  maxAnisotropy: number,
  isSoftwareGl: boolean
): BuiltProductAsset {
  const group = new THREE.Group();
  group.name = `vitrine_${product.id}`;
  const ownDisposables: Array<{ dispose: () => void }> = [];

  const track = <T extends { dispose: () => void }>(item: T): T => {
    ownDisposables.push(item);
    return item;
  };

  const { width, height, tiltX = 0 } = product.shelfSlot;
  const isHero = product.isHero;
  const frameThick = 0.036;
  const boxDepth = 0.095;
  const baseHeight = isHero ? 0.055 : 0.04;

  // 1. Grounded walnut & brass architectural stand foot (y = 0)
  const standBase = new THREE.Mesh(
    track(new THREE.BoxGeometry(width * 0.72, baseHeight, 0.2)),
    mats.matteWalnut
  );
  standBase.position.y = baseHeight / 2;
  standBase.castShadow = !isSoftwareGl;
  standBase.receiveShadow = true;
  group.add(standBase);

  const standBrassTrim = new THREE.Mesh(
    track(new THREE.BoxGeometry(width * 0.74, 0.012, 0.21)),
    mats.brushedGold
  );
  standBrassTrim.position.y = baseHeight + 0.006;
  group.add(standBrassTrim);

  // Twin vertical brass risers lifting the backlit vitrine above the walnut plinth
  const riserH = isHero ? 0.065 : 0.045;
  const riserGeo = track(new THREE.CylinderGeometry(0.014, 0.016, riserH, 12));
  [-width * 0.26, width * 0.26].forEach((rx) => {
    const riser = new THREE.Mesh(riserGeo, mats.brushedGold);
    riser.position.set(rx, baseHeight + riserH / 2, 0);
    group.add(riser);
  });

  // Tilted showcase assembly pivoting just above the brass risers
  const frameAssembly = new THREE.Group();
  const centerY = baseHeight + riserH + height / 2;
  frameAssembly.position.set(0, centerY, 0);
  frameAssembly.rotation.x = tiltX;
  group.add(frameAssembly);

  // 2. Recessed dark architectural shadowbox backing
  const backing = new THREE.Mesh(
    track(new THREE.BoxGeometry(width, height, boxDepth)),
    mats.darkHousing
  );
  backing.position.z = -boxDepth / 2;
  backing.castShadow = !isSoftwareGl;
  backing.receiveShadow = true;
  frameAssembly.add(backing);

  // 3. Four mitered brushed champagne-gold outer frame rails (real 3D depth)
  const topRail = new THREE.Mesh(
    track(new THREE.BoxGeometry(width + frameThick * 2, frameThick, boxDepth + 0.028)),
    mats.brushedGold
  );
  topRail.position.set(0, height / 2 + frameThick / 2, -boxDepth / 2 + 0.012);
  frameAssembly.add(topRail);

  const bottomRail = new THREE.Mesh(
    track(new THREE.BoxGeometry(width + frameThick * 2, frameThick, boxDepth + 0.028)),
    mats.brushedGold
  );
  bottomRail.position.set(0, -height / 2 - frameThick / 2, -boxDepth / 2 + 0.012);
  frameAssembly.add(bottomRail);

  const leftRail = new THREE.Mesh(
    track(new THREE.BoxGeometry(frameThick, height, boxDepth + 0.028)),
    mats.brushedGold
  );
  leftRail.position.set(-width / 2 - frameThick / 2, 0, -boxDepth / 2 + 0.012);
  frameAssembly.add(leftRail);

  const rightRail = new THREE.Mesh(
    track(new THREE.BoxGeometry(frameThick, height, boxDepth + 0.028)),
    mats.brushedGold
  );
  rightRail.position.set(width / 2 + frameThick / 2, 0, -boxDepth / 2 + 0.012);
  frameAssembly.add(rightRail);

  // 4. Recessed inner 2700K golden LED cove strip illuminating the photo plate
  const innerLedTop = new THREE.Mesh(
    track(new THREE.BoxGeometry(width - 0.06, 0.012, 0.012)),
    mats.warmEmissive
  );
  innerLedTop.position.set(0, height / 2 - 0.01, 0.008);
  frameAssembly.add(innerLedTop);

  // 5. High-resolution photorealistic studio product plate (mapped directly from catalog imageUrl)
  const fallbackTex = track(createPhotoFallbackTexture(product.title, maxAnisotropy));
  const photoMat = track(
    new THREE.MeshStandardMaterial({
      map: fallbackTex,
      emissiveMap: fallbackTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.42,
      roughness: 0.34,
      metalness: 0.04,
    })
  );

  let textureRequested = false;
  const loadTexture = () => {
    if (textureRequested) return;
    textureRequested = true;
    if (!product.imageUrl || !product.imageUrl.trim()) return;

    textureLoader.load(
      product.imageUrl,
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.anisotropy = maxAnisotropy;
        loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTex.magFilter = THREE.LinearFilter;
        loadedTex.needsUpdate = true;
        ownDisposables.push(loadedTex);
        photoMat.map = loadedTex;
        photoMat.emissiveMap = loadedTex;
        photoMat.needsUpdate = true;
      },
      undefined,
      () => {
        // Keep clean fallback texture on load failure
      }
    );
  };

  const photoPlane = new THREE.Mesh(
    track(new THREE.PlaneGeometry(width - 0.012, height - 0.012)),
    photoMat
  );
  photoPlane.position.z = 0.004;
  frameAssembly.add(photoPlane);

  // 6. Front optical anti-reflective glass pane catching subtle real-time specular reflections
  const glassPane = new THREE.Mesh(
    track(new THREE.PlaneGeometry(width, height)),
    mats.vitrineGlass
  );
  glassPane.position.z = 0.022;
  glassPane.renderOrder = 2;
  frameAssembly.add(glassPane);

  // 7. Gallery museum picture-light bar above the hero centerpiece vitrine
  if (isHero) {
    const armGeo = track(new THREE.CylinderGeometry(0.007, 0.007, 0.14, 8));
    [-0.24, 0.24].forEach((ax) => {
      const arm = new THREE.Mesh(armGeo, mats.antiqueBrass);
      arm.rotation.x = Math.PI / 2;
      arm.position.set(ax, height / 2 + frameThick + 0.025, 0.04);
      frameAssembly.add(arm);
    });

    const lampHood = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.018, 0.022, width * 0.62, 12)),
      mats.brushedGold
    );
    lampHood.rotation.z = Math.PI / 2;
    lampHood.position.set(0, height / 2 + frameThick + 0.03, 0.11);
    frameAssembly.add(lampHood);

    const lampFilament = new THREE.Mesh(
      track(new THREE.BoxGeometry(width * 0.56, 0.008, 0.012)),
      mats.warmEmissive
    );
    lampFilament.position.set(0, height / 2 + frameThick + 0.016, 0.11);
    frameAssembly.add(lampFilament);
  }

  // 8. Miniature engraved dark-and-gold price plaque seated cleanly on the front base
  const plaqueTex = track(createPlaqueTexture(product.price, product.badge, maxAnisotropy));
  const plaqueMat = track(
    new THREE.MeshStandardMaterial({
      map: plaqueTex,
      emissiveMap: plaqueTex,
      emissive: new THREE.Color(0xfff1d4),
      emissiveIntensity: 0.3,
      roughness: 0.35,
      metalness: 0.18,
    })
  );
  const plaqueW = Math.min(0.46, width * 0.42);
  const plaque = new THREE.Mesh(track(new THREE.PlaneGeometry(plaqueW, 0.085)), plaqueMat);
  plaque.position.set(0, baseHeight * 0.62, 0.108);
  plaque.rotation.x = -0.22;
  group.add(plaque);

  // 9. Generous invisible collision collider on layer 1 for effortless mobile tapping
  const colliderGeo = track(
    new THREE.BoxGeometry(width + 0.16, baseHeight + riserH + height + 0.16, 0.36)
  );
  const colliderMat = track(new THREE.MeshBasicMaterial({ visible: false }));
  const collider = new THREE.Mesh(colliderGeo, colliderMat);
  collider.position.set(0, centerY, 0.02);
  collider.layers.set(1);
  collider.userData.productId = product.id;
  collider.userData.aisleId = product.aisleId;
  group.add(collider);

  return {
    group,
    collider,
    hotspotLocalOffset: new THREE.Vector3(0, centerY - height * 0.34, 0.09),
    loadTexture,
    ownDisposables,
  };
}
