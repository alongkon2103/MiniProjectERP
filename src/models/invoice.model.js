import { prisma } from "../config/prisma.js";

// ใบแจ้งหนี้/ขาย (Invoice) — post แล้วลงบัญชี Dr ลูกหนี้ / Cr รายได้ขาย
export const InvoiceModel = {
  async findAll() {
    return prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { id: "desc" },
    });
  },

  async findById(id) {
    return prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        line: { include: { product: true, account: true } },
      },
    });
  },

  async create(data) {
    const { lines, ...invoiceData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.invoice.create({
      data: {
        ...invoiceData,
        line: {
          create: lineData,
        },
      },
      include: {
        line: true,
      },
    });
  },

  async update(id, data) {
    const { lines, ...invoiceData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.invoice.update({
      where: { id: Number(id) },
      data: {
        ...invoiceData,
        line: {
          deleteMany: {},
          create: lineData,
        },
      },
      include: {
        line: true,
      },
    });
  },

  async remove(id) {
    return prisma.invoice.delete({
      where: { id: Number(id) },
    });
  },
};
