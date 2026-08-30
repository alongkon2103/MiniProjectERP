import { prisma } from "../config/prisma.js";
import { NumberingService } from "./numbering.service.js";
import { withTx } from "./withTx.js";


function round2(n) {
  return Math.round(n * 100) / 100;
}

export const JournalService = {
  async post({ date, description, refType, refId, createdBy, lines }, tx) {
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lines) {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    }
    totalDebit = round2(totalDebit);
    totalCredit = round2(totalCredit);

    if (totalDebit !== totalCredit) {
      throw new Error(`เดบิตเครดิตไม่สมดุล: Dr ${totalDebit} ≠ Cr ${totalCredit}`);
    }
    if (totalDebit === 0) {
      throw new Error("รายการบัญชีเป็น 0 ไม่มีอะไรให้ลง");
    }

    const lineData = lines.map((line, index) => ({
      line_no: index + 1,
      account_id: line.accountId,
      debit: line.debit || 0,
      credit: line.credit || 0,
      memo: line.memo ?? null,
    }));

    return withTx(tx, async (tx) => {
      const entryNo = await NumberingService.nextNo("JV", undefined, tx);
      return tx.journal_entry.create({
        data: {
          entry_no: entryNo,
          entry_date: date ?? new Date(),
          description: description ?? null,
          ref_type: refType ?? null,
          ref_id: refId ?? null,
          created_by: createdBy,
          journal_line: { create: lineData },
        },
        include: { journal_line: true },
      });
    });
  },

  async reverse({ entryId, date, createdBy, description }, tx) {
    return withTx(tx, async (tx) => {
      const original = await tx.journal_entry.findUnique({
        where: { id: Number(entryId) },
        include: { journal_line: true },
      });
      if (!original) {
        throw new Error("ไม่พบใบสำคัญที่จะกลับรายการ");
      }

      const lineData = original.journal_line.map((l, index) => ({
        line_no: index + 1,
        account_id: l.account_id,
        debit: Number(l.credit),
        credit: Number(l.debit),
        memo: l.memo,
      }));

      const entryNo = await NumberingService.nextNo("JV", undefined, tx);
      return tx.journal_entry.create({
        data: {
          entry_no: entryNo,
          entry_date: date ?? new Date(),
          description: description ?? `กลับรายการ ${original.entry_no}`,
          ref_type: original.ref_type,
          ref_id: original.ref_id,
          reversal_of_id: original.id,
          created_by: createdBy,
          journal_line: { create: lineData },
        },
        include: { journal_line: true },
      });
    });
  },

  async trialBalance() {
    const accounts = await prisma.account.findMany({ orderBy: { code: "asc" } });
    const lines = await prisma.journal_line.findMany();

    const rows = [];
    let totalDebit = 0;
    let totalCredit = 0;

    for (const account of accounts) {
      let debit = 0;
      let credit = 0;
      for (const line of lines) {
        if (line.account_id === account.id) {
          debit += Number(line.debit);
          credit += Number(line.credit);
        }
      }
      if (debit !== 0 || credit !== 0) {
        rows.push({
          code: account.code,
          name: account.name,
          type: account.type,
          debit: round2(debit),
          credit: round2(credit),
          balance: round2(debit - credit),
        });
        totalDebit += debit;
        totalCredit += credit;
      }
    }

    totalDebit = round2(totalDebit);
    totalCredit = round2(totalCredit);
    return { rows, totalDebit, totalCredit, balanced: totalDebit === totalCredit };
  },
};
