import * as THREE from 'three';

/**
 * Generates a paired warm honey-oak parquet wood albedo + roughness texture
 * completely procedurally via HTML5 Canvas (zero external file dependencies).
 */
export function createParquetTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  ctx.fillStyle = '#5B3E28';
  ctx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#8C8C8C';
  rCtx.fillRect(0, 0, size, size);

  const plankRows = 8;
  const plankH = size / plankRows;

  // Deterministic pseudo-random helper for repeatable luxury grain
  let seed = 4217;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let row = 0; row < plankRows; row++) {
    const y = row * plankH;
    const cols = 3;
    const offset = (row % 2) * (size / 6);

    for (let c = -1; c <= cols; c++) {
      const plankW = size / cols;
      const x = c * plankW + offset;

      // Subtle warm oak tonal variation per plank
      const hue = 27 + (rand() - 0.5) * 5;
      const sat = 38 + (rand() - 0.5) * 8;
      const light = 27 + (rand() - 0.5) * 6;
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
      ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      // Roughness variation per plank (0.42 - 0.62 satin oiled oak)
      const rVal = Math.round(115 + rand() * 38);
      rCtx.fillStyle = `rgb(${rVal},${rVal},${rVal})`;
      rCtx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      // Fine horizontal wood grain streaks
      for (let g = 0; g < 18; g++) {
        const gy = y + 3 + rand() * (plankH - 6);
        const alpha = 0.05 + rand() * 0.1;
        ctx.strokeStyle = rand() > 0.5 ? `rgba(32, 18, 9, ${alpha})` : `rgba(182, 134, 86, ${alpha * 0.7})`;
        ctx.lineWidth = 0.7 + rand() * 1.4;
        ctx.beginPath();
        ctx.moveTo(x + 2, gy);
        ctx.bezierCurveTo(
          x + plankW * 0.33,
          gy + (rand() - 0.5) * 3,
          x + plankW * 0.66,
          gy + (rand() - 0.5) * 3,
          x + plankW - 2,
          gy
        );
        ctx.stroke();

        rCtx.strokeStyle = `rgba(170,170,170,${alpha * 0.6})`;
        rCtx.lineWidth = 1;
        rCtx.beginPath();
        rCtx.moveTo(x + 2, gy);
        rCtx.lineTo(x + plankW - 2, gy);
        rCtx.stroke();
      }

      // Plank bevel seam
      ctx.strokeStyle = 'rgba(20, 12, 7, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.5, y + 0.5, plankW - 1, plankH - 1);

      rCtx.strokeStyle = 'rgb(225,225,225)';
      rCtx.lineWidth = 2;
      rCtx.strokeRect(x + 0.5, y + 0.5, plankW - 1, plankH - 1);
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(14, 5);
  map.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(14, 5);
  roughnessMap.anisotropy = maxAnisotropy;

  return { map, roughnessMap };
}

/**
 * Generates dark architectural walnut chalet paneling texture for alcove backs and walls.
 */
export function createWalnutPanelTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#2B1D15';
  ctx.fillRect(0, 0, size, size);

  const slats = 8;
  const slatW = size / slats;
  let seed = 8813;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < slats; i++) {
    const x = i * slatW;
    const tone = 14 + rand() * 4;
    ctx.fillStyle = `hsl(22, 34%, ${tone}%)`;
    ctx.fillRect(x + 2, 0, slatW - 4, size);

    // Subtle vertical wood grain
    for (let g = 0; g < 16; g++) {
      const gx = x + 4 + rand() * (slatW - 8);
      ctx.strokeStyle =
        rand() > 0.45 ? 'rgba(12, 7, 4, 0.22)' : 'rgba(128, 88, 56, 0.1)';
      ctx.lineWidth = 1 + rand() * 1.6;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx + (rand() - 0.5) * 4, size);
      ctx.stroke();
    }

    // Recessed architectural groove
    ctx.fillStyle = 'rgba(9, 5, 3, 0.72)';
    ctx.fillRect(x, 0, 2.5, size);
    ctx.fillStyle = 'rgba(145, 102, 65, 0.12)';
    ctx.fillRect(x + 2.5, 0, 1.5, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1.5);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Renders a crisp high-DPI illuminated overhead department sign for each alcove.
 */
export function createAisleSignTexture(
  indexLabel: string,
  title: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const width = 1024;
  const height = 220;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Deep Christmas spruce plaque backdrop (#0B2B22)
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#071E18');
  bg.addColorStop(0.5, '#0B2B22');
  bg.addColorStop(1, '#071E18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Warm champagne-gold spotlight wash
  const glow = ctx.createRadialGradient(width / 2, height * 0.42, 40, width / 2, height * 0.5, width * 0.52);
  glow.addColorStop(0, 'rgba(229, 184, 91, 0.2)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Double hairline champagne gold border (#E5B85B)
  ctx.strokeStyle = '#E5B85B';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  ctx.strokeStyle = 'rgba(229, 184, 91, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(22, 22, width - 44, height - 44);

  // Subtle Christmas velvet crimson accent bars flanking top eyebrow (#9B1B26)
  ctx.fillStyle = '#9B1B26';
  ctx.fillRect(width / 2 - 210, 62, 34, 4);
  ctx.fillRect(width / 2 + 176, 62, 34, 4);

  // Subtle department index eyebrow
  ctx.fillStyle = '#E5B85B';
  ctx.font = '600 23px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`RAYON ${indexLabel}  ·  COLLECTION NOËL`, width / 2, 64);

  // Main luxury serif department title in warm snow cream (#FFF9F0)
  ctx.fillStyle = '#FFF9F0';
  const fontSize = title.length > 28 ? 48 : 54;
  ctx.font = `600 ${fontSize}px "Playfair Display", Georgia, serif`;
  ctx.fillText(title, width / 2, 138);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

/**
 * Generates a soft luminous radial sprite texture for drifting winter snow/gold particles.
 */
export function createParticleSpriteTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 248, 228, 1)');
  grad.addColorStop(0.32, 'rgba(246, 224, 172, 0.72)');
  grad.addColorStop(0.7, 'rgba(214, 179, 106, 0.16)');
  grad.addColorStop(1, 'rgba(214, 179, 106, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a soft radial alpha shadow map for grounded contact shadows under plinths & objects.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(8, 5, 3, 0.72)');
  grad.addColorStop(0.55, 'rgba(8, 5, 3, 0.28)');
  grad.addColorStop(1, 'rgba(8, 5, 3, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}
