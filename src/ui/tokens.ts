import type Phaser from 'phaser';

const palette = {
  navy: '#1a1a2e',
  red: '#cc2222',
  blue: '#2255cc',
  yellow: '#ffcc00',
  white: '#ffffff',
  lavender: '#aaaaff',
  pink: '#ff88ff',
  gray300: '#aaaaaa',
  gray400: '#888888',
} as const;

export const colors = {
  background: palette.navy,
  boss: palette.red,
  knight: palette.blue,
  gold: palette.yellow,
  damageNormal: palette.white,
  damageCrit: palette.yellow,
  prestige: palette.lavender,
  infinity: palette.pink,
  textPrimary: palette.white,
  textSecondary: palette.gray300,
  textMuted: palette.gray400,
} as const;

export const fontSizes = {
  title: '36px',
  subtitle: '16px',
  body: '18px',
} as const;

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export const textStyles = {
  title: { fontSize: fontSizes.title, color: colors.textPrimary, fontStyle: 'bold' },
  subtitle: { fontSize: fontSizes.subtitle, color: colors.textMuted },
  label: { fontSize: fontSizes.body, color: colors.textSecondary },
  value: { fontSize: fontSizes.body, color: colors.textPrimary },
} as const satisfies Record<string, TextStyle>;

export const spacing = {
  tableRowHeight: 36,
  knightGap: 120,
} as const;

export const placeholders = {
  boss: { width: 200, height: 80, color: colors.boss },
  knight: { width: 40, height: 60, color: colors.knight },
  gold: { radius: 20, color: colors.gold },
} as const;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function toColorNumber(hex: string): number {
  if (!HEX_COLOR.test(hex)) throw new RangeError(`Invalid color token: ${JSON.stringify(hex)}`);
  return parseInt(hex.slice(1), 16);
}
