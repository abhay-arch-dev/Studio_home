import { FinishConfig } from './types';

export const FINISHES: Record<string, FinishConfig> = {
  walnut: { id: 'walnut', name: 'Walnut', hex: '#6a3e24', dkRgb: '38,18,8', ltRgb: '196,140,92', amount: 1 },
  oak: { id: 'oak', name: 'Natural oak', hex: '#c49a6c', dkRgb: '120,80,45', ltRgb: '235,205,165', amount: 1 },
  teak: { id: 'teak', name: 'Teak', hex: '#9a5f2e', dkRgb: '70,35,12', ltRgb: '210,150,90', amount: 1 },
  wenge: { id: 'wenge', name: 'Wenge', hex: '#3b2a20', dkRgb: '15,8,4', ltRgb: '120,90,70', amount: 1 },
  white: { id: 'white', name: 'Frosty white', hex: '#ece8e1', dkRgb: '170,160,150', ltRgb: '255,255,255', amount: 0.12 },
  grey: { id: 'grey', name: 'Stone grey', hex: '#8d8983', dkRgb: '60,58,55', ltRgb: '175,172,168', amount: 0.45 },
  beige: { id: 'beige', name: 'Cashmere beige', hex: '#cdbba3', dkRgb: '90,75,60', ltRgb: '240,230,215', amount: 0.12 },
  charcoal: { id: 'charcoal', name: 'Charcoal', hex: '#3d3f42', dkRgb: '0,0,0', ltRgb: '140,140,140', amount: 0.12 },
  black: { id: 'black', name: 'Matte black', hex: '#1f1f21', dkRgb: '0,0,0', ltRgb: '90,90,95', amount: 0.1 },
  navy: { id: 'navy', name: 'Navy blue', hex: '#25344f', dkRgb: '0,0,20', ltRgb: '120,140,175', amount: 0.1 },
  powder: { id: 'powder', name: 'Powder blue', hex: '#9fb8cc', dkRgb: '40,60,80', ltRgb: '230,240,250', amount: 0.1 },
  teal: { id: 'teal', name: 'Teal', hex: '#2f6b6b', dkRgb: '0,25,25', ltRgb: '130,180,180', amount: 0.1 },
  sage: { id: 'sage', name: 'Sage green', hex: '#9aaa8c', dkRgb: '45,60,40', ltRgb: '220,230,210', amount: 0.1 },
  forest: { id: 'forest', name: 'Forest green', hex: '#2f4a36', dkRgb: '0,20,5', ltRgb: '120,150,125', amount: 0.1 },
  olive: { id: 'olive', name: 'Olive', hex: '#6b6a3a', dkRgb: '30,30,5', ltRgb: '170,170,120', amount: 0.1 },
  mustard: { id: 'mustard', name: 'Mustard', hex: '#c99a2e', dkRgb: '80,55,0', ltRgb: '240,210,130', amount: 0.1 },
  butter: { id: 'butter', name: 'Butter yellow', hex: '#e9d68f', dkRgb: '120,100,40', ltRgb: '255,250,215', amount: 0.1 },
  terracotta: { id: 'terracotta', name: 'Terracotta', hex: '#b5603d', dkRgb: '70,25,10', ltRgb: '230,160,130', amount: 0.1 },
  blush: { id: 'blush', name: 'Blush pink', hex: '#d9a9a0', dkRgb: '110,70,65', ltRgb: '250,225,220', amount: 0.1 },
  plum: { id: 'plum', name: 'Plum', hex: '#5b2f4a', dkRgb: '25,0,15', ltRgb: '170,120,150', amount: 0.1 },
  lavender: { id: 'lavender', name: 'Lavender', hex: '#a99bc4', dkRgb: '60,50,85', ltRgb: '230,225,245', amount: 0.1 },
};

export const DEFAULT_FINISH_KEY = 'walnut';
