import { prisma } from "../config/prisma.js";

export const NumberingService = {
  async nextNo(docType, year = new Date().getFullYear(), client = prisma) {
    const seq = await client.doc_sequence.upsert({
      where: { doc_type_year: { doc_type: docType, year } },
      create: { doc_type: docType, year, last_no: 1 },
      update: { last_no: { increment: 1 } },
    });

    const running = String(seq.last_no).padStart(4, "0");
    return `${docType}-${year}-${running}`;
  },
};

