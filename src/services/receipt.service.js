import { prisma } from "../config/prisma.js";
import { JournalService } from "./journal.service.js";

export const ReceiptService = {
  async post(receiptId, userId) {
    const id = Number(receiptId);

    const receipt = await prisma.receipt.findUnique({ where: { id } });
    if (!receipt) {
      throw new Error("ไม่พบใบรับเงิน");
    }
    if (receipt.status === "posted") {
      throw new Error("ใบรับเงินนี้ post ไปแล้ว");
    }

    const amount = Number(receipt.amount);
    if (amount <= 0) {
      throw new Error("ยอดรับเงินเป็น 0");
    }

    const receivable = await prisma.account.findUnique({ where: { code: "1020" } }); // ลูกหนี้การค้า

    return prisma.$transaction(async (tx) => {
      await JournalService.post({
        date: receipt.receipt_date,
        description: `รับเงินตามใบ ${receipt.receipt_no}`,
        refType: "receipt",
        refId: receipt.id,
        createdBy: userId,
        lines: [
          { accountId: receipt.cash_account_id, debit: amount }, 
          { accountId: receivable.id, credit: amount },         
        ],
      }, tx);

      return tx.receipt.update({
        where: { id: receipt.id },
        data: { status: "posted" },
        include: { customer: true, account: true, receipt_allocation: true },
      });
    });
  },
};
