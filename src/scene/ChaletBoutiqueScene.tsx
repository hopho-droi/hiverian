import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CATALOG,
  getAisleBySlug,
  type AisleSlug,
  type ProductItem,
} from '../catalog';
import {
  createAisleSignTexture,
  createContactShadowTexture,
  createParquetTextures,
  createParticleSpriteTexture,
  createWalnutPanelTexture,
} from './textures';
import {
  buildProductShowcase,
  createSharedProductMaterials,
} from './productModels';

export interface ChaletBoutiqueSceneProps {
  activeAisleSlug: AisleSlug;
  selectedProductId: string | null;
  onSelectProduct: (productId: string) => void;
  onOpenCatalogFallback: () => void;
}

const AISLE_SPACING = 6.8;
const GALLERY_SPAN = CATALOG.length * AISLE_SPACING;
const GALLERY_HALF_SPAN = GALLERY_SPAN * 0.5;

function getAisleIndex(slug: AisleSlug): number {
  const idx = CATALOG.findIndex((a) => a.slug === slug);
  return idx >= 0 ? idx : 0;
}

function getAisleCenterXByIndex(idx: number): number {
  return (idx - (CATALOG.length - 1) * 0.5) * AISLE_SPACING;
}

function getAisleCenterX(slug: AisleSlug): number {
  return getAisleCenterXByIndex(getAisleIndex(slug));
}

// Module-scope reusable math helpers (zero GC inside animation loop)
const _projVec = new THREE.Vector3();
const _camGoalPos = new THREE.Vector3();
const _camGoalTarget = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();

interface ProductSceneEntry {
  product: ProductItem;
  aisleSlug: AisleSlug;
  group: THREE.Group;
  facingPivot: THREE.Group;
  baseRotationY: number;
  worldX: number;
  worldZ: number;
  collider: THREE.Mesh;
  worldAnchor: THREE.Vector3;
  focusCenter: THREE.Vector3;
  loadTexture: () => void;
}

export const ChaletBoutiqueScene: React.FC<ChaletBoutiqueSceneProps> = ({
  activeAisleSlug,
  selectedProductId,
  onSelectProduct,
  onOpenCatalogFallback,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const hotspotRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  // Latest props & callbacks in refs so React updates never tear down WebGL
  const activeAisleRef = useRef<AisleSlug>(activeAisleSlug);
  const selectedProductRef = useRef<string | null>(selectedProductId);
  const onSelectProductRef = useRef(onSelectProduct);

  const triggerCameraGoalRef = useRef<
    ((aisle: AisleSlug, productId: string | null, immediate: boolean) => void) | null
  >(null);
  const updatePanoramaRef = useRef<((panoramaUrl: string) => void) | null>(null);
  const loadAisleTexturesRef = useRef<((aisle: AisleSlug) => void) | null>(null);

  activeAisleRef.current = activeAisleSlug;
  selectedProductRef.current = selectedProductId;
  onSelectProductRef.current = onSelectProduct;

  // Smooth damped camera transition, panorama sync & on-demand texture loading when active aisle changes
  useEffect(() => {
    triggerCameraGoalRef.current?.(activeAisleSlug, selectedProductId, false);
    const aisle = getAisleBySlug(activeAisleSlug);
    updatePanoramaRef.current?.(aisle.panoramaUrl);
    loadAisleTexturesRef.current?.(activeAisleSlug);
  }, [activeAisleSlug, selectedProductId]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // Detect software WebGL (SwiftShader / llvmpipe / WARP) via renderer string only
    const probeCanvas = document.createElement('canvas');
    const probeGl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!probeGl) {
      setWebglUnavailable(true);
      return;
    }
    const debugExt = probeGl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = String(
      probeGl.getParameter(debugExt ? debugExt.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER)
    );
    probeGl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);

    const ua = window.navigator.userAgent || '';
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|Mobile/i.test(ua) ||
      window.matchMedia('(pointer: coarse)').matches;
    const deviceMem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    const cpuCores = navigator.hardwareConcurrency || 4;
    const isLowPowerMobile =
      isMobileDevice && ((typeof deviceMem === 'number' && deviceMem <= 4) || cpuCores <= 4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl && !isLowPowerMobile,
        powerPreference: isMobileDevice ? 'default' : 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    const dpr = window.devicePixelRatio || 1;
    const targetDpr = isSoftwareGl
      ? 1
      : isLowPowerMobile
        ? Math.min(dpr, 1.35)
        : isMobileDevice
          ? Math.min(dpr, 1.75)
          : Math.min(dpr, 2);
    renderer.setPixelRatio(targetDpr);
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    renderer.shadowMap.enabled = !isSoftwareGl && !isLowPowerMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    const maxAnisotropy = Math.min(
      renderer.capabilities.getMaxAnisotropy(),
      isMobileDevice ? 4 : 8
    );
    const textureLoader = new THREE.TextureLoader();

    // Deep winter forest twilight backdrop & horizon-matched fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071a14);
    scene.fog = new THREE.FogExp2(0x081c16, 0.022);

    // Studio RoomEnvironment PMREM reflections (authentic brass & optical glass highlights)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const isPortraitViewport = (w: number, h: number) => w / Math.max(h, 1) < 0.85;
    const camera = new THREE.PerspectiveCamera(
      isPortraitViewport(width, height) ? 50 : 42,
      width / Math.max(height, 1),
      0.1,
      70
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = isMobileDevice ? 0.08 : 0.065;
    controls.rotateSpeed = isMobileDevice ? 0.65 : 0.55;
    controls.zoomSpeed = isMobileDevice ? 0.75 : 0.65;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
    controls.minPolarAngle = Math.PI * 0.37;
    controls.maxPolarAngle = Math.PI * 0.54;
    controls.minDistance = 1.65;
    controls.maxDistance = 6.95;

    // Warm/cool Christmas gallery lighting rig
    const hemiLight = new THREE.HemisphereLight(0x98b5dc, 0x2b1d12, 0.68);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe1b5, 1.25);
    keyLight.position.set(4, 9.5, 8.5);
    if (!isSoftwareGl && !isLowPowerMobile) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 32;
      keyLight.shadow.camera.left = -(GALLERY_HALF_SPAN + 6);
      keyLight.shadow.camera.right = GALLERY_HALF_SPAN + 6;
      keyLight.shadow.camera.top = 8;
      keyLight.shadow.camera.bottom = -8;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // =========================================================================
    // ARCHITECTURAL CHRISTMAS CHALET GALLERY (SPRUCE, VELVET CRIMSON & GOLD)
    // =========================================================================
    const disposables: Array<{ dispose: () => void }> = [];
    const registerDisposable = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    const { map: parquetMap, roughnessMap: parquetRoughMap } =
      createParquetTextures(maxAnisotropy);
    registerDisposable(parquetMap);
    registerDisposable(parquetRoughMap);

    const walnutPanelTex = registerDisposable(createWalnutPanelTexture(maxAnisotropy));
    const contactShadowTex = registerDisposable(createContactShadowTexture());
    const particleTex = registerDisposable(createParticleSpriteTexture());

    const floorWidth = GALLERY_SPAN + 14;
    const parquetRepeatX = Math.max(14, Math.round(floorWidth / 3.4));
    parquetMap.repeat.set(parquetRepeatX, 5);
    parquetRoughMap.repeat.set(parquetRepeatX, 5);
    walnutPanelTex.repeat.set(Math.max(2, Math.round(CATALOG.length * 0.45)), 1.5);

    const floorMat = registerDisposable(
      new THREE.MeshStandardMaterial({
        map: parquetMap,
        roughnessMap: parquetRoughMap,
        roughness: 0.72,
        metalness: 0.06,
      })
    );
    const floor = new THREE.Mesh(
      registerDisposable(new THREE.PlaneGeometry(floorWidth, 16)),
      floorMat
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 2.2);
    floor.receiveShadow = true;
    scene.add(floor);

    const darkTimberMat = registerDisposable(
      new THREE.MeshStandardMaterial({
        color: 0x20150f,
        roughness: 0.78,
        metalness: 0.05,
      })
    );
    const walnutWallMat = registerDisposable(
      new THREE.MeshStandardMaterial({
        map: walnutPanelTex,
        roughness: 0.7,
        metalness: 0.06,
      })
    );
    const shelfWoodMat = registerDisposable(
      new THREE.MeshStandardMaterial({
        color: 0x382418,
        roughness: 0.56,
        metalness: 0.08,
      })
    );
    // Deep Christmas Spruce niche backdrop (#0B2B22)
    const spruceAccentWallMat = registerDisposable(
      new THREE.MeshStandardMaterial({
        color: 0x0b2b22,
        roughness: 0.86,
        metalness: 0.04,
      })
    );
    // Luxury Christmas velvet crimson carpet runner (#9B1B26)
    const crimsonVelvetMat = registerDisposable(
      new THREE.MeshStandardMaterial({
        color: 0x7b141e,
        roughness: 0.9,
        metalness: 0.04,
      })
    );
    // Champagne gold (#E5B85B)
    const brassTrimMat = registerDisposable(
      new THREE.MeshPhysicalMaterial({
        color: 0xe5b85b,
        metalness: 0.92,
        roughness: 0.22,
        clearcoat: 0.35,
        anisotropy: isSoftwareGl ? 0 : 0.72,
        envMapIntensity: 1.35,
      })
    );
    const ledStripMat = registerDisposable(
      new THREE.MeshStandardMaterial({
        color: 0xfff0c8,
        emissive: 0xffc366,
        emissiveIntensity: 2.35,
        roughness: 0.2,
      })
    );
    const contactShadowMat = registerDisposable(
      new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      })
    );

    // Festive crimson velvet gallery runner bordered with champagne gold inlay strips
    const runnerLength = GALLERY_SPAN + 4;
    const velvetRunner = new THREE.Mesh(
      registerDisposable(new THREE.PlaneGeometry(runnerLength, 1.35)),
      crimsonVelvetMat
    );
    velvetRunner.rotation.x = -Math.PI / 2;
    velvetRunner.position.set(0, 0.018, 2.55);
    velvetRunner.receiveShadow = true;
    scene.add(velvetRunner);

    const runnerTrimGeo = registerDisposable(new THREE.PlaneGeometry(runnerLength, 0.032));
    [1.88, 3.22].forEach((rz) => {
      const trim = new THREE.Mesh(runnerTrimGeo, brassTrimMat);
      trim.rotation.x = -Math.PI / 2;
      trim.position.set(0, 0.022, rz);
      scene.add(trim);
    });

    // Continuous back structural wall & baseboard
    const backWallLength = GALLERY_SPAN + 12;
    const mainBackWall = new THREE.Mesh(
      registerDisposable(new THREE.BoxGeometry(backWallLength, 5.2, 0.3)),
      walnutWallMat
    );
    mainBackWall.position.set(0, 2.6, -1.72);
    mainBackWall.receiveShadow = true;
    scene.add(mainBackWall);

    const baseboard = new THREE.Mesh(
      registerDisposable(new THREE.BoxGeometry(backWallLength, 0.2, 0.14)),
      darkTimberMat
    );
    baseboard.position.set(0, 0.1, -1.52);
    scene.add(baseboard);

    const ceiling = new THREE.Mesh(
      registerDisposable(new THREE.PlaneGeometry(floorWidth, 16)),
      darkTimberMat
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 4.68, 2.2);
    scene.add(ceiling);

    const beamGeo = registerDisposable(new THREE.BoxGeometry(0.32, 0.34, 12.5));
    for (let i = -1; i <= CATALOG.length; i++) {
      const beam = new THREE.Mesh(beamGeo, darkTimberMat);
      beam.position.set((i - CATALOG.length * 0.5) * AISLE_SPACING, 4.5, 1.8);
      scene.add(beam);
    }

    // Photorealistic 360° panoramic backdrop driven by each aisle's `panoramaUrl`
    const panoMat = registerDisposable(new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const panoramaCache = new Map<string, THREE.Texture>();
    let activePanoramaUrl = '';

    const applyPanoramaUrl = (url: string) => {
      if (!url || url === activePanoramaUrl) return;
      activePanoramaUrl = url;
      const cached = panoramaCache.get(url);
      if (cached) {
        panoMat.map = cached;
        panoMat.needsUpdate = true;
        return;
      }
      textureLoader.load(url, (panoTex) => {
        panoTex.colorSpace = THREE.SRGBColorSpace;
        panoTex.anisotropy = maxAnisotropy;
        panoTex.wrapS = THREE.MirroredRepeatWrapping;
        panoTex.repeat.set(Math.max(2, Math.ceil(CATALOG.length / 2.5)), 1);
        panoTex.needsUpdate = true;
        registerDisposable(panoTex);
        panoramaCache.set(url, panoTex);
        if (activePanoramaUrl === url) {
          panoMat.map = panoTex;
          panoMat.needsUpdate = true;
        }
      });
    };

    updatePanoramaRef.current = applyPanoramaUrl;
    applyPanoramaUrl(getAisleBySlug(activeAisleRef.current).panoramaUrl);

    const vistaWidth = GALLERY_SPAN + 10;
    const endVistaX = GALLERY_HALF_SPAN + 3.5;

    const oppositeVista = new THREE.Mesh(
      registerDisposable(new THREE.PlaneGeometry(vistaWidth, 9.5)),
      panoMat
    );
    oppositeVista.position.set(0, 3.0, 9.8);
    oppositeVista.rotation.y = Math.PI;
    scene.add(oppositeVista);

    const endVistaGeo = registerDisposable(new THREE.PlaneGeometry(14, 7.5));
    const leftEndVista = new THREE.Mesh(endVistaGeo, panoMat);
    leftEndVista.position.set(-endVistaX, 2.7, 2.2);
    leftEndVista.rotation.y = Math.PI / 2;
    scene.add(leftEndVista);

    const rightEndVista = new THREE.Mesh(endVistaGeo, panoMat);
    rightEndVista.position.set(endVistaX, 2.7, 2.2);
    rightEndVista.rotation.y = -Math.PI / 2;
    scene.add(rightEndVista);

    const windowRail = new THREE.Mesh(
      registerDisposable(new THREE.BoxGeometry(vistaWidth, 0.72, 0.24)),
      darkTimberMat
    );
    windowRail.position.set(0, 0.36, 8.6);
    scene.add(windowRail);

    const mullionGeo = registerDisposable(new THREE.BoxGeometry(0.24, 4.7, 0.24));
    const mullionHalf = Math.ceil(GALLERY_HALF_SPAN / 6) * 6;
    for (let x = -mullionHalf; x <= mullionHalf; x += 6) {
      const mullion = new THREE.Mesh(mullionGeo, darkTimberMat);
      mullion.position.set(x, 2.35, 8.6);
      scene.add(mullion);
    }

    // Build all architectural alcoves + automatically placed product cutouts
    const pilasterGeo = registerDisposable(new THREE.BoxGeometry(0.46, 4.5, 0.74));
    const brassStripVGeo = registerDisposable(new THREE.BoxGeometry(0.028, 3.95, 0.036));
    const credenzaGeo = registerDisposable(new THREE.BoxGeometry(5.1, 1.52, 0.76));
    const shelfGeo = registerDisposable(new THREE.BoxGeometry(5.16, 0.055, 0.8));
    const upperShelfGeo = registerDisposable(new THREE.BoxGeometry(1.72, 0.05, 0.56));
    const ledBarGeo = registerDisposable(new THREE.BoxGeometry(4.85, 0.018, 0.03));
    const plinthBaseGeo = registerDisposable(new THREE.CylinderGeometry(0.62, 0.68, 0.74, 32));
    const plinthRingGeo = registerDisposable(new THREE.TorusGeometry(0.625, 0.014, 10, 36));
    const signFrameGeo = registerDisposable(new THREE.BoxGeometry(3.6, 0.76, 0.1));
    const signFaceGeo = registerDisposable(new THREE.PlaneGeometry(3.46, 0.66));
    const contactPlaneGeo = registerDisposable(new THREE.PlaneGeometry(1.85, 1.85));

    const vitrineMats = createSharedProductMaterials(isSoftwareGl);
    if (vitrineMats.contactShadow.map) {
      registerDisposable(vitrineMats.contactShadow.map);
    }
    Object.values(vitrineMats).forEach((m) => registerDisposable(m));

    const aisleGlowLights: THREE.PointLight[] = [];
    const productEntries: ProductSceneEntry[] = [];
    const clickableColliders: THREE.Object3D[] = [];

    CATALOG.forEach((aisle, aisleIdx) => {
      const cx = getAisleCenterXByIndex(aisleIdx);
      const alcoveGroup = new THREE.Group();
      alcoveGroup.position.set(cx, 0, 0);
      scene.add(alcoveGroup);

      const nichePanel = new THREE.Mesh(
        registerDisposable(new THREE.PlaneGeometry(5.36, 3.72)),
        spruceAccentWallMat
      );
      nichePanel.position.set(0, 2.04, -1.52);
      nichePanel.receiveShadow = true;
      alcoveGroup.add(nichePanel);

      [-2.92, 2.92].forEach((px) => {
        const pilaster = new THREE.Mesh(pilasterGeo, darkTimberMat);
        pilaster.position.set(px, 2.25, -1.16);
        pilaster.receiveShadow = true;
        alcoveGroup.add(pilaster);

        const brassInlay = new THREE.Mesh(brassStripVGeo, brassTrimMat);
        brassInlay.position.set(px + (px < 0 ? 0.24 : -0.24), 2.1, -0.78);
        alcoveGroup.add(brassInlay);
      });

      const credenza = new THREE.Mesh(credenzaGeo, darkTimberMat);
      credenza.position.set(0, 0.76, -0.84);
      credenza.receiveShadow = true;
      alcoveGroup.add(credenza);

      const credenzaBrassRail = new THREE.Mesh(
        registerDisposable(new THREE.BoxGeometry(5.12, 0.018, 0.02)),
        brassTrimMat
      );
      credenzaBrassRail.position.set(0, 1.515, -0.43);
      alcoveGroup.add(credenzaBrassRail);

      const credenzaTop = new THREE.Mesh(shelfGeo, shelfWoodMat);
      credenzaTop.position.set(0, 1.515, -0.82);
      credenzaTop.receiveShadow = true;
      alcoveGroup.add(credenzaTop);

      const centerUpperShelf = new THREE.Mesh(upperShelfGeo, shelfWoodMat);
      centerUpperShelf.position.set(0, 1.815, -1.0);
      centerUpperShelf.receiveShadow = true;
      alcoveGroup.add(centerUpperShelf);

      const centerShelfBrass = new THREE.Mesh(
        registerDisposable(new THREE.BoxGeometry(1.73, 0.016, 0.02)),
        brassTrimMat
      );
      centerShelfBrass.position.set(0, 1.815, -0.71);
      alcoveGroup.add(centerShelfBrass);

      [1.57, 2.94].forEach((ly) => {
        const ledBar = new THREE.Mesh(ledBarGeo, ledStripMat);
        ledBar.position.set(0, ly, -1.46);
        alcoveGroup.add(ledBar);
      });

      const signTex = registerDisposable(
        createAisleSignTexture(aisle.indexLabel, aisle.title, maxAnisotropy)
      );
      const signFaceMat = registerDisposable(
        new THREE.MeshStandardMaterial({
          map: signTex,
          emissiveMap: signTex,
          emissive: new THREE.Color(0xfff1d2),
          emissiveIntensity: 0.7,
          roughness: 0.3,
          metalness: 0.14,
        })
      );

      const signFrame = new THREE.Mesh(signFrameGeo, brassTrimMat);
      signFrame.position.set(0, 3.44, -1.04);
      alcoveGroup.add(signFrame);

      const signFace = new THREE.Mesh(signFaceGeo, signFaceMat);
      signFace.position.set(0, 3.44, -0.985);
      alcoveGroup.add(signFace);

      const plinth = new THREE.Mesh(plinthBaseGeo, darkTimberMat);
      plinth.position.set(0, 0.37, 0.88);
      plinth.castShadow = !isSoftwareGl && !isLowPowerMobile;
      plinth.receiveShadow = true;
      alcoveGroup.add(plinth);

      const plinthTopRing = new THREE.Mesh(plinthRingGeo, brassTrimMat);
      plinthTopRing.rotation.x = Math.PI / 2;
      plinthTopRing.position.set(0, 0.735, 0.88);
      alcoveGroup.add(plinthTopRing);

      const plinthBottomRing = new THREE.Mesh(plinthRingGeo, brassTrimMat);
      plinthBottomRing.rotation.x = Math.PI / 2;
      plinthBottomRing.scale.setScalar(1.09);
      plinthBottomRing.position.set(0, 0.03, 0.88);
      alcoveGroup.add(plinthBottomRing);

      const plinthShadow = new THREE.Mesh(contactPlaneGeo, contactShadowMat);
      plinthShadow.rotation.x = -Math.PI / 2;
      plinthShadow.position.set(0, 0.025, 0.88);
      alcoveGroup.add(plinthShadow);

      const rod = new THREE.Mesh(
        registerDisposable(new THREE.CylinderGeometry(0.01, 0.01, 0.65, 8)),
        brassTrimMat
      );
      rod.position.set(0, 4.32, 1.15);
      alcoveGroup.add(rod);

      const lampBar = new THREE.Mesh(
        registerDisposable(new THREE.CylinderGeometry(0.028, 0.028, 1.35, 12)),
        brassTrimMat
      );
      lampBar.rotation.z = Math.PI / 2;
      lampBar.position.set(0, 4.0, 1.15);
      alcoveGroup.add(lampBar);

      const lampGlow = new THREE.Mesh(
        registerDisposable(new THREE.BoxGeometry(1.22, 0.015, 0.02)),
        ledStripMat
      );
      lampGlow.position.set(0, 3.972, 1.15);
      alcoveGroup.add(lampGlow);

      const alcoveLight = new THREE.PointLight(0xffcb82, 3.65, 9.8, 1.6);
      alcoveLight.position.set(0, 2.95, 1.05);
      alcoveGroup.add(alcoveLight);
      aisleGlowLights.push(alcoveLight);

      // Automatic harmonious cutout placement directly on the wooden tables & shelves
      aisle.products.forEach((product) => {
        const built = buildProductShowcase(
          product,
          vitrineMats,
          textureLoader,
          maxAnisotropy
        );
        built.ownDisposables.forEach((d) => registerDisposable(d));

        const { x, y, z, rotationY = 0, height: slotH } = product.shelfSlot;
        built.group.position.set(x, y, z);
        built.group.rotation.y = rotationY;
        alcoveGroup.add(built.group);

        const worldAnchor = new THREE.Vector3(
          cx + x + built.hotspotLocalOffset.x,
          y + built.hotspotLocalOffset.y,
          z + built.hotspotLocalOffset.z
        );

        const focusCenter = new THREE.Vector3(
          cx + x,
          y + slotH * 0.46,
          z + 0.04
        );

        productEntries.push({
          product,
          aisleSlug: aisle.slug,
          group: built.group,
          facingPivot: built.facingPivot,
          baseRotationY: rotationY,
          worldX: cx + x,
          worldZ: z,
          collider: built.collider,
          worldAnchor,
          focusCenter,
          loadTexture: built.loadTexture,
        });
        clickableColliders.push(built.collider);
      });
    });

    // Prioritized texture loading: load ONLY the visible aisle immediately, then pre-warm neighbors gently on idle
    const loadAisleTextures = (slug: AisleSlug) => {
      for (let i = 0; i < productEntries.length; i++) {
        if (productEntries[i].aisleSlug === slug) {
          productEntries[i].loadTexture();
        }
      }
    };
    loadAisleTexturesRef.current = loadAisleTextures;
    loadAisleTextures(activeAisleRef.current);

    // Pre-warm immediate neighbor aisles after initial paint only if not on mobile Save-Data mode
    const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    let prewarmTimer = 0;
    if (!connection?.saveData) {
      prewarmTimer = window.setTimeout(() => {
        const currentIdx = getAisleIndex(activeAisleRef.current);
        const neighborIndices = [currentIdx - 1, currentIdx + 1].filter(
          (i) => i >= 0 && i < CATALOG.length
        );
        neighborIndices.forEach((ni) => {
          loadAisleTextures(CATALOG[ni].slug);
        });
      }, 1600);
    }

    // =========================================================================
    // SUBTLE 3D DRIFTING SNOW / GOLDEN WINTER PARTICLES
    // =========================================================================
    const particleCount = isMobileDevice ? 150 : 280;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particlePhases = new Float32Array(particleCount);

    let pSeed = 9187;
    const pRand = () => {
      pSeed = (pSeed * 16807) % 2147483647;
      return (pSeed - 1) / 2147483646;
    };

    const particleSpanX = GALLERY_SPAN + 8;
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (pRand() - 0.5) * particleSpanX;
      particlePositions[i * 3 + 1] = 0.25 + pRand() * 4.25;
      particlePositions[i * 3 + 2] = -1.1 + pRand() * 8.0;
      particleSpeeds[i] = 0.1 + pRand() * 0.16;
      particlePhases[i] = pRand() * Math.PI * 2;
    }

    const particleGeo = registerDisposable(new THREE.BufferGeometry());
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = registerDisposable(
      new THREE.PointsMaterial({
        size: 0.075,
        map: particleTex,
        transparent: true,
        opacity: 0.52,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
    );
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // =========================================================================
    // CAMERA CHOREOGRAPHY & CONSTRAINED ORBIT
    // =========================================================================
    let isTransitioning = false;

    const computeCameraGoals = (aisleSlug: AisleSlug, productId: string | null) => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const portrait = isPortraitViewport(w, h);
      const aisleX = getAisleCenterX(aisleSlug);

      if (productId) {
        const entry = productEntries.find((e) => e.product.id === productId);
        if (entry) {
          const c = entry.focusCenter;
          const xOffset = portrait ? 0 : 0.34;
          const yOffset = portrait ? -0.16 : 0.0;
          _camGoalTarget.set(c.x + xOffset, c.y + yOffset, c.z);
          _camGoalPos.set(
            c.x + (portrait ? 0.0 : 0.42),
            c.y + (portrait ? 0.08 : 0.04),
            c.z + (portrait ? 2.35 : 1.98)
          );
          return;
        }
      }

      _camGoalTarget.set(aisleX, portrait ? 1.88 : 1.92, -0.35);
      _camGoalPos.set(aisleX, portrait ? 1.98 : 2.02, portrait ? 6.25 : 5.05);
    };

    const setCameraGoal = (aisleSlug: AisleSlug, productId: string | null, immediate: boolean) => {
      computeCameraGoals(aisleSlug, productId);
      if (immediate) {
        camera.position.copy(_camGoalPos);
        controls.target.copy(_camGoalTarget);
        controls.update();
        isTransitioning = false;
      } else {
        isTransitioning = true;
      }
    };

    triggerCameraGoalRef.current = setCameraGoal;

    // Position camera IMMEDIATELY on the URL-requested aisle before frame 0
    setCameraGoal(activeAisleRef.current, selectedProductRef.current, true);

    const onControlStart = () => {
      isTransitioning = false;
    };
    controls.addEventListener('start', onControlStart);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // POINTER RAYCASTING (DIRECT PRODUCT SELECTION)
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);

    let pointerDownX = 0;
    let pointerDownY = 0;
    let lastHoverCheck = 0;

    const updateNdc = (clientX: number, clientY: number): boolean => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      _pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      return true;
    };

    const getRaycastProduct = (clientX: number, clientY: number): string | null => {
      if (!updateNdc(clientX, clientY)) return null;
      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickableColliders, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.productId as string | undefined;
        return hitId ?? null;
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownX;
      const dy = e.clientY - pointerDownY;
      const tapThreshold = e.pointerType === 'touch' ? 14 : 8;
      if (Math.hypot(dx, dy) > tapThreshold) return;

      const hitProductId = getRaycastProduct(e.clientX, e.clientY);
      if (hitProductId) {
        onSelectProductRef.current(hitProductId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const now = performance.now();
      if (now - lastHoverCheck < 55) return;
      lastHoverCheck = now;
      const hitProductId = getRaycastProduct(e.clientX, e.clientY);
      renderer.domElement.style.cursor = hitProductId ? 'pointer' : 'grab';
      setHoveredProductId((prev) => (prev === hitProductId ? prev : hitProductId));
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };
    const onContextRestored = () => {
      setWebglUnavailable(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.fov = isPortraitViewport(w, h) ? 50 : 42;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    // =========================================================================
    // RENDER LOOP (GPU rAF + ANDROID VISIBILITY PAUSE + SOFTWARE WEBGL afterDraw)
    // =========================================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let isPausedByVisibility = document.hidden;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 85);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 6);
    };

    const updateProjectedHotspots = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const activeAisle = activeAisleRef.current;

      for (let i = 0; i < productEntries.length; i++) {
        const entry = productEntries[i];
        const btn = hotspotRefs.current.get(entry.product.id);
        if (!btn) continue;

        if (entry.aisleSlug !== activeAisle) {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
          continue;
        }

        _projVec.copy(entry.worldAnchor).project(camera);
        const isBehind = _projVec.z > 1 || _projVec.z < -1;
        const sx = (_projVec.x * 0.5 + 0.5) * w;
        const sy = (-_projVec.y * 0.5 + 0.5) * h;

        if (isBehind || sx < -30 || sx > w + 30 || sy < -30 || sy > h + 30) {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
        } else {
          btn.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`;
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
        }
      }
    };

    const tick = () => {
      if (disposed || isPausedByVisibility) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      if (isTransitioning) {
        const lambda = prefersReducedMotion ? 24 : 5.4;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _camGoalPos.x, lambda, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _camGoalPos.y, lambda, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _camGoalPos.z, lambda, dt);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _camGoalTarget.x, lambda, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _camGoalTarget.y, lambda, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _camGoalTarget.z, lambda, dt);

        if (
          camera.position.distanceToSquared(_camGoalPos) < 0.0004 &&
          controls.target.distanceToSquared(_camGoalTarget) < 0.0004
        ) {
          camera.position.copy(_camGoalPos);
          controls.target.copy(_camGoalTarget);
          isTransitioning = false;
        }
      }

      const activeX = getAisleCenterX(activeAisleRef.current);
      if (!isTransitioning) {
        controls.minAzimuthAngle = -0.44;
        controls.maxAzimuthAngle = 0.44;
        controls.target.x = THREE.MathUtils.clamp(controls.target.x, activeX - 2.3, activeX + 2.3);
      } else {
        controls.minAzimuthAngle = -Infinity;
        controls.maxAzimuthAngle = Infinity;
      }

      controls.update();

      // Gentle Y-axis cylindrical facing for active aisle 2.5D cutouts so objects never look paper-thin during orbit
      const currentSlug = activeAisleRef.current;
      for (let i = 0; i < productEntries.length; i++) {
        const entry = productEntries[i];
        if (entry.aisleSlug !== currentSlug) continue;
        const dxCam = camera.position.x - entry.worldX;
        const dzCam = Math.max(0.8, camera.position.z - entry.worldZ);
        const targetYaw = THREE.MathUtils.clamp(
          Math.atan2(dxCam, dzCam) - entry.baseRotationY,
          -0.36,
          0.36
        );
        entry.facingPivot.rotation.y = THREE.MathUtils.damp(
          entry.facingPivot.rotation.y,
          targetYaw,
          7,
          dt
        );
      }

      if (!prefersReducedMotion) {
        const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          arr[i3 + 1] -= particleSpeeds[i] * dt;
          arr[i3] += Math.sin(elapsed * 0.5 + particlePhases[i]) * 0.045 * dt;
          if (arr[i3 + 1] < 0.2) {
            arr[i3 + 1] = 4.4;
          }
        }
        posAttr.needsUpdate = true;

        for (let i = 0; i < aisleGlowLights.length; i++) {
          aisleGlowLights[i].intensity = 3.6 + Math.sin(elapsed * 1.5 + i * 1.3) * 0.14;
        }
      }

      renderer.render(scene, camera);
      updateProjectedHotspots();

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    // Pause WebGL render loop automatically when switching apps on Android
    const onVisibilityChange = () => {
      if (document.hidden) {
        isPausedByVisibility = true;
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(frameId);
      } else {
        isPausedByVisibility = false;
        clock.getDelta();
        handleResize();
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    if (!isPausedByVisibility) {
      tick();
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.clearTimeout(prewarmTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', onControlStart);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      envTarget.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activeAisle = getAisleBySlug(activeAisleSlug);

  if (webglUnavailable) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#071E18] px-6 text-center">
        <div className="max-w-md border border-[#E5B85B]/35 bg-[#0B2B22] p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E5B85B]">
            Collection Noël · Maison Hiveria
          </p>
          <h2 className="mt-3 font-serif text-2xl text-[#FFF9F0]">
            Accès rapide au catalogue de Noël
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#D4CFC4]">
            Votre navigateur ne permet pas d’afficher l’espace 3D WebGL. Parcourez
            l’ensemble de nos {CATALOG.length} rayons en mode catalogue haute définition.
          </p>
          <button
            type="button"
            onClick={onOpenCatalogFallback}
            className="mt-6 inline-flex min-h-[48px] items-center justify-center bg-gradient-to-r from-[#9B1B26] to-[#B91C1C] px-6 py-3 text-sm font-semibold text-[#FFF9F0] shadow-[0_8px_24px_rgba(155,27,38,0.45)] transition-opacity hover:opacity-95"
          >
            Ouvrir la Vue Catalogue 2D
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#071E18]">
      {/* Dedicated isolated WebGL canvas mount */}
      <div
        ref={canvasMountRef}
        className="h-full w-full"
        aria-label={`Visite 3D du rayon ${activeAisle.title}`}
      />

      {/* Projected interactive 3D->2D champagne-gold product hotspots (48px mobile touch targets) */}
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        {CATALOG.flatMap((aisle) =>
          aisle.products.map((product) => {
            const isSelected = selectedProductId === product.id;
            const isHovered = hoveredProductId === product.id;
            return (
              <button
                key={product.id}
                ref={(el) => {
                  hotspotRefs.current.set(product.id, el);
                }}
                type="button"
                onClick={() => onSelectProduct(product.id)}
                aria-label={`Découvrir ${product.title} — ${product.price}`}
                style={{ opacity: 0 }}
                className="group pointer-events-none fixed left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5B85B] md:h-11 md:w-11"
              >
                {/* Pulsing champagne-gold halo ring */}
                <span
                  aria-hidden="true"
                  className={`hotspot-pulse-ring absolute h-6 w-6 rounded-full border ${
                    isSelected
                      ? 'border-[#E5B85B] bg-[#E5B85B]/30'
                      : 'border-[#E5B85B]/90 bg-[#E5B85B]/20'
                  }`}
                />
                {/* Core luminous snow-cream & champagne dot */}
                <span
                  aria-hidden="true"
                  className={`relative block rounded-full border transition-transform duration-200 group-hover:scale-125 ${
                    isSelected
                      ? 'h-3.5 w-3.5 border-[#071E18] bg-[#E5B85B] shadow-[0_0_14px_rgba(229,184,91,0.95)]'
                      : isHovered
                        ? 'h-3 w-3 border-[#071E18] bg-[#E5B85B]'
                        : 'h-2.5 w-2.5 border-[#E5B85B] bg-[#FFF9F0] shadow-[0_0_10px_rgba(229,184,91,0.85)]'
                  }`}
                />

                {/* Clean desktop spruce-and-gold hover tooltip */}
                <span
                  className={`pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap border border-[#E5B85B]/45 bg-[#0B2B22]/96 px-3 py-1.5 text-left shadow-xl transition-opacity duration-150 md:block ${
                    isHovered && !isSelected
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  }`}
                >
                  <span className="block max-w-[220px] truncate text-xs font-medium text-[#FFF9F0]">
                    {product.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-semibold tabular-nums text-[#E5B85B]">
                    {product.price}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
