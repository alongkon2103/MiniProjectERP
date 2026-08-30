import { prisma } from "../config/prisma.js";
import { JournalService } from "./journal.service.js";

export const SupplierBillService = {
  async post(billId, userId) {
    const id = Number(billId);

    const bill = await prisma.supplier_bill.findUnique({ where: { id } });
    if (!bill) {
      throw new Error("ไม่พบใบตั้งหนี้");
    }
    if (bill.status === "posted") {
      throw new Error("ใบตั้งหนี้นี้ post ไปแล้ว");
    }

    const subtotal = Number(bill.subtotal_amount);
    const vat = Number(bill.vat_amount);
    const total = subtotal + vat;
    if (total <= 0) {
      throw new Error("ยอดบิลเป็น 0");
    }

    const clearing = await prisma.account.findUnique({ where: { code: "2020" } }); // พักรับสินค้า
    const inputVat = await prisma.account.findUnique({ where: { code: "1040" } }); // ภาษีซื้อ
    const payable = await prisma.account.findUnique({ where: { code: "2010" } }); // เจ้าหนี้การค้า

    const lines = [{ accountId: clearing.id, debit: subtotal }];
    if (vat > 0) {
      lines.push({ accountId: inputVat.id, debit: vat });
    }
    lines.push({ accountId: payable.id, credit: total });

    return prisma.$transaction(async (tx) => {
      await JournalService.post({
        date: bill.bill_date,
        description: `ตั้งหนี้ตามใบ ${bill.bill_no}`,
        refType: "supplier_bill",
        refId: bill.id,
        createdBy: userId,
        lines,
      }, tx);

      return tx.supplier_bill.update({
        where: { id: bill.id },
        data: { status: "posted" },
        include: { line: true, supplier: true },
      });
    });
  },
};
