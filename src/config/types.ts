export type LayoutVariant = 'layout-b' | 'layout-a';

export interface ThemeColors {
  bgLight: string;
  bgDark: string;
  inkLight: string;
  inkDark: string;
  muteLight: string;
  muteDark: string;
  lineLight: string;
  lineDark: string;
  walnutLight: string;
  walnutDark: string;
  accent: string;
  chipLight: string;
  chipDark: string;
  labelYoursBg: string;
  labelYoursText: string;
  labelNewBg: string;
  labelNewText: string;
  labelNewBorder: string;
  labelRoomBg: string;
  labelRoomText: string;
  viewportBgDay: string;
  viewportBgNight: string;
}

export interface FinishConfig {
  id: string;
  name: string;
  hex: string;
  dkRgb: string;
  ltRgb: string;
  amount: number;
}

export interface TextilePaletteConfig {
  id: string;
  name: string;
  throwColor: number;
  cushionColor: number;
  curtainColor: number;
  rugColor: number;
}

export type ViewCoord = [number, number, number];

export interface CameraViewConfig {
  id: string;
  label: string;
  position: ViewCoord;
  target: ViewCoord;
  fov: number;
}

export interface FurniturePlacementItem {
  item: string;
  placement: string;
  why: string;
}

export interface ShoppingListItem {
  item: string;
  spec: string;
  minPrice: number;
  maxPrice: number;
}

export type LabelCategory = 'yours' | 'new' | 'room';

export interface LabelMarker {
  id: string;
  text: string;
  category: LabelCategory;
  position: ViewCoord;
}

export interface LightingPresetConfig {
  sunIntensity: number;
  hemiIntensity: number;
  c1Intensity: number;
  c2Intensity: number;
  lampIntensity: number;
  exposure: number;
  shadeEmissiveIntensity: number;
  envMapIntensity: number;
  bgColor: number;
}

export interface LightingVectorsConfig {
  sunPosition: [number, number, number];
  sunTarget: [number, number, number];
  c1Position: [number, number, number];
  c2Position: [number, number, number];
  skyColorHex: number;
  nightColorHex: number;
  hemisphereSkyColor: number;
  hemisphereGroundColor: number;
  sunColor: number;
  pointLightColor: number;
  lampColor: number;
  underCabinetColor: number;
}

export interface LayoutConfig {
  id: LayoutVariant;
  name: string;
  shortTitle: string;
  pageTitle: string;
  heading: string;
  description: string;
  assumptions: string[];
  placements: FurniturePlacementItem[];
  shoppingList: ShoppingListItem[];
  views: Record<string, CameraViewConfig>;
  labels: LabelMarker[];
}
