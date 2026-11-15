export * from './types';
export * from './theme';
export * from './finishes';
export * from './palettes';
export * from './lighting';
export * from './materials';
export * from './roomGeometry';
export * from './layouts/layoutA';
export * from './layouts/layoutB';

import { LAYOUT_A_CONFIG } from './layouts/layoutA';
import { LAYOUT_B_CONFIG } from './layouts/layoutB';
import { LayoutConfig, LayoutVariant } from './types';

export const LAYOUTS: Record<LayoutVariant, LayoutConfig> = {
  'layout-b': LAYOUT_B_CONFIG,
  'layout-a': LAYOUT_A_CONFIG,
};

export const DEFAULT_LAYOUT_ID: LayoutVariant = 'layout-b';
