import { TextilePaletteConfig } from './types';

export const TEXTILE_PALETTES: Record<string, TextilePaletteConfig> = {
  terracotta: {
    id: 'terracotta',
    name: 'Terracotta',
    throwColor: 0xb85c38,
    cushionColor: 0xd9a441,
    curtainColor: 0xd9c7ae,
    rugColor: 0xd2b78c,
  },
  sage: {
    id: 'sage',
    name: 'Sage & sand',
    throwColor: 0x7f9172,
    cushionColor: 0xe0cfb1,
    curtainColor: 0xb3bea6,
    rugColor: 0xd8c8a8,
  },
  indigo: {
    id: 'indigo',
    name: 'Indigo',
    throwColor: 0x2f4a6d,
    cushionColor: 0xc9a26b,
    curtainColor: 0xc9d1db,
    rugColor: 0xd0c5b0,
  },
};

export const DEFAULT_PALETTE_KEY = 'terracotta';
