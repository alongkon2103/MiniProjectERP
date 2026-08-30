import { prisma } from "../config/prisma.js";
import { withTx } from "./withTx.js";

function round2(n) {
  return Math.round(n * 100) / 100;
}
function round4(n) {
  return Math.round(n * 10000) / 10000;
}

async function lastBalance(tx, productId) {
  const last = await tx.stock_movement.findFirst({
    where: { product_id: productId },
    orderBy: { id: "desc" },
  });
  return {
    qty: last ? Number(last.balance_qty) : 0,
    value: last ? Number(last.balance_value) : 0,
  };
}

async function insertMovement(tx, m) {
  const balanceQty = m.prevQty + m.qtyChange;
  const balanceValue = round2(m.prevValue + m.valueChange);
  return tx.stock_movement.create({
    data: {
      product_id: m.productId,
      qty_change: m.qtyChange,
      unit_cost: m.unitCost,
      value_change: m.valueChange,
      balance_qty: balanceQty,
      balance_value: balanceValue,
      ref_type: m.refType,
      ref_id: m.refId,
      ref_no: m.refNo,
      note: m.note ?? null,
      created_by: m.createdBy,
    },
  });
}

export const StockService = {
  async balanceOf(productId) {
    const last = await prisma.stock_movement.findFirst({
      where: { product_id: productId },
      orderBy: { id: "desc" },
    });
    const qty = last ? Number(last.balance_qty) : 0;
    const value = last ? Number(last.balance_value) : 0;
    const avgCost = qty > 0 ? round4(value / qty) : 0;
    return { qty, value, avgCost };
  },

  async receive({ productId, qty, unitCost, refType, refId, refNo, createdBy, note }, tx) {
    return withTx(tx, async (tx) => {
      const prev = await lastBalance(tx, productId);
      const valueChange = round2(qty * unitCost);
      return insertMovement(tx, {
        productId,
        qtyChange: qty,
        unitCost: round4(unitCost),
        valueChange,
        prevQty: prev.qty,
        prevValue: prev.value,
        refType, 
        refId, 
        refNo, 
        createdBy, 
        note,
      });
    });
  },

  async issue({ productId, qty, refType, refId, refNo, createdBy, note }, tx) {
    return withTx(tx, async (tx) => {
      const prev = await lastBalance(tx, productId);
      if (qty > prev.qty) {
        throw new Error(`สต๊อกไม่พอ: คงเหลือ ${prev.qty} แต่จะจ่าย ${qty}`);
      }
      const avgCost = prev.qty > 0 ? prev.value / prev.qty : 0;
      const valueChange = round2(qty * avgCost);
      return insertMovement(tx, {
        productId,
        qtyChange: -qty,
        unitCost: round4(avgCost),
        valueChange: -valueChange,
        prevQty: prev.qty,
        prevValue: prev.value,
        refType, 
        refId, 
        refNo, 
        createdBy, 
        note,
      });
    });
  },
};
