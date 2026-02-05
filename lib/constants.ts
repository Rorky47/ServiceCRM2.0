/** Common mobile viewport widths for admin preview */
export const MOBILE_WIDTHS = {
  iphoneSe: 375,
  iphone12: 390,
  iphone14ProMax: 428,
} as const;

export type MobileWidthValue = (typeof MOBILE_WIDTHS)[keyof typeof MOBILE_WIDTHS];

/** Default grid/column settings for sections */
export const GRID_DEFAULTS = {
  servicesColumns: 3,
  maxColumns: 4,
} as const;

/** Spacing system used in footer and layout */
export const SPACING = {
  presetUnit: 40,
  minGap: 0,
  maxGap: 5,
} as const;

export function getPresetSpacing(multiplier: number): number {
  return multiplier * SPACING.presetUnit;
}
