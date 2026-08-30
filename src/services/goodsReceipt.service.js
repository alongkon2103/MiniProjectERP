import { prisma } from "../config/prisma.js";
import { StockService } from "./stock.service.js";
import { JournalService } from "./journal.service.js";


export const GoodsReceiptService = {
  async post(grId, userId) {
    const id = Number(grId);

    const gr = await prisma.goods_receipt.findUnique({
      where: { id },
      include: { line: true },
    });
    if (!gr) {
      throw new Error("ไม่พบใบรับของ");
    }
    if (gr.status === "posted") {
      throw new Error("ใบรับของนี้ post ไปแล้ว");
    }
    if (gr.line.length === 0) {
      throw new Error("ใบรับของไม่มีรายการสินค้า");
    }

    const inventory = await prisma.account.findUnique({ where: { code: "1030" } }); // สินค้าคงเหลือ
    const grClearing = await prisma.account.findUnique({ where: { code: "2020" } }); // พักรับสินค้า

    let totalValue = 0;
    for (const line of gr.line) {
      totalValue += Number(line.qty) * Number(line.unit_cost);
    }
    totalValue = Math.round(totalValue * 100) / 100;

   
    return prisma.$transaction(async (tx) => {
      for (const line of gr.line) {
        await StockService.receive({
          productId: line.product_id,
          qty: Number(line.qty),
          unitCost: Number(line.unit_cost),
          refType: "goods_receipt",
          refId: gr.id,
          refNo: gr.gr_no,
          createdBy: userId,
        }, tx);
      }

      await JournalService.post({
        date: gr.gr_date,
        description: `รับของตามใบ ${gr.gr_no}`,
        refType: "goods_receipt",
        refId: gr.id,
        createdBy: userId,
        lines: [
          { accountId: inventory.id, debit: totalValue },
          { accountId: grClearing.id, credit: totalValue },
        ],
      }, tx);

      return tx.goods_receipt.update({
        where: { id: gr.id },
        data: { status: "posted" },
        include: { line: { include: { product: true } }, supplier: true },
      });
    });
  },
};
