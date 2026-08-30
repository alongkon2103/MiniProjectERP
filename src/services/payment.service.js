import { prisma } from "../config/prisma.js";
import { JournalService } from "./journal.service.js";

export const PaymentService = {
  async post(paymentId, userId) {
    const id = Number(paymentId);

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new Error("ไม่พบใบจ่ายเงิน");
    }
    if (payment.status === "posted") {
      throw new Error("ใบจ่ายเงินนี้ post ไปแล้ว");
    }

    const amount = Number(payment.amount);
    if (amount <= 0) {
      throw new Error("ยอดจ่ายเป็น 0");
    }

    const payable = await prisma.account.findUnique({ where: { code: "2010" } }); // เจ้าหนี้การค้า

    return prisma.$transaction(async (tx) => {
      await JournalService.post({
        date: payment.payment_date,
        description: `จ่ายเงินตามใบ ${payment.payment_no}`,
        refType: "payment",
        refId: payment.id,
        createdBy: userId,
        lines: [
          { accountId: payable.id, debit: amount },             
          { accountId: payment.cash_account_id, credit: amount }, 
        ],
      }, tx);

      return tx.payment.update({
        where: { id: payment.id },
        data: { status: "posted" },
        include: { supplier: true, account: true, payment_allocation: true },
      });
    });
  },
};
