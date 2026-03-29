import { Injectable } from '@nestjs/common';
import {
  AppliedDiscount,
  CartLinePricing,
  DiscountRecord,
  DiscountType,
  PricingResult,
} from './domain/discount.types';
import { DISCOUNT_SEED } from './seeds/discount.seed';

/**
 * Applies discounts in two phases:
 * 1) Line-qty percentage (per qualifying line)
 * 2) Exactly one order-level rule among {@link DiscountType.FIXED_CENTS} and
 *    {@link DiscountType.PERCENT_OFF}: first take every rule whose
 *    `minSubtotalCents` is met, then keep only rules in the **strictest** tier
 *    (highest `minSubtotalCents` among those). Among that tier, pick the best
 *    savings; ties break by catalogue order.
 *
 *    So £40+ and £30+ never stack: above £40 only the £40-tier promo can run.
 */
@Injectable()
export class DiscountEngineService {
  private readonly discounts: DiscountRecord[];

  constructor() {
    this.discounts = DISCOUNT_SEED.map((d) => ({ ...d }));
  }

  listActive(): DiscountRecord[] {
    return this.discounts.filter((d) => d.active);
  }

  getById(id: string): DiscountRecord | undefined {
    const d = this.discounts.find((x) => x.id === id);
    return d ? { ...d } : undefined;
  }

  price(lines: CartLinePricing[]): PricingResult {
    let runningLines = lines.map((l) => ({
      ...l,
      lineSubtotalCents: l.unitPriceCents * l.quantity,
    }));

    const applied: AppliedDiscount[] = [];

    const lineRule = this.discounts.find(
      (d) => d.active && d.type === DiscountType.LINE_QTY_PERCENT,
    );
    if (lineRule?.minLineQuantity && lineRule.valuePercent != null) {
      let off = 0;
      for (const row of runningLines) {
        if (row.quantity >= lineRule.minLineQuantity) {
          off += Math.round(
            (row.lineSubtotalCents * lineRule.valuePercent) / 100,
          );
        }
      }
      if (off > 0) {
        applied.push({
          discountId: lineRule.id,
          name: lineRule.name,
          amountCents: off,
        });
        runningLines = this.allocateLineDiscount(runningLines, off);
      }
    }

    const subtotalAfterLine = runningLines.reduce(
      (s, r) => s + r.lineSubtotalCents,
      0,
    );

    const bestOrder = this.pickBestOrderLevelDiscount(subtotalAfterLine);
    if (bestOrder && bestOrder.amountCents > 0) {
      const { rule, amountCents } = bestOrder;
      applied.push({
        discountId: rule.id,
        name: rule.name,
        amountCents,
      });
      runningLines = this.allocateLineDiscount(runningLines, amountCents);
    }

    const subtotalCents = lines.reduce(
      (s, l) => s + l.unitPriceCents * l.quantity,
      0,
    );
    const totalCents = Math.max(
      0,
      runningLines.reduce((s, r) => s + r.lineSubtotalCents, 0),
    );

    return { subtotalCents, applied, totalCents };
  }

  private pickBestOrderLevelDiscount(
    subtotalCents: number,
  ): { rule: DiscountRecord; amountCents: number } | null {
    type Entry = {
      rule: DiscountRecord;
      amountCents: number;
      index: number;
    };
    const eligible: Entry[] = [];

    for (let i = 0; i < this.discounts.length; i++) {
      const d = this.discounts[i];
      if (!d.active) continue;
      if (
        d.type !== DiscountType.FIXED_CENTS &&
        d.type !== DiscountType.PERCENT_OFF
      ) {
        continue;
      }
      if ((d.minSubtotalCents ?? 0) > subtotalCents) continue;

      let amount = 0;
      if (d.type === DiscountType.FIXED_CENTS && d.valueCents != null) {
        amount = Math.min(d.valueCents, subtotalCents);
      } else if (d.type === DiscountType.PERCENT_OFF && d.valuePercent != null) {
        amount = Math.round((subtotalCents * d.valuePercent) / 100);
      }
      if (amount <= 0) continue;

      eligible.push({ rule: d, amountCents: amount, index: i });
    }

    if (eligible.length === 0) return null;

    const maxMin = Math.max(
      ...eligible.map((e) => e.rule.minSubtotalCents ?? 0),
    );
    const topTier = eligible.filter(
      (e) => (e.rule.minSubtotalCents ?? 0) === maxMin,
    );

    let best = topTier[0];
    for (let k = 1; k < topTier.length; k++) {
      const e = topTier[k];
      if (
        e.amountCents > best.amountCents ||
        (e.amountCents === best.amountCents && e.index < best.index)
      ) {
        best = e;
      }
    }

    return { rule: best.rule, amountCents: best.amountCents };
  }

  /**
   * Pro-rata reduction per line so order total matches discount mechanics.
   */
  private allocateLineDiscount(
    rows: { lineSubtotalCents: number; productId: string; quantity: number; unitPriceCents: number }[],
    amountCents: number,
  ): typeof rows {
    const subtotal = rows.reduce((s, r) => s + r.lineSubtotalCents, 0);
    if (subtotal === 0) return rows;
    let remaining = amountCents;
    const next = rows.map((r, i) => {
      let cut: number;
      if (i === rows.length - 1) {
        cut = remaining;
      } else {
        cut = Math.min(
          r.lineSubtotalCents,
          Math.round((amountCents * r.lineSubtotalCents) / subtotal),
        );
      }
      remaining -= cut;
      return {
        ...r,
        lineSubtotalCents: Math.max(0, r.lineSubtotalCents - cut),
      };
    });
    return next;
  }
}
