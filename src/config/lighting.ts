import { LightingPresetConfig } from './types';

export const LIGHTING_PRESETS: { day: LightingPresetConfig; eve: LightingPresetConfig } = {
  day: {
    sunIntensity: 1.8,
    hemiIntensity: 0.32,
    c1Intensity: 0.35,
    c2Intensity: 0.3,
    lampIntensity: 0.45,
    exposure: 1.05,
    shadeEmissiveIntensity: 0.2,
    envMapIntensity: 1.0,
    bgColor: 0xdde6ea,
  },
  eve: {
    sunIntensity: 0,
    hemiIntensity: 0.05,
    c1Intensity: 0.22,
    c2Intensity: 0.25,
    lampIntensity: 1.7,
    exposure: 1.0,
    shadeEmissiveIntensity: 0.9,
    envMapIntensity: 0.22,
    bgColor: 0x1a2330,
  },
};

export const LIGHTING_VECTORS = {
  sunPosition: [9, 5.2, 2.6] as [number, number, number],
  sunTarget: [2, 0, 2.0] as [number, number, number],
  c1Position: [1.8, 2.6, 1.8] as [number, number, number],
  c2Position: [2.6, 2.6, -0.8] as [number, number, number],
  skyColorHex: 0xdde6ea,
  nightColorHex: 0x1a2330,
  hemisphereSkyColor: 0xffffff,
  hemisphereGroundColor: 0xd9cfc2,
  sunColor: 0xfff0d8,
  pointLightColor: 0xfff2e0,
  lampColor: 0xffc98a,
  underCabinetColor: 0xffe2b0,
};
