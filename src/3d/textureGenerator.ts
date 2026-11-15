import * as THREE from 'three';
import { FINISHES } from '../config';

let seed = 11;
export function rnd(): number {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
}

export function resetRnd(initialSeed = 11): void {
  seed = initialSeed;
}

export function createCanvas(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, w, h);
  }
  return canvas;
}

export function createTexture(canvas: HTMLCanvasElement, rotation?: number): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  if (rotation) {
    texture.center.set(0.5, 0.5);
    texture.rotation = rotation;
  }
  return texture;
}

export function generateWoodCanvas(
  base: string,
  dk: string,
  lt: string,
  amt: number
): HTMLCanvasElement {
  return createCanvas(512, 512, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260 * amt; i++) {
      const x = rnd() * w;
      const lw = 0.5 + rnd() * 2.6;
      const d = rnd() < 0.7;
      g.strokeStyle = d
        ? `rgba(${dk},${(0.08 + rnd() * 0.3) * Math.min(1, amt + 0.2)})`
        : `rgba(${lt},${0.06 + rnd() * 0.18})`;
      g.lineWidth = lw;
      g.beginPath();
      for (let y = 0; y <= h; y += 16) {
        const xx = x + Math.sin(y / 70 + i) * 7 + Math.sin(y / 21 + i * 3) * 2;
        if (y === 0) g.moveTo(xx, y);
        else g.lineTo(xx, y);
      }
      g.stroke();
    }
  });
}

const finCache: Record<string, HTMLCanvasElement> = {};
const finTexCache: Record<string, THREE.CanvasTexture> = {};

export function getFinishTexture(key: string, rotation = 0): THREE.CanvasTexture {
  const cacheKey = `${key}_${rotation}`;
  if (!finTexCache[cacheKey]) {
    const canvasKey = `${key}_c`;
    if (!finCache[canvasKey]) {
      const finish = FINISHES[key] || FINISHES['walnut'];
      finCache[canvasKey] = generateWoodCanvas(finish.hex, finish.dkRgb, finish.ltRgb, finish.amount);
    }
    finTexCache[cacheKey] = createTexture(finCache[canvasKey], rotation);
  }
  return finTexCache[cacheKey];
}

export function generateTileCanvas(): HTMLCanvasElement {
  return createCanvas(512, 512, (g, w, h) => {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const v = 236 + Math.floor(rnd() * 6);
        g.fillStyle = `rgb(${v},${v - 3},${v - 8})`;
        g.fillRect(i * 256, j * 256, 256, 256);
      }
    }
    for (let k = 0; k < 900; k++) {
      g.fillStyle = `rgba(200,190,175,${rnd() * 0.12})`;
      g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 6, 1 + rnd() * 2);
    }
    g.fillStyle = '#d6cfc4';
    [0, 256].forEach((p) => {
      g.fillRect(p, 0, 2, h);
      g.fillRect(0, p, w, 2);
    });
  });
}

export function generateGraniteCanvas(): HTMLCanvasElement {
  return createCanvas(256, 256, (g, w, h) => {
    g.fillStyle = '#1c1b1b';
    g.fillRect(0, 0, w, h);
    for (let k = 0; k < 2600; k++) {
      const v = 40 + rnd() * 90;
      g.fillStyle = `rgba(${v},${v},${v},${0.4 + rnd() * 0.5})`;
      g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2);
    }
  });
}

export function generateRugCanvas(): HTMLCanvasElement {
  return createCanvas(256, 256, (g, w, h) => {
    g.fillStyle = '#e9e2d6';
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) {
      g.fillStyle = `rgba(120,95,60,${0.12 + rnd() * 0.12})`;
      g.fillRect(0, y, w, 2);
    }
    for (let x = 0; x < w; x += 6) {
      g.fillStyle = 'rgba(255,255,255,.08)';
      g.fillRect(x, 0, 2, h);
    }
    g.strokeStyle = 'rgba(90,60,35,.45)';
    g.lineWidth = 10;
    g.strokeRect(14, 14, w - 28, h - 28);
  });
}

export function generateArt1Canvas(): HTMLCanvasElement {
  const PI = Math.PI;
  return createCanvas(300, 400, (g) => {
    g.fillStyle = '#efe5d5';
    g.fillRect(0, 0, 300, 400);
    g.fillStyle = '#c46a43';
    g.beginPath();
    g.arc(150, 215, 95, PI, 0);
    g.fill();

    g.fillStyle = '#d9b68b';
    g.beginPath();
    g.moveTo(0, 300);
    g.quadraticCurveTo(110, 230, 300, 290);
    g.lineTo(300, 400);
    g.lineTo(0, 400);
    g.fill();

    g.fillStyle = '#7d8b6c';
    g.beginPath();
    g.moveTo(0, 340);
    g.quadraticCurveTo(170, 280, 300, 345);
    g.lineTo(300, 400);
    g.lineTo(0, 400);
    g.fill();

    g.fillStyle = '#5b3521';
    g.beginPath();
    g.arc(220, 110, 14, 0, 2 * PI);
    g.fill();
  });
}

export function generateArt2Canvas(): HTMLCanvasElement {
  const PI = Math.PI;
  return createCanvas(300, 400, (g) => {
    g.fillStyle = '#f1ebe1';
    g.fillRect(0, 0, 300, 400);
    g.strokeStyle = '#5b3521';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(150, 360);
    g.quadraticCurveTo(140, 200, 170, 50);
    g.stroke();

    for (let i = 0; i < 9; i++) {
      const y = 330 - i * 32;
      const s = i % 2 ? 1 : -1;
      g.fillStyle = i % 3 ? '#7d8b6c' : '#a8b394';
      g.save();
      g.translate(150 + i * 2, y);
      g.rotate(s * 0.7);
      g.beginPath();
      g.ellipse(s * 30, 0, 32, 11, 0, 0, 2 * PI);
      g.fill();
      g.restore();
    }
    g.fillStyle = '#c46a43';
    g.beginPath();
    g.arc(85, 80, 22, 0, 2 * PI);
    g.fill();
  });
}
