import type Phaser from 'phaser';
import type { HitOutcome } from '../config/critConfig';

const palette = {
  navy: '#1a1a2e',
  navyLight: '#2a2a44',
  red: '#cc2222',
  blue: '#2255cc',
  yellow: '#ffcc00',
  orange: '#ff7a1a',
  green: '#3fbf5f',
  white: '#ffffff',
  gray300: '#aaaaaa',
  gray400: '#888888',
} as const;

export const colors = {
  background: palette.navy,
  boss: palette.red,
  monster: palette.red,
  knight: palette.blue,
  gold: palette.yellow,
  damageNormal: palette.white,
  damageCrit: palette.yellow,
  damageSuperCrit: palette.orange,
  hpBarTrack: palette.navyLight,
  hpBarFill: palette.green,
  textPrimary: palette.white,
  textSecondary: palette.gray300,
  textMuted: palette.gray400,
} as const;

export const fontSizes = {
  hud: '20px',
  body: '18px',
  small: '14px',
  damage: '22px',
  damageCrit: '28px',
  damageSuperCrit: '36px',
} as const;

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export const textStyles = {
  hud: { fontSize: fontSizes.hud, color: colors.textPrimary, fontStyle: 'bold' },
  gold: { fontSize: fontSizes.hud, color: colors.gold, fontStyle: 'bold' },
  hpText: { fontSize: fontSizes.small, color: colors.textSecondary },
} as const satisfies Record<string, TextStyle>;

export const damageTextStyles = {
  normal: { fontSize: fontSizes.damage, color: colors.damageNormal, fontStyle: 'bold' },
  crit: { fontSize: fontSizes.damageCrit, color: colors.damageCrit, fontStyle: 'bold' },
  superCrit: {
    fontSize: fontSizes.damageSuperCrit,
    color: colors.damageSuperCrit,
    fontStyle: 'bold',
  },
} as const satisfies Record<HitOutcome, TextStyle>;

export const motion = {
  damageFloatDistance: 60,
  damageFloatDurationMs: 700,
  damageJitterX: 30,
} as const;

export const spacing = {
  knightGap: 120,
  hpBarOffset: 16,
  goldIconGap: 12,
} as const;

export const placeholders = {
  boss: { width: 200, height: 80, color: colors.boss },
  monster: { width: 120, height: 60, color: colors.monster },
  knight: { width: 40, height: 60, color: colors.knight },
  gold: { radius: 14, color: colors.gold },
  hpBar: { width: 220, height: 12 },
} as const;

export const layout = {
  stageLabel: { x: 400, y: 40 },
  enemy: { x: 400, y: 190 },
  knights: { x: 400, y: 380 },
  gold: { x: 40, y: 540 },
} as const;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function toColorNumber(hex: string): number {
  if (!HEX_COLOR.test(hex)) throw new RangeError(`Invalid color token: ${JSON.stringify(hex)}`);
  return parseInt(hex.slice(1), 16);
}
