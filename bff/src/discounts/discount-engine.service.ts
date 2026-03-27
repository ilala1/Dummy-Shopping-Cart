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
 * Applies all eligible discounts from the catalogue in a fixed order:
 * 1) Line-qty percentage (per qualifying line)
 * 2) Fixed amount off subtotal (after line discounts)
 * 3) Order percentage off remaining (after fixed)
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

    const fixedRule = this.discounts.find(
      (d) =>
        d.active &&
        d.type === DiscountType.FIXED_CENTS &&
        d.valueCents != null &&
        (d.minSubtotalCents ?? 0) <= subtotalAfterLine,
    );
    if (fixedRule?.valueCents) {
      const amt = Math.min(fixedRule.valueCents, subtotalAfterLine);
      applied.push({
        discountId: fixedRule.id,
        name: fixedRule.name,
        amountCents: amt,
      });
      runningLines = this.allocateLineDiscount(runningLines, amt);
    }

    const subtotalAfterFixed = runningLines.reduce(
      (s, r) => s + r.lineSubtotalCents,
      0,
    );

    const pctRule = this.discounts.find(
      (d) =>
        d.active &&
        d.type === DiscountType.PERCENT_OFF &&
        d.valuePercent != null &&
        (d.minSubtotalCents ?? 0) <= subtotalAfterFixed,
    );
    if (pctRule?.valuePercent) {
      const amt = Math.round(
        (subtotalAfterFixed * pctRule.valuePercent) / 100,
      );
      if (amt > 0) {
        applied.push({
          discountId: pctRule.id,
          name: pctRule.name,
          amountCents: amt,
        });
        runningLines = this.allocateLineDiscount(runningLines, amt);
      }
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
