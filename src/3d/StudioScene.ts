import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  CameraViewConfig,
  FinishConfig,
  FINISHES,
  LabelMarker,
  LayoutVariant,
  LIGHTING_PRESETS,
  LIGHTING_VECTORS,
  MATERIAL_SPECS,
  ROOM_DIMENSIONS,
  TEXTILE_PALETTES,
} from '../config';
import {
  createTexture,
  generateArt1Canvas,
  generateArt2Canvas,
  generateGraniteCanvas,
  generateRugCanvas,
  generateTileCanvas,
  getFinishTexture,
  resetRnd,
  rnd,
} from './textureGenerator';

interface TweenState {
  t0: number;
  d: number;
  p0: THREE.Vector3;
  q0: THREE.Vector3;
  f0: number;
  p1: THREE.Vector3;
  q1: THREE.Vector3;
  f1: number;
}

export class StudioScene {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private allMaterials: THREE.MeshStandardMaterial[] = [];
  private layoutGroup: THREE.Group = new THREE.Group();

  // Dynamic light references
  private hemiLight: THREE.HemisphereLight;
  private sunLight: THREE.DirectionalLight;
  private c1Light: THREE.PointLight;
  private c2Light: THREE.PointLight;
  private lampLight: THREE.PointLight;
  private underCabinetLight: THREE.PointLight;

  // Dynamic materials that react to finishes/palettes/lighting
  private walHMaterial!: THREE.MeshStandardMaterial;
  private walVMaterial!: THREE.MeshStandardMaterial;
  private deskMaterial!: THREE.MeshStandardMaterial;
  private throwMaterial!: THREE.MeshStandardMaterial;
  private cushionMaterial!: THREE.MeshStandardMaterial;
  private curtainMaterial!: THREE.MeshStandardMaterial;
  private rugMaterial!: THREE.MeshStandardMaterial;
  private lampShadeMaterial!: THREE.MeshStandardMaterial;
  private wallMaterial!: THREE.MeshStandardMaterial;
  private capMaterial!: THREE.MeshStandardMaterial;
  private skirtMaterial!: THREE.MeshStandardMaterial;
  private ceilingMaterial!: THREE.MeshStandardMaterial;

  private currentLayout: LayoutVariant = 'layout-b';
  private currentPalette = 'terracotta';
  private currentFinishes = {
    bed: 'walnut',
    ward: 'walnut',
    desk: 'walnut',
  };
  private isDay = true;
  private tween: TweenState | null = null;
  private animFrameId: number | null = null;
  private isDestroyed = false;

  private width = 1;
  private height = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    resetRnd(11);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = LIGHTING_PRESETS.day.exposure;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(LIGHTING_VECTORS.skyColorHex);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.05, 100);
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.53;
    this.controls.minDistance = 0.3;
    this.controls.maxDistance = 16;

    this.setupEnvironment();
    this.setupMaterials();

    // Setup lights
    this.hemiLight = new THREE.HemisphereLight(
      LIGHTING_VECTORS.hemisphereSkyColor,
      LIGHTING_VECTORS.hemisphereGroundColor,
      LIGHTING_PRESETS.day.hemiIntensity
    );
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(LIGHTING_VECTORS.sunColor, LIGHTING_PRESETS.day.sunIntensity);
    this.sunLight.position.set(...LIGHTING_VECTORS.sunPosition);
    this.sunLight.target.position.set(...LIGHTING_VECTORS.sunTarget);
    this.scene.add(this.sunLight, this.sunLight.target);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sunLight.shadow.camera, {
      left: -6,
      right: 6,
      top: 6,
      bottom: -6,
      near: 1,
      far: 25,
    });
    this.sunLight.shadow.camera.updateProjectionMatrix();
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.02;

    this.c1Light = new THREE.PointLight(
      LIGHTING_VECTORS.pointLightColor,
      LIGHTING_PRESETS.day.c1Intensity,
      7,
      2
    );
    this.c1Light.position.set(...LIGHTING_VECTORS.c1Position);

    this.c2Light = new THREE.PointLight(
      LIGHTING_VECTORS.pointLightColor,
      LIGHTING_PRESETS.day.c2Intensity,
      6,
      2
    );
    this.c2Light.position.set(...LIGHTING_VECTORS.c2Position);

    this.lampLight = new THREE.PointLight(LIGHTING_VECTORS.lampColor, LIGHTING_PRESETS.day.lampIntensity, 3.5, 2);
    this.underCabinetLight = new THREE.PointLight(
      LIGHTING_VECTORS.underCabinetColor,
      LIGHTING_PRESETS.day.c1Intensity,
      2.2,
      2
    );
    this.scene.add(this.c1Light, this.c2Light, this.lampLight, this.underCabinetLight);

    // Build static room shell
    this.buildShell();

    // Add layout group
    this.scene.add(this.layoutGroup);

    // Build initial layout
    this.rebuildLayout(this.currentLayout);

    // Start render loop
    this.animate = this.animate.bind(this);
    this.animate(performance.now());
  }

  private registerMaterial(mat: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
    this.allMaterials.push(mat);
    return mat;
  }

  private setupEnvironment(): void {
    const envScene = new THREE.Scene();
    envScene.add(
      new THREE.Mesh(
        new THREE.BoxGeometry(10, 6, 10),
        new THREE.MeshBasicMaterial({ color: 0xbfb8ad, side: THREE.BackSide })
      )
    );
    const p1 = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    p1.position.set(4.9, 0.6, 0);
    p1.rotation.y = -Math.PI / 2;
    envScene.add(p1);

    const p2 = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: 0xe8e4de, side: THREE.DoubleSide }));
    p2.position.set(0, 2.9, 0);
    p2.rotation.x = Math.PI / 2;
    envScene.add(p2);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  }

  private setupMaterials(): void {
    const tileTexture = createTexture(generateTileCanvas());
    tileTexture.repeat.set(3.66 / 1.2, 5.27 / 1.2);

    const rugTexture = createTexture(generateRugCanvas());

    this.wallMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: MATERIAL_SPECS.wall.color,
        roughness: MATERIAL_SPECS.wall.roughness,
      })
    );
    this.capMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: MATERIAL_SPECS.cap.color,
        roughness: MATERIAL_SPECS.cap.roughness,
      })
    );
    this.skirtMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: MATERIAL_SPECS.skirting.color,
        roughness: MATERIAL_SPECS.skirting.roughness,
      })
    );
    this.ceilingMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: MATERIAL_SPECS.ceiling.color,
        roughness: MATERIAL_SPECS.ceiling.roughness,
      })
    );

    this.walHMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.55,
        map: getFinishTexture('walnut', Math.PI / 2),
      })
    );
    this.walVMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.55,
        map: getFinishTexture('walnut', 0),
      })
    );
    this.deskMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        map: getFinishTexture('walnut', Math.PI / 2),
      })
    );

    const initialPal = TEXTILE_PALETTES[this.currentPalette];
    this.throwMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({ color: initialPal.throwColor, roughness: 0.95 })
    );
    this.cushionMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({ color: initialPal.cushionColor, roughness: 0.95 })
    );
    this.curtainMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: initialPal.curtainColor,
        roughness: 1.0,
        side: THREE.DoubleSide,
      })
    );
    this.rugMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: initialPal.rugColor,
        roughness: 0.98,
        map: rugTexture,
      })
    );

    this.lampShadeMaterial = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: MATERIAL_SPECS.shade.color,
        roughness: MATERIAL_SPECS.shade.roughness,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(MATERIAL_SPECS.shade.emissive),
        emissiveIntensity: LIGHTING_PRESETS.day.shadeEmissiveIntensity,
      })
    );
  }

  private addMesh(mesh: THREE.Mesh, parent: THREE.Object3D, castShadow = true): THREE.Mesh {
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  private createBox(
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    z0: number,
    z1: number,
    mat: THREE.Material | THREE.Material[],
    parent: THREE.Object3D = this.scene,
    castShadow = true
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
    mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    return this.addMesh(mesh, parent, castShadow);
  }

  private createCylinder(
    rt: number,
    rb: number,
    h: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = this.scene,
    seg = 24
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    mesh.position.set(x, y, z);
    return this.addMesh(mesh, parent);
  }

  private createSphere(
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    parent: THREE.Object3D = this.scene
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    return this.addMesh(mesh, parent);
  }

  private createWall(
    ax: 'x' | 'z',
    a0: number,
    a1: number,
    c: number,
    y0: number,
    y1: number,
    face: '+x' | '-x' | '+z' | '-z',
    parent: THREE.Object3D = this.scene
  ): void {
    const H = ROOM_DIMENSIONS.height;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(a1 - a0, y1 - y0), this.wallMaterial);
    const mid = (y0 + y1) / 2;
    const s = face === '+x' || face === '+z' ? 1 : -1;
    const lo = (v: number, d: number) => Math.min(v, v + d);
    const hi = (v: number, d: number) => Math.max(v, v + d);

    if (ax === 'z') {
      mesh.position.set(c, mid, (a0 + a1) / 2);
      mesh.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (y0 === 0) this.createBox(lo(c, s * 0.012), hi(c, s * 0.012), 0, 0.08, a0, a1, this.skirtMaterial, parent, false);
      if (y1 === H) this.createBox(lo(c, -s * 0.18), hi(c, -s * 0.18), H, H + 0.02, a0, a1, this.capMaterial, parent, false);
    } else {
      mesh.position.set((a0 + a1) / 2, mid, c);
      mesh.rotation.y = s > 0 ? 0 : Math.PI;
      if (y0 === 0) this.createBox(a0, a1, 0, 0.08, lo(c, s * 0.012), hi(c, s * 0.012), this.skirtMaterial, parent, false);
      if (y1 === H) this.createBox(a0, a1, H, H + 0.02, lo(c, -s * 0.18), hi(c, -s * 0.18), this.capMaterial, parent, false);
    }
    this.addMesh(mesh, parent);
  }

  private createFloor(x0: number, x1: number, z0: number, z1: number, parent: THREE.Object3D = this.scene): void {
    const tileC = generateTileCanvas();
    const t = createTexture(tileC);
    t.repeat.set((x1 - x0) / 1.2, (z1 - z0) / 1.2);
    const mat = this.registerMaterial(
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.14, map: t })
    );
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
    this.addMesh(mesh, parent, false);
  }

  private createCeiling(x0: number, x1: number, z0: number, z1: number, parent: THREE.Object3D = this.scene): void {
    const H = ROOM_DIMENSIONS.height;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), this.ceilingMaterial);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set((x0 + x1) / 2, H, (z0 + z1) / 2);
    mesh.castShadow = true;
    parent.add(mesh);
  }

  private createCurtain(
    z0: number,
    z1: number,
    y0: number,
    y1: number,
    x: number,
    mat: THREE.Material,
    folds: number,
    parent: THREE.Object3D = this.scene,
    castShadow = true
  ): void {
    const g = new THREE.PlaneGeometry(z1 - z0, y1 - y0, folds * 6, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = (p.getX(i) + (z1 - z0) / 2) / (z1 - z0);
      p.setZ(i, Math.sin(u * Math.PI * 2 * folds) * 0.025);
    }
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, mat);
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.set(x, (y0 + y1) / 2, (z0 + z1) / 2);
    this.addMesh(mesh, parent, castShadow);
  }

  private createPlant(
    x: number,
    z: number,
    y0: number,
    s: number,
    kind: 'snake' | 'bush',
    parent: THREE.Object3D = this.scene
  ): void {
    const potMat = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.pot));
    const terraMat = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.terraPot));
    const leafMat = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.leaf));
    const leaf2Mat = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.leaf2));

    this.createCylinder(0.12 * s, 0.09 * s, 0.26 * s, kind === 'snake' ? potMat : terraMat, x, y0 + 0.13 * s, z, parent);
    if (kind === 'snake') {
      for (let i = 0; i < 10; i++) {
        const h = 0.7 * s * (0.7 + rnd() * 0.5);
        const mesh = new THREE.Mesh(new THREE.ConeGeometry(0.032 * s, h, 4), i % 3 ? leafMat : leaf2Mat);
        mesh.scale.z = 0.35;
        mesh.position.set(x + (rnd() - 0.5) * 0.1 * s, y0 + 0.26 * s + h / 2, z + (rnd() - 0.5) * 0.1 * s);
        mesh.rotation.set((rnd() - 0.5) * 0.35, rnd() * Math.PI, (rnd() - 0.5) * 0.35);
        this.addMesh(mesh, parent);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        const r = (0.07 + rnd() * 0.05) * s;
        this.createSphere(i % 2 ? leafMat : leaf2Mat, x + (rnd() - 0.5) * 0.16 * s, y0 + 0.3 * s + rnd() * 0.14 * s, z + (rnd() - 0.5) * 0.16 * s, r, r * 0.8, r, parent);
      }
    }
  }

  private buildShell(): void {
    const H = ROOM_DIMENSIONS.height;
    const blackM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.blackMetal));
    const graniteM = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: MATERIAL_SPECS.granite.color,
        roughness: MATERIAL_SPECS.granite.roughness,
        map: createTexture(generateGraniteCanvas()),
      })
    );
    const glassM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.glass));
    const doorM = this.registerMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.55,
        map: getFinishTexture('walnut', 0),
      })
    );
    const chromeM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.chrome));

    // Floors & Ceilings
    this.createFloor(0, 3.66, -1.67, 3.6);
    this.createFloor(-0.85, 0, 2.4, 3.6);
    this.createFloor(0.99, 3.66, -2.6, -1.67);
    this.createCeiling(0, 3.66, -1.67, 3.6);
    this.createCeiling(-0.85, 0, 2.4, 3.6);

    const blockM = [this.wallMaterial, this.wallMaterial, this.capMaterial, this.wallMaterial, this.wallMaterial, this.wallMaterial];
    this.createBox(0, 1.93, 0, H, -1.67, 0, blockM);
    this.createBox(0, 0.99, 0, H, -2.6, -1.67, blockM);

    // Walls
    this.createWall('z', 0, 2.4, 0, 0, H, '+x');
    this.createWall('x', -0.85, 0, 2.4, 0, H, '+z');
    this.createWall('z', 2.4, 3.6, -0.85, 0, H, '+x');
    this.createWall('x', -0.85, 3.66, 3.6, 0, H, '-z');
    this.createWall('z', -1.67, 1.5, 3.66, 0, H, '-x');
    this.createWall('z', 2.85, 3.6, 3.66, 0, H, '-x');
    this.createWall('z', 1.5, 2.85, 3.66, 0, 0.75, '-x');
    this.createWall('z', 1.5, 2.85, 3.66, 2.15, H, '-x');
    this.createWall('x', 3.0, 3.66, -1.67, 0, H, '+z');
    this.createWall('x', 1.93, 3.0, -1.67, 2.2, H, '+z');

    // Window with black frame, sill, glass & grill
    this.createBox(3.66, 3.86, 2.15, 2.17, 1.5, 2.85, this.wallMaterial);
    this.createBox(3.66, 3.86, 0.73, 0.75, 1.5, 2.85, this.wallMaterial);
    this.createBox(3.66, 3.86, 0.75, 2.15, 1.48, 1.5, this.wallMaterial);
    this.createBox(3.66, 3.86, 0.75, 2.15, 2.85, 2.87, this.wallMaterial);
    this.createBox(3.56, 3.86, 0.72, 0.76, 1.46, 2.89, graniteM);

    [[0.76, 0.81], [2.1, 2.15]].forEach(([a, b]) => this.createBox(3.71, 3.77, a, b, 1.5, 2.85, blackM));
    [[1.5, 1.55], [2.15, 2.2], [2.8, 2.85]].forEach(([a, b]) => this.createBox(3.71, 3.77, 0.76, 2.15, a, b, blackM));

    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.4), glassM);
    windowGlass.position.set(3.74, 1.45, 2.175);
    windowGlass.rotation.y = -Math.PI / 2;
    this.scene.add(windowGlass);

    for (let y = 0.9; y < 2.12; y += 0.17) this.createBox(3.83, 3.85, y, y + 0.018, 1.5, 2.85, blackM);
    this.createBox(3.83, 3.85, 0.75, 2.15, 1.95, 1.97, blackM);
    this.createBox(3.83, 3.85, 0.75, 2.15, 2.4, 2.42, blackM);

    // Balcony sliding door & railing
    [[1.93, 1.98], [2.45, 2.5], [2.95, 3.0]].forEach(([a, b]) => this.createBox(a, b, 0, 2.2, -1.72, -1.66, blackM));
    this.createBox(1.93, 3.0, 2.15, 2.2, -1.72, -1.66, blackM);
    this.createBox(1.93, 3.0, 0, 0.04, -1.72, -1.66, blackM);

    const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 2.15), glassM);
    doorGlass.position.set(2.465, 1.1, -1.69);
    this.scene.add(doorGlass);

    this.createBox(0.99, 3.66, 0, 1.0, -2.6, -2.58, glassM, this.scene, false);
    this.createBox(0.99, 3.66, 1.0, 1.04, -2.61, -2.57, blackM);
    this.createBox(3.64, 3.66, 0, 1.0, -2.6, -1.67, glassM, this.scene, false);

    this.createPlant(1.25, -2.35, 0, 1.1, 'bush');
    this.createPlant(1.75, -2.38, 0, 0.9, 'bush');

    // Washing machine on the balcony stand
    const rackMat = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.washerStand));
    this.createBox(3.03, 3.63, 0, 0.08, -2.56, -1.94, rackMat);
    this.createBox(3.05, 3.61, 0.08, 1.0, -2.54, -1.96, this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.washerBody)));
    this.createBox(3.07, 3.59, 1.0, 1.02, -2.4, -1.98, this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.washerLid)));
    this.createBox(3.05, 3.61, 1.0, 1.1, -2.54, -2.4, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xe6e6e4, roughness: 0.3 })));
    this.createBox(3.2, 3.46, 1.06, 1.1, -2.401, -2.399, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x2a3540, roughness: 0.2 })), this.scene, false);
    this.createBox(3.051, 3.06, 0.2, 0.95, -2.5, -2.0, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xdedcd8, roughness: 0.4 })), this.scene, false);

    // Doors
    this.createBox(-0.8, -0.04, 0, 2.1, 3.56, 3.6, doorM);
    const knob = this.createCylinder(0.02, 0.02, 0.14, chromeM, -0.12, 1.0, 3.54);
    knob.rotation.x = Math.PI / 2;
    this.createBox(1.93, 1.96, 0, 2.1, -0.75, -0.12, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xd8cfc3, roughness: 0.5 })));

    // Balcony-side face of the pantry wall
    this.createWall('x', 3.0, 3.66, -1.67, 0, H, '-z');
    this.createWall('x', 0.99, 3.0, -1.67, 2.2, H, '-z');

    // Split AC indoor unit
    const acMat = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.acBody));
    this.createBox(1.98, 2.86, 2.32, 2.62, -1.67, -1.45, acMat);
    const acFront = this.createCylinder(0.11, 0.11, 0.88, acMat, 2.42, 2.43, -1.45, this.scene, 32);
    acFront.rotation.z = Math.PI / 2;
    acFront.scale.set(1, 1, 0.8);
    this.createBox(2.0, 2.84, 2.33, 2.36, -1.48, -1.43, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x9aa0a4, roughness: 0.4 })), this.scene, false);
    this.createBox(2.02, 2.82, 2.36, 2.37, -1.442, -1.438, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x3a3f44, roughness: 0.5 })), this.scene, false);
    this.createBox(2.66, 2.76, 2.5, 2.53, -1.448, -1.444, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x7fd3ff, roughness: 0.2, emissive: 0x5fc2ff, emissiveIntensity: 0.8 })), this.scene, false);
    const acPipe = this.createCylinder(0.012, 0.012, 0.5, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })), 2.88, 2.47, -1.6);
    acPipe.rotation.z = Math.PI / 2;

    // AC outdoor unit
    const outdoorMat = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.acOutdoor));
    this.createBox(3.06, 3.62, 1.32, 1.86, -1.97, -1.68, outdoorMat);
    const acGrill = this.createCylinder(0.2, 0.2, 0.02, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x3b3e41, roughness: 0.6 })), 3.24, 1.59, -1.97, this.scene, 32);
    acGrill.rotation.x = Math.PI / 2;
    for (let i = -2; i <= 2; i++) {
      this.createBox(3.05, 3.43, 1.59 + i * 0.07, 1.6 + i * 0.07, -1.985, -1.98, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x55595c, roughness: 0.5 })), this.scene, false);
    }
    [3.1, 3.58].forEach((x) => this.createBox(x - 0.015, x + 0.015, 1.26, 1.32, -2.0, -1.68, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x2b2b2d, roughness: 0.5, metalness: 0.5 }))));

    // RO water purifier
    const roMat = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.roPurifier));
    this.createBox(3.42, 3.66, 1.3, 1.82, -1.6, -1.28, roMat);
    this.createBox(3.415, 3.42, 1.38, 1.74, -1.57, -1.31, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x2f6f86, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.9 })), this.scene, false);
    this.createBox(3.414, 3.416, 1.76, 1.79, -1.52, -1.36, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x1e8fc8, roughness: 0.3 })), this.scene, false);
    const roTap1 = this.createCylinder(0.012, 0.012, 0.08, chromeM, 3.38, 1.27, -1.44);
    roTap1.rotation.z = Math.PI / 2;
    this.createCylinder(0.01, 0.01, 0.06, chromeM, 3.34, 1.24, -1.44);
    this.createBox(3.43, 3.45, 1.22, 1.3, -1.47, -1.41, chromeM, this.scene, false);

    // Pantry counter & base cabinets (common to both)
    const whiteGloss = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.whiteGloss));
    const steelM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.steel));
    this.createBox(3.08, 3.66, 0, 0.82, -1.62, -0.05, whiteGloss);
    this.createBox(3.04, 3.66, 0.82, 0.86, -1.64, -0.05, graniteM);
    this.createBox(3.075, 3.08, 0.5, 0.52, -1.6, -0.07, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x8d8a85, roughness: 0.5 })), this.scene, false);
    this.createBox(3.075, 3.08, 0.05, 0.8, -1.0, -0.98, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x8d8a85, roughness: 0.5 })), this.scene, false);
    this.createBox(3.075, 3.08, 0.05, 0.8, -0.55, -0.53, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x8d8a85, roughness: 0.5 })), this.scene, false);
    this.createBox(3.18, 3.58, 0.832, 0.866, -1.48, -1.02, steelM);
    this.createCylinder(0.015, 0.015, 0.22, chromeM, 3.6, 0.97, -1.25);
    this.createBox(3.47, 3.6, 1.06, 1.08, -1.26, -1.24, chromeM);
  }

  public rebuildLayout(layoutVariant: LayoutVariant): void {
    this.currentLayout = layoutVariant;
    while (this.layoutGroup.children.length > 0) {
      const child = this.layoutGroup.children[0];
      this.layoutGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }

    if (layoutVariant === 'layout-b') {
      this.buildLayoutB(this.layoutGroup);
      this.lampLight.position.set(0.27, 0.82, 2.18);
      this.underCabinetLight.position.set(3.4, 1.4, -0.8);
    } else {
      this.buildLayoutA(this.layoutGroup);
      this.lampLight.position.set(2.275, 0.82, 3.36);
      this.underCabinetLight.position.set(3.4, 1.42, -0.6);
    }
  }

  private buildLayoutB(parent: THREE.Group): void {
    const whiteGloss = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.whiteGloss));
    const chrome = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.chrome));
    const sheet = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.sheet));
    const oak = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.oak));
    const blackM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.blackMetal));
    const screenM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.screen));
    const mirror = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.mirror));
    const darkWood = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.woodSubtleDark));
    const chairM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.chair));
    const strapM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.strap));
    const coirM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.coir));
    const sheerM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.sheer));

    const artM1 = this.registerMaterial(
      new THREE.MeshStandardMaterial({ roughness: 0.9, map: createTexture(generateArt1Canvas()) })
    );
    const artM2 = this.registerMaterial(
      new THREE.MeshStandardMaterial({ roughness: 0.9, map: createTexture(generateArt2Canvas()) })
    );

    // Top units in pantry
    this.createBox(3.33, 3.66, 1.85, 2.2, -1.2, -0.05, whiteGloss, parent);
    this.createBox(3.33, 3.66, 1.5, 1.85, -1.2, -0.6, whiteGloss, parent);
    this.createBox(3.3, 3.66, 1.48, 1.5, -0.6, -0.05, whiteGloss, parent);
    this.createBox(3.3, 3.66, 1.48, 1.85, -0.07, -0.05, whiteGloss, parent);
    this.createBox(3.325, 3.33, 1.87, 2.18, -0.629, -0.621, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x8d8a85, roughness: 0.5 })), parent, false);
    this.createBox(3.325, 3.33, 1.848, 1.852, -1.18, -0.07, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x8d8a85, roughness: 0.5 })), parent, false);
    this.createBox(3.34, 3.36, 1.47, 1.48, -1.18, -0.07, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xfff4dc, roughness: 0.5, emissive: 0xffe2b0, emissiveIntensity: 1 })), parent, false);

    // Oven in niche
    this.createBox(3.28, 3.64, 1.5, 1.78, -0.55, -0.1, this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.ovenBody)), parent);
    this.createBox(3.275, 3.28, 1.53, 1.75, -0.52, -0.2, this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.ovenGlass)), parent, false);
    this.createBox(3.275, 3.28, 1.53, 1.75, -0.19, -0.12, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4 })), parent, false);

    // Induction stove
    this.createBox(3.13, 3.5, 0.86, 0.92, -0.98, -0.66, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x121214, roughness: 0.12, metalness: 0.2 })), parent);
    const indRing = this.createCylinder(0.105, 0.105, 0.003, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x5a5a60, roughness: 0.3 })), 3.32, 0.922, -0.82, parent, 40);
    indRing.castShadow = false;
    this.createBox(3.12, 3.13, 0.875, 0.905, -0.92, -0.72, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x2c2c30, roughness: 0.3 })), parent, false);

    // Double bed (2 singles joined on left wall)
    const buildBedZ = (z0: number) => {
      const z1 = z0 + 0.95;
      this.createBox(0.06, 2.0, 0.05, 0.34, z0, z1, this.walHMaterial, parent);
      this.createBox(0.1, 1.96, 0, 0.05, z0 + 0.04, z1 - 0.04, darkWood, parent);
      this.createBox(0, 0.06, 0, 0.86, z0, z1, this.walHMaterial, parent);
      this.createBox(0.08, 1.98, 0.34, 0.52, z0 + 0.02, z1 - 0.02, sheet, parent);
    };
    const BZ0 = 0.05;
    const BZ1 = 1.95;
    const BC = (BZ0 + BZ1) / 2;
    buildBedZ(BZ0);
    buildBedZ(BZ0 + 0.95);

    this.createBox(0.6, 2.015, 0.42, 0.57, BZ0 - 0.015, BZ1 + 0.015, this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.duvet)), parent);
    this.createBox(0.6, 0.78, 0.57, 0.59, BZ0 - 0.008, BZ1 + 0.008, sheet, parent);
    this.createBox(1.6, 2.02, 0.44, 0.582, BZ0 - 0.02, BZ1 + 0.02, this.throwMaterial, parent);

    [BC - 0.48, BC + 0.48].forEach((z) => {
      const p = this.createSphere(sheet, 0.25, 0.7, z, 0.07, 0.17, 0.36, parent);
      p.rotation.z = 0.38;
    });
    [[BC - 0.42, this.cushionMaterial], [BC, this.throwMaterial], [BC + 0.42, this.cushionMaterial]].forEach(([z, m]) => {
      const c = this.createSphere(m as THREE.Material, 0.42, 0.69, z as number, 0.06, 0.17, 0.17, parent);
      c.rotation.z = 0.28;
    });

    // Side table
    this.createBox(0.05, 0.5, 0.03, 0.5, 1.97, 2.4, this.walHMaterial, parent);
    this.createBox(0.07, 0.48, 0, 0.03, 1.99, 2.38, darkWood, parent);
    this.createBox(0.5, 0.505, 0.265, 0.275, 1.99, 2.38, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.6 })), parent, false);
    this.createBox(0.5, 0.515, 0.37, 0.385, 2.11, 2.26, chrome, parent);
    this.createBox(0.5, 0.515, 0.15, 0.165, 2.11, 2.26, chrome, parent);
    this.createCylinder(0.055, 0.065, 0.22, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xd8cdbd, roughness: 0.4 })), 0.27, 0.61, 2.18, parent);
    const shadeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.18, 32, 1, true), this.lampShadeMaterial);
    shadeMesh.position.set(0.27, 0.8, 2.18);
    this.addMesh(shadeMesh, parent, false);

    // Wall art above headboard
    [[BC - 0.33, artM1], [BC + 0.33, artM2]].forEach(([cz, m]) => {
      this.createBox(0, 0.035, 1.32, 2.0, (cz as number) - 0.26, (cz as number) + 0.26, oak, parent);
      const a = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.6), m as THREE.Material);
      a.position.set(0.037, 1.66, cz as number);
      a.rotation.y = Math.PI / 2;
      parent.add(a);
    });

    // TV unit + fridge
    this.createBox(3.06, 3.66, 0.95, 0.99, 0.02, 1.47, this.walHMaterial, parent);
    this.createBox(3.08, 3.66, 0, 0.95, 0.58, 0.6, this.walHMaterial, parent);
    this.createBox(3.62, 3.66, 0, 0.95, 0.02, 0.58, darkWood, parent, false);
    this.createBox(3.08, 3.66, 0, 0.95, 0.6, 1.47, this.walHMaterial, parent);
    this.createBox(3.075, 3.08, 0.47, 0.48, 0.62, 1.45, darkWood, parent, false);
    this.createBox(3.06, 3.075, 0.7, 0.715, 0.96, 1.12, chrome, parent);
    this.createBox(3.06, 3.075, 0.25, 0.265, 0.96, 1.12, chrome, parent);

    // Fridge
    this.createBox(3.13, 3.6, 0.02, 0.88, 0.06, 0.55, this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.fridge)), parent);
    this.createBox(3.11, 3.13, 0.45, 0.78, 0.47, 0.495, chrome, parent);
    this.createPlant(3.42, 1.33, 0.99, 0.4, 'bush', parent);
    this.createBox(3.2, 3.5, 0.99, 1.05, 1.0, 1.15, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x7d8b6c, roughness: 0.8 })), parent);
    this.createBox(3.22, 3.48, 1.05, 1.09, 1.0, 1.15, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xb85c38, roughness: 0.8 })), parent);

    // TV
    this.createBox(3.61, 3.66, 1.12, 1.68, 0.47, 1.43, blackM, parent);
    this.createBox(3.607, 3.61, 1.135, 1.665, 0.485, 1.415, screenM, parent, false);

    // Wardrobe moved to far wall
    this.createBox(2.7, 3.6, 0, 2.05, 3.04, 3.6, this.walVMaterial, parent);
    this.createBox(2.69, 3.61, 2.05, 2.08, 3.03, 3.6, darkWood, parent);
    this.createBox(3.147, 3.153, 0.04, 2.02, 3.032, 3.04, darkWood, parent, false);
    this.createBox(3.25, 3.5, 0.95, 1.9, 3.03, 3.04, mirror, parent, false);
    this.createBox(3.11, 3.125, 0.95, 1.25, 3.02, 3.04, chrome, parent);
    this.createBox(3.175, 3.19, 0.95, 1.25, 3.02, 3.04, chrome, parent);
    this.createPlant(3.15, 3.32, 2.08, 0.7, 'bush', parent);

    // Desk on far wall
    this.createBox(1.6, 2.35, 0.73, 0.76, 3.1, 3.6, this.deskMaterial, parent);
    const brMat = this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x1b1b1c, roughness: 0.45, metalness: 0.4 }));
    [1.68, 2.27].forEach((x) => {
      this.createBox(x - 0.012, x + 0.012, 0.38, 0.73, 3.57, 3.6, brMat, parent);
      this.createBox(x - 0.012, x + 0.012, 0.705, 0.73, 3.14, 3.6, brMat, parent);
      const d = this.createBox(x - 0.011, x + 0.011, 0.565, 0.59, 3.13, 3.6, brMat, parent);
      d.position.set(x, 0.575, 3.39);
      d.rotation.x = 0.62;
      const d2 = this.createBox(x - 0.011, x + 0.011, 0.6, 0.62, 3.38, 3.6, brMat, parent);
      d2.position.set(x, 0.64, 3.48);
      d2.rotation.x = 0.62;
    });

    // Chair
    this.createBox(1.76, 2.18, 0.42, 0.46, 2.6, 3.02, chairM, parent);
    const bk = this.createBox(1.79, 2.15, 0.46, 0.92, 2.6, 2.64, chairM, parent);
    bk.rotation.x = -0.12;
    [[1.78, 2.62], [2.16, 2.62], [1.78, 3.0], [2.16, 3.0]].forEach(([x, z]) => this.createBox(x - 0.015, x + 0.015, 0, 0.42, z - 0.015, z + 0.015, chairM, parent));

    this.createCylinder(0.05, 0.06, 0.02, blackM, 1.7, 0.77, 3.48, parent);
    this.createCylinder(0.007, 0.007, 0.3, blackM, 1.7, 0.92, 3.48, parent);
    const lampHead = this.createCylinder(0.02, 0.07, 0.1, blackM, 1.74, 1.06, 3.43, parent);
    lampHead.rotation.x = 0.6;
    this.createPlant(2.25, 3.45, 0.76, 0.4, 'bush', parent);
    this.createBox(1.85, 2.1, 0.76, 0.775, 3.25, 3.45, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xe9e1d4, roughness: 0.8 })), parent);

    const roundFrame = this.createCylinder(0.27, 0.27, 0.02, oak, 1.975, 1.5, 3.59, parent, 48);
    roundFrame.rotation.x = Math.PI / 2;
    const roundMirror = this.createCylinder(0.25, 0.25, 0.022, mirror, 1.975, 1.5, 3.587, parent, 48);
    roundMirror.rotation.x = Math.PI / 2;

    // Pantry accessories
    this.createCylinder(0.075, 0.085, 0.22, whiteGloss, 3.45, 0.97, -0.2, parent);
    this.createBox(3.2, 3.42, 0.86, 0.875, -0.55, -0.33, oak, parent);
    this.createCylinder(0.035, 0.035, 0.08, this.throwMaterial, 3.27, 0.915, -0.44, parent);
    this.createCylinder(0.035, 0.035, 0.08, this.cushionMaterial, 3.36, 0.915, -0.44, parent);

    // TV ledge + flower pots
    const flMats = MATERIAL_SPECS.flowerColors.map((c) =>
      this.registerMaterial(new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }))
    );
    const makePot = (x: number, y: number, z: number, i: number) => {
      this.createCylinder(0.045, 0.034, 0.085, i % 2 ? this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.pot)) : this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.terraPot)), x, y + 0.0425, z, parent);
      this.createSphere(this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.leaf)), x, y + 0.11, z, 0.055, 0.035, 0.055, parent);
      this.createSphere(this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.leaf2)), x + 0.02, y + 0.125, z - 0.015, 0.03, 0.025, 0.03, parent);
      [[0, 0], [0.025, 0.02], [-0.022, 0.018], [0.01, -0.026]].forEach(([a, b]) => {
        this.createSphere(flMats[i % 4], x + a, y + 0.145, z + b, 0.018, 0.014, 0.018, parent);
      });
    };
    this.createBox(3.48, 3.66, 1.82, 1.85, 0.38, 1.47, this.walHMaterial, parent);
    this.createBox(3.48, 3.5, 1.795, 1.82, 0.38, 1.47, this.walHMaterial, parent);
    [0.52, 0.8, 1.08, 1.34].forEach((z, i) => makePot(3.57, 1.85, z, i));

    // Rug & Curtains & Add-ons
    this.createBox(1.3, 2.95, 0, 0.012, 0.25, 1.75, this.rugMaterial, parent, false);
    this.createBox(3.585, 3.6, 2.36, 2.38, 1.42, 3.02, blackM, parent);
    this.createCurtain(1.5, 1.85, 0.03, 2.34, 3.56, this.curtainMaterial, 3, parent, true);
    this.createCurtain(2.85, 3.02, 0.03, 2.34, 3.56, this.curtainMaterial, 2, parent, true);
    this.createCurtain(1.85, 2.85, 0.03, 2.34, 3.6, sheerM, 6, parent, false);
    this.createPlant(2.5, 3.35, 0, 1.2, 'snake', parent);

    // Foyer
    [2.47, 2.85].forEach((z) => {
      this.createBox(-0.78, -0.18, 0.49, 0.51, z - 0.012, z + 0.012, oak, parent);
      [-0.55, 0.55].forEach((a) => {
        const l = this.createBox(-0.493, -0.467, 0, 0.6, z - 0.012, z + 0.012, oak, parent);
        l.position.y = 0.25;
        l.rotation.z = a;
      });
    });
    [-0.66, -0.48, -0.3].forEach((x) => this.createBox(x - 0.03, x + 0.03, 0.505, 0.513, 2.47, 2.85, strapM, parent));
    this.createBox(-0.85, -0.83, 0.3, 1.8, 2.98, 3.38, oak, parent);
    this.createBox(-0.83, -0.825, 0.32, 1.78, 3.0, 3.36, mirror, parent, false);
    [2.55, 2.7, 2.85].forEach((z) => {
      const hook = this.createCylinder(0.012, 0.012, 0.06, blackM, -0.82, 1.75, z, parent);
      hook.rotation.z = Math.PI / 2;
    });
    this.createBox(-0.7, -0.15, 0, 0.012, 3.0, 3.5, coirM, parent, false);
  }

  private buildLayoutA(parent: THREE.Group): void {
    const whiteGloss = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.whiteGloss));
    const chrome = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.chrome));
    const sheet = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.sheet));
    const oak = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.oak));
    const blackM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.blackMetal));
    const screenM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.screen));
    const mirror = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.mirror));
    const darkWood = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.woodSubtleDark));
    const chairM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.chair));
    const strapM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.strap));
    const coirM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.coir));
    const sheerM = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.sheer));
    const rackMat = this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.washerStand));

    const artM1 = this.registerMaterial(
      new THREE.MeshStandardMaterial({ roughness: 0.9, map: createTexture(generateArt1Canvas()) })
    );
    const artM2 = this.registerMaterial(
      new THREE.MeshStandardMaterial({ roughness: 0.9, map: createTexture(generateArt2Canvas()) })
    );

    // Wardrobe in Layout A (shifted towards window)
    this.createBox(3.08, 3.64, 0, 2.05, 0.58, 1.48, this.walVMaterial, parent);
    this.createBox(3.08, 3.64, 2.05, 2.08, 0.57, 1.49, darkWood, parent);
    this.createBox(3.072, 3.08, 0.04, 2.02, 1.027, 1.033, darkWood, parent, false);
    this.createBox(3.07, 3.08, 0.95, 1.9, 0.63, 0.87, mirror, parent, false);
    this.createBox(3.05, 3.07, 0.95, 1.25, 0.99, 1.005, chrome, parent);
    this.createBox(3.05, 3.07, 0.95, 1.25, 1.055, 1.07, chrome, parent);
    this.createPlant(3.36, 1.03, 2.08, 0.7, 'bush', parent);

    // Top units above counter
    this.createBox(3.33, 3.66, 1.5, 2.2, -1.2, -0.05, whiteGloss, parent);
    this.createBox(3.325, 3.33, 1.52, 2.18, -0.629, -0.621, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x8d8a85, roughness: 0.5 })), parent, false);
    this.createBox(3.325, 3.33, 1.52, 1.54, -1.18, -0.07, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x8d8a85, roughness: 0.5 })), parent, false);
    this.createBox(3.34, 3.36, 1.49, 1.5, -1.18, -0.07, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xfff4dc, roughness: 0.5, emissive: 0xffe2b0, emissiveIntensity: 1 })), parent, false);

    // Induction stove
    this.createBox(3.13, 3.5, 0.86, 0.92, -0.48, -0.16, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x121214, roughness: 0.12, metalness: 0.2 })), parent);
    const indRing = this.createCylinder(0.105, 0.105, 0.003, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x5a5a60, roughness: 0.3 })), 3.32, 0.922, -0.32, parent, 40);
    indRing.castShadow = false;
    this.createBox(3.12, 3.13, 0.875, 0.905, -0.42, -0.22, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x2c2c30, roughness: 0.3 })), parent, false);

    // Appliance rack with fridge on raised base, oven shelf above
    [[3.1, 0.04], [3.62, 0.04], [3.1, 0.55], [3.62, 0.55]].forEach(([x, z]) => this.createBox(x - 0.012, x + 0.012, 0, 1.86, z - 0.012, z + 0.012, rackMat, parent));
    [0.1, 1.1, 1.6, 1.85].forEach((y) => this.createBox(3.09, 3.63, y, y + 0.025, 0.03, 0.56, rackMat, parent));
    [[3.12, 0.06], [3.6, 0.06], [3.12, 0.53], [3.6, 0.53]].forEach(([x, z]) => this.createCylinder(0.025, 0.025, 0.04, blackM, x, 0.03, z, parent));

    // Bed facing pantry (headboard against far wall, along X)
    const buildBedX = (x0: number) => {
      const z0 = 1.6;
      const z1 = 3.55;
      const x1 = x0 + 0.95;
      this.createBox(x0, x1, 0.05, 0.34, z0, z1, this.walHMaterial, parent);
      this.createBox(x0 + 0.04, x1 - 0.04, 0, 0.05, z0 + 0.04, z1 - 0.04, darkWood, parent);
      this.createBox(x0, x1, 0, 0.86, z1, 3.6, this.walHMaterial, parent);
      this.createBox(x0 + 0.02, x1 - 0.02, 0.34, 0.52, z0 + 0.02, z1 - 0.02, sheet, parent);
    };
    const BX0 = 0.8;
    const BX1 = 2.7;
    const BC = (BX0 + BX1) / 2;
    buildBedX(BX0);
    buildBedX(BX0 + 0.95);

    this.createBox(BX0 - 0.015, BX1 + 0.015, 0.42, 0.57, 1.585, 3.0, this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.duvet)), parent);
    this.createBox(BX0 - 0.008, BX1 + 0.008, 0.57, 0.59, 2.82, 3.0, sheet, parent);
    this.createBox(BX0 - 0.02, BX1 + 0.02, 0.44, 0.582, 1.72, 2.12, this.throwMaterial, parent);

    [BC - 0.48, BC + 0.48].forEach((x) => {
      const p = this.createSphere(sheet, x, 0.7, 3.4, 0.36, 0.17, 0.07, parent);
      p.rotation.x = 0.38;
    });
    [[BC - 0.42, this.cushionMaterial], [BC, this.throwMaterial], [BC + 0.42, this.cushionMaterial]].forEach(([x, m]) => {
      const c = this.createSphere(m as THREE.Material, x as number, 0.69, 3.24, 0.17, 0.17, 0.06, parent);
      c.rotation.x = 0.28;
    });

    // Side table on window side
    this.createBox(2.75, 3.2, 0.03, 0.5, 3.1, 3.55, this.walHMaterial, parent);
    this.createBox(2.77, 3.18, 0, 0.03, 3.12, 3.53, darkWood, parent);
    this.createBox(2.75, 3.2, 0.265, 0.275, 3.095, 3.1, darkWood, parent, false);
    this.createBox(2.9, 3.05, 0.37, 0.385, 3.08, 3.095, chrome, parent);
    this.createBox(2.9, 3.05, 0.15, 0.165, 3.08, 3.095, chrome, parent);
    this.createCylinder(0.055, 0.065, 0.22, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xd8cdbd, roughness: 0.4 })), 2.975, 0.61, 3.36, parent);
    const shadeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.18, 32, 1, true), this.lampShadeMaterial);
    shadeMesh.position.set(2.975, 0.8, 3.36);
    this.addMesh(shadeMesh, parent, false);

    // Art over beds
    [[BC - 0.33, artM1], [BC + 0.33, artM2]].forEach(([cx, m]) => {
      this.createBox((cx as number) - 0.26, (cx as number) + 0.26, 1.32, 2.0, 3.565, 3.6, oak, parent);
      const a = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.6), m as THREE.Material);
      a.position.set(cx as number, 1.66, 3.563);
      a.rotation.y = Math.PI;
      parent.add(a);
    });

    // TV on toilet wall facing bed + floating shelf
    this.createBox(0.95, 1.91, 0.95, 1.51, 0, 0.05, blackM, parent);
    this.createBox(0.965, 1.895, 0.965, 1.495, 0.05, 0.053, screenM, parent, false);
    this.createBox(0.95, 1.92, 0.66, 0.69, 0, 0.22, this.walHMaterial, parent);
    this.createBox(1.05, 1.25, 0.69, 0.72, 0.04, 0.18, whiteGloss, parent);
    this.createBox(1.7, 1.75, 0.69, 0.76, 0.03, 0.19, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x7d8b6c, roughness: 0.8 })), parent);
    this.createBox(1.75, 1.81, 0.69, 0.74, 0.03, 0.19, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xb85c38, roughness: 0.8 })), parent);
    this.createPlant(1.5, 0.11, 0.69, 0.45, 'bush', parent);

    // Wall-mounted folding desk on left wall
    this.createBox(0, 0.5, 0.73, 0.76, 0.6, 1.35, this.deskMaterial, parent);
    const brMat = this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x1b1b1c, roughness: 0.45, metalness: 0.4 }));
    [0.68, 1.27].forEach((z) => {
      this.createBox(0, 0.03, 0.38, 0.73, z - 0.012, z + 0.012, brMat, parent);
      this.createBox(0, 0.46, 0.705, 0.73, z - 0.012, z + 0.012, brMat, parent);
      const d = this.createBox(0, 0.47, 0.565, 0.59, z - 0.011, z + 0.011, brMat, parent);
      d.position.set(0.21, 0.575, z);
      d.rotation.z = 0.62;
      const d2 = this.createBox(0, 0.22, 0.6, 0.62, z - 0.011, z + 0.011, brMat, parent);
      d2.position.set(0.12, 0.64, z);
      d2.rotation.z = 0.62;
    });

    // Chair
    this.createBox(0.56, 0.98, 0.42, 0.46, 0.76, 1.2, chairM, parent);
    const bk = this.createBox(0.95, 0.99, 0.46, 0.92, 0.79, 1.17, chairM, parent);
    bk.rotation.z = -0.12;
    [[0.58, 0.78], [0.96, 0.78], [0.58, 1.18], [0.96, 1.18]].forEach(([x, z]) => this.createBox(x - 0.015, x + 0.015, 0, 0.42, z - 0.015, z + 0.015, chairM, parent));

    this.createCylinder(0.05, 0.06, 0.02, blackM, 0.12, 0.77, 0.72, parent);
    this.createCylinder(0.007, 0.007, 0.3, blackM, 0.12, 0.92, 0.72, parent);
    const lampHead = this.createCylinder(0.02, 0.07, 0.1, blackM, 0.17, 1.06, 0.76, parent);
    lampHead.rotation.x = -0.6;
    this.createPlant(0.13, 1.24, 0.76, 0.4, 'bush', parent);
    this.createBox(0.1, 0.36, 0.76, 0.775, 0.92, 1.12, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xe9e1d4, roughness: 0.8 })), parent);

    const deskMirrorFrame = this.createCylinder(0.27, 0.27, 0.02, oak, 0.012, 1.5, 0.95, parent, 48);
    deskMirrorFrame.rotation.z = Math.PI / 2;
    const deskMirror = this.createCylinder(0.25, 0.25, 0.022, mirror, 0.014, 1.5, 0.95, parent, 48);
    deskMirror.rotation.z = Math.PI / 2;

    // Fridge between wardrobe and window
    this.createBox(3.11, 3.6, 0.125, 0.985, 0.06, 0.53, this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.fridge)), parent);
    this.createBox(3.09, 3.11, 0.55, 0.88, 0.46, 0.485, chrome, parent);

    // Oven on rack shelf
    this.createBox(3.18, 3.58, 1.125, 1.405, 0.07, 0.52, this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.ovenBody)), parent);
    this.createBox(3.175, 3.18, 1.16, 1.37, 0.1, 0.41, this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.ovenGlass)), parent, false);
    this.createBox(3.175, 3.18, 1.16, 1.37, 0.42, 0.5, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4 })), parent, false);

    // Pantry accessories
    this.createCylinder(0.075, 0.085, 0.22, whiteGloss, 3.45, 0.97, -0.62, parent);
    this.createBox(3.2, 3.42, 0.86, 0.875, -0.92, -0.7, oak, parent);
    this.createCylinder(0.035, 0.035, 0.08, this.throwMaterial, 3.27, 0.915, -0.8, parent);
    this.createCylinder(0.035, 0.035, 0.08, this.cushionMaterial, 3.36, 0.915, -0.8, parent);
    this.createBox(3.15, 3.6, 1.625, 1.82, 0.08, 0.28, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xc8ab7f, roughness: 0.95 })), parent);
    this.createBox(3.15, 3.6, 1.625, 1.82, 0.31, 0.52, this.registerMaterial(new THREE.MeshStandardMaterial({ color: 0xc8ab7f, roughness: 0.95 })), parent);

    // Ledge above TV with flower pots
    const flMats = MATERIAL_SPECS.flowerColors.map((c) =>
      this.registerMaterial(new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }))
    );
    const makePot = (x: number, y: number, z: number, i: number) => {
      this.createCylinder(0.045, 0.034, 0.085, i % 2 ? this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.pot)) : this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.terraPot)), x, y + 0.0425, z, parent);
      this.createSphere(this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.leaf)), x, y + 0.11, z, 0.055, 0.035, 0.055, parent);
      this.createSphere(this.registerMaterial(new THREE.MeshStandardMaterial(MATERIAL_SPECS.leaf2)), x + 0.02, y + 0.125, z - 0.015, 0.03, 0.025, 0.03, parent);
      [[0, 0], [0.025, 0.02], [-0.022, 0.018], [0.01, -0.026]].forEach(([a, b]) => {
        this.createSphere(flMats[i % 4], x + a, y + 0.145, z + b, 0.018, 0.014, 0.018, parent);
      });
    };
    this.createBox(0.9, 1.92, 1.65, 1.68, 0, 0.18, this.walHMaterial, parent);
    this.createBox(0.9, 1.92, 1.625, 1.65, 0.16, 0.18, this.walHMaterial, parent);
    [1.04, 1.3, 1.56, 1.8].forEach((x, i) => makePot(x, 1.68, 0.09, i));

    // Rug & Curtains & Add-ons
    this.createBox(1.05, 2.6, 0, 0.012, 0.5, 1.45, this.rugMaterial, parent, false);
    this.createBox(3.585, 3.6, 2.36, 2.38, 1.42, 3.3, blackM, parent);
    this.createCurtain(1.5, 1.85, 0.03, 2.34, 3.56, this.curtainMaterial, 3, parent, true);
    this.createCurtain(2.85, 3.28, 0.03, 2.34, 3.56, this.curtainMaterial, 3, parent, true);
    this.createCurtain(1.85, 2.85, 0.03, 2.34, 3.6, sheerM, 6, parent, false);
    this.createPlant(3.4, 3.35, 0, 1.2, 'snake', parent);

    // Foyer
    [2.47, 2.85].forEach((z) => {
      this.createBox(-0.78, -0.18, 0.49, 0.51, z - 0.012, z + 0.012, oak, parent);
      [-0.55, 0.55].forEach((a) => {
        const l = this.createBox(-0.493, -0.467, 0, 0.6, z - 0.012, z + 0.012, oak, parent);
        l.position.y = 0.25;
        l.rotation.z = a;
      });
    });
    [-0.66, -0.48, -0.3].forEach((x) => this.createBox(x - 0.03, x + 0.03, 0.505, 0.513, 2.47, 2.85, strapM, parent));
    this.createBox(-0.85, -0.83, 0.3, 1.8, 2.98, 3.38, oak, parent);
    this.createBox(-0.83, -0.825, 0.32, 1.78, 3.0, 3.36, mirror, parent, false);
    [2.55, 2.7, 2.85].forEach((z) => {
      const hook = this.createCylinder(0.012, 0.012, 0.06, blackM, -0.82, 1.75, z, parent);
      hook.rotation.z = Math.PI / 2;
    });
    this.createBox(-0.7, -0.15, 0, 0.012, 3.0, 3.5, coirM, parent, false);
  }

  public setLight(isDay: boolean): void {
    this.isDay = isDay;
    const preset = isDay ? LIGHTING_PRESETS.day : LIGHTING_PRESETS.eve;
    this.sunLight.intensity = preset.sunIntensity;
    this.hemiLight.intensity = preset.hemiIntensity;
    this.c1Light.intensity = preset.c1Intensity;
    this.c2Light.intensity = preset.c2Intensity;
    this.lampLight.intensity = preset.lampIntensity;
    this.renderer.toneMappingExposure = preset.exposure;
    this.lampShadeMaterial.emissiveIntensity = preset.shadeEmissiveIntensity;
    this.scene.background = new THREE.Color(preset.bgColor);

    this.allMaterials.forEach((m) => {
      m.envMapIntensity = preset.envMapIntensity;
    });
  }

  public setPalette(paletteKey: string): void {
    const pal = TEXTILE_PALETTES[paletteKey];
    if (!pal) return;
    this.currentPalette = paletteKey;
    this.throwMaterial.color.setHex(pal.throwColor);
    this.cushionMaterial.color.setHex(pal.cushionColor);
    this.curtainMaterial.color.setHex(pal.curtainColor);
    this.rugMaterial.color.setHex(pal.rugColor);
  }

  public setFinish(group: 'all' | 'bed' | 'ward' | 'desk', finishKey: string): void {
    if (!FINISHES[finishKey]) return;

    if (group === 'all' || group === 'bed') {
      this.currentFinishes.bed = finishKey;
      this.walHMaterial.map = getFinishTexture(finishKey, Math.PI / 2);
      this.walHMaterial.needsUpdate = true;
    }
    if (group === 'all' || group === 'ward') {
      this.currentFinishes.ward = finishKey;
      this.walVMaterial.map = getFinishTexture(finishKey, 0);
      this.walVMaterial.needsUpdate = true;
    }
    if (group === 'all' || group === 'desk') {
      this.currentFinishes.desk = finishKey;
      this.deskMaterial.map = getFinishTexture(finishKey, Math.PI / 2);
      this.deskMaterial.needsUpdate = true;
    }
  }

  public getFinishes(): { bed: FinishConfig; ward: FinishConfig; desk: FinishConfig; isMixed: boolean } {
    const bed = FINISHES[this.currentFinishes.bed];
    const ward = FINISHES[this.currentFinishes.ward];
    const desk = FINISHES[this.currentFinishes.desk];
    const isMixed = !(this.currentFinishes.bed === this.currentFinishes.ward && this.currentFinishes.bed === this.currentFinishes.desk);
    return { bed, ward, desk, isMixed };
  }

  public getIsDay(): boolean {
    return this.isDay;
  }

  public setCameraView(view: CameraViewConfig, instant = false): void {
    const p1 = new THREE.Vector3(...view.position);
    const q1 = new THREE.Vector3(...view.target);

    if (instant) {
      this.camera.position.copy(p1);
      this.controls.target.copy(q1);
      this.camera.fov = view.fov;
      this.camera.updateProjectionMatrix();
      return;
    }

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.tween = {
      t0: performance.now(),
      d: reduceMotion ? 1 : 1100,
      p0: this.camera.position.clone(),
      q0: this.controls.target.clone(),
      f0: this.camera.fov,
      p1,
      q1,
      f1: view.fov,
    };
    this.controls.enabled = false;
  }

  public projectLabels(
    labels: LabelMarker[],
    showCategory: Record<'yours' | 'new' | 'room', boolean>,
    captionsOn: boolean
  ): { id: string; x: number; y: number; visible: boolean; text: string; category: string }[] {
    const projVec = new THREE.Vector3();
    return labels.map((label) => {
      if (!captionsOn || !showCategory[label.category]) {
        return { id: label.id, x: 0, y: 0, visible: false, text: label.text, category: label.category };
      }
      projVec.set(label.position[0], label.position[1], label.position[2]).project(this.camera);

      if (projVec.z > 1 || Math.abs(projVec.x) > 1.02 || Math.abs(projVec.y) > 1.02) {
        return { id: label.id, x: 0, y: 0, visible: false, text: label.text, category: label.category };
      }

      const x = ((projVec.x + 1) / 2) * this.width;
      const y = ((1 - projVec.y) / 2) * this.height;
      return { id: label.id, x, y, visible: true, text: label.text, category: label.category };
    });
  }

  public resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private animate(now: number): void {
    if (this.isDestroyed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    if (this.tween) {
      const u = Math.min(1, (now - this.tween.t0) / this.tween.d);
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      this.camera.position.lerpVectors(this.tween.p0, this.tween.p1, e);
      this.controls.target.lerpVectors(this.tween.q0, this.tween.q1, e);
      this.camera.fov = this.tween.f0 + (this.tween.f1 - this.tween.f0) * e;
      this.camera.updateProjectionMatrix();
      if (u >= 1) {
        this.tween = null;
        this.controls.enabled = true;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.controls.dispose();
    this.renderer.dispose();
  }
}
