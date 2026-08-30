import { prisma } from "../config/prisma.js";
import { StockService } from "./stock.service.js";
import { JournalService } from "./journal.service.js";

export const ShipmentService = {
  async post(shipmentId, userId) {
    const id = Number(shipmentId);

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: { line: true },
    });
    if (!shipment) {
      throw new Error("ไม่พบใบส่งของ");
    }
    if (shipment.status === "posted") {
      throw new Error("ใบส่งของนี้ post ไปแล้ว");
    }
    if (shipment.line.length === 0) {
      throw new Error("ใบส่งของไม่มีรายการสินค้า");
    }

    const cogs = await prisma.account.findUnique({ where: { code: "5010" } });      // ต้นทุนขาย
    const inventory = await prisma.account.findUnique({ where: { code: "1030" } });  // สินค้าคงเหลือ

    return prisma.$transaction(async (tx) => {
      let totalCost = 0;
      for (const line of shipment.line) {
        const movement = await StockService.issue({
          productId: line.product_id,
          qty: Number(line.qty),
          refType: "shipment",
          refId: shipment.id,
          refNo: shipment.sh_no,
          createdBy: userId,
        }, tx);
        totalCost += Math.abs(Number(movement.value_change));
      }
      totalCost = Math.round(totalCost * 100) / 100;

      if (totalCost > 0) {
        await JournalService.post({
          date: shipment.sh_date,
          description: `ส่งของตามใบ ${shipment.sh_no}`,
          refType: "shipment",
          refId: shipment.id,
          createdBy: userId,
          lines: [
            { accountId: cogs.id, debit: totalCost },
            { accountId: inventory.id, credit: totalCost },
          ],
        }, tx);
      }

      return tx.shipment.update({
        where: { id: shipment.id },
        data: { status: "posted" },
        include: { line: { include: { product: true } }, customer: true },
      });
    });
  },
};
