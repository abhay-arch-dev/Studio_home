export * from './types';

import finishesData from './finishes.json';
import layoutAData from './layouts/layoutA.json';
import layoutBData from './layouts/layoutB.json';
import lightingData from './lighting.json';
import materialsData from './materials.json';
import palettesData from './palettes.json';
import roomGeometryData from './roomGeometry.json';
import themeData from './theme.json';

import {
  FinishConfig,
  LayoutConfig,
  LayoutVariant,
  LightingPresetConfig,
  LightingVectorsConfig,
  TextilePaletteConfig,
  ThemeColors,
} from './types';

export const THEME_COLORS: ThemeColors = themeData.themeColors;
export const UI_CONSTANTS = themeData.uiConstants;

export const FINISHES: Record<string, FinishConfig> = finishesData.finishes;
export const DEFAULT_FINISH_KEY = finishesData.defaultFinishKey;

export const TEXTILE_PALETTES: Record<string, TextilePaletteConfig> = palettesData.palettes;
export const DEFAULT_PALETTE_KEY = palettesData.defaultPaletteKey;

export const LIGHTING_PRESETS: { day: LightingPresetConfig; eve: LightingPresetConfig } =
  lightingData.lightingPresets;
export const LIGHTING_VECTORS: LightingVectorsConfig = lightingData.lightingVectors as LightingVectorsConfig;

export const MATERIAL_SPECS = materialsData;
export const ROOM_DIMENSIONS = roomGeometryData;

export const LAYOUT_A_CONFIG = layoutAData as unknown as LayoutConfig;
export const LAYOUT_B_CONFIG = layoutBData as unknown as LayoutConfig;

export const LAYOUTS: Record<LayoutVariant, LayoutConfig> = {
  'layout-b': LAYOUT_B_CONFIG,
  'layout-a': LAYOUT_A_CONFIG,
};

export const DEFAULT_LAYOUT_ID: LayoutVariant = 'layout-b';
