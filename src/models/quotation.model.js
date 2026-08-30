import { prisma } from "../config/prisma.js";

// ใบเสนอราคา (QT) — header + line, ยังไม่กระทบสต๊อก/บัญชี
export const QuotationModel = {
  async findAll() {
    return prisma.quotation.findMany({
      include: { customer: true },
      orderBy: { id: "desc" },
    });
  },

  async findById(id) {
    return prisma.quotation.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        line: { include: { product: true } },
      },
    });
  },

  async create(data) {
    const { lines, ...quotationData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.quotation.create({
      data: {
        ...quotationData,
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
    const { lines, ...quotationData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.quotation.update({
      where: { id: Number(id) },
      data: {
        ...quotationData,
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
    return prisma.quotation.delete({
      where: { id: Number(id) },
    });
  },
};
