import type Phaser from 'phaser';
import type { Decimal } from '../utils/Decimal';
import { formatNumber } from '../utils/format';
import { levelDamage } from '../core/systems/levelDamage';
import type { PurchaseMode } from '../core/systems/upgradeSystem';
import {
  quoteUpgrade,
  resolveUpgradable,
  type GameSession,
  type UpgradeTarget,
} from '../core/systems/gameSession';
import { Button } from './Button';
import { buttonSizes, spacing } from './tokens';

const MODES: { mode: PurchaseMode; label: string }[] = [
  { mode: 'x1', label: 'x1' },
  { mode: 'x10', label: 'x10' },
  { mode: 'max', label: 'Máx' },
];

interface UpgradeRow {
  title: string;
  target: UpgradeTarget;
  button: Button;
  shownLevel: number;
}

export interface UpgradePanelHandlers {
  onBuy(target: UpgradeTarget, mode: PurchaseMode): void;
}

export class UpgradePanel {
  private mode: PurchaseMode = 'x1';
  private readonly modeButtons: { mode: PurchaseMode; button: Button }[];
  private readonly rows: UpgradeRow[];
  private shownGold?: Decimal;
  private shownMode?: PurchaseMode;

  constructor(scene: Phaser.Scene, x: number, y: number, handlers: UpgradePanelHandlers) {
    const { width, height } = buttonSizes.mode;
    const firstModeX = x - (width + spacing.modeButtonGap);
    this.modeButtons = MODES.map(({ mode, label }, i) => {
      const button = new Button(
        scene,
        firstModeX + i * (width + spacing.modeButtonGap),
        y,
        { width, height },
        () => {
          this.mode = mode;
        }
      );
      button.setLabel(label);
      return { mode, button };
    });

    const targets: { title: string; target: UpgradeTarget }[] = [
      { title: 'Clique', target: { kind: 'click' } },
      { title: 'Cavaleiro', target: { kind: 'knight', index: 0 } },
    ];
    this.rows = targets.map(({ title, target }, i) => ({
      title,
      target,
      shownLevel: -1,
      button: new Button(scene, x, y + (i + 1) * spacing.upgradeRowGap, buttonSizes.upgrade, () =>
        handlers.onBuy(target, this.mode)
      ),
    }));
  }

  render(session: GameSession): void {
    const goldChanged = session.wallet.gold !== this.shownGold;
    const modeChanged = this.mode !== this.shownMode;

    if (modeChanged) {
      for (const { mode, button } of this.modeButtons) button.setSelected(mode === this.mode);
    }

    for (const row of this.rows) {
      const upgradable = resolveUpgradable(session, row.target);
      if (!goldChanged && !modeChanged && upgradable.level === row.shownLevel) continue;
      row.shownLevel = upgradable.level;

      const quote = quoteUpgrade(session, row.target, this.mode);
      const now = levelDamage(upgradable.baseDamage, upgradable.level);
      const next = levelDamage(upgradable.baseDamage, upgradable.level + quote.count);
      const amount = quote.count > 1 ? ` (+${quote.count})` : '';
      row.button.setLabel(
        `${row.title} · nv ${upgradable.level}${amount}\n` +
          `dano ${formatNumber(now)} → ${formatNumber(next)} · ${formatNumber(quote.cost)} ouro`
      );
      row.button.setEnabled(quote.affordable);
    }

    this.shownGold = session.wallet.gold;
    this.shownMode = this.mode;
  }
}
