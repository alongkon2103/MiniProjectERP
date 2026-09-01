import { prisma } from "../config/prisma.js";
import { JournalService } from "./journal.service.js";

export const InvoiceService = {
  async post(invoiceId, userId) {
    const id = Number(invoiceId);

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new Error("ไม่พบใบแจ้งหนี้");
    }
    if (invoice.status === "posted") {
      throw new Error("ใบแจ้งหนี้นี้ post ไปแล้ว");
    }

    const subtotal = Number(invoice.subtotal_amount);
    const vat = Number(invoice.vat_amount);
    const total = subtotal + vat;
    if (total <= 0) {
      throw new Error("ยอดใบแจ้งหนี้เป็น 0");
    }

    const receivable = await prisma.account.findUnique({ where: { code: "1020" } }); // ลูกหนี้การค้า
    const revenue = await prisma.account.findUnique({ where: { code: "4010" } });     // รายได้ขาย
    const outputVat = await prisma.account.findUnique({ where: { code: "2030" } });   // ภาษีขาย

    const lines = [
      { accountId: receivable.id, debit: total },
      { accountId: revenue.id, credit: subtotal },
    ];
    if (vat > 0) {
      lines.push({ accountId: outputVat.id, credit: vat });
    }

    return prisma.$transaction(async (tx) => {
      await JournalService.post({
        date: invoice.inv_date,
        description: `ขายตามใบ ${invoice.inv_no}`,
        refType: "invoice",
        refId: invoice.id,
        createdBy: userId,
        lines,
      }, tx);

      return tx.invoice.update({
        where: { id: invoice.id },
        data: { status: "posted" },
        include: { line: true, customer: true },
      });
    });
  },
};
