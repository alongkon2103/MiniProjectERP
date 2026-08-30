import { prisma } from "../config/prisma.js";

export const PurchaseRequisitionModel = {
  async findAll() {
    return prisma.purchase_requisition.findMany({
      orderBy: { id: "desc" },
    });
  },

  async findById(id) {
    return prisma.purchase_requisition.findUnique({
      where: { id: Number(id) },
      include: {
        line: { include: { product: true } },
      },
    });
  },

  async create(data) {
    const { lines, ...prData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.purchase_requisition.create({
      data: {
        ...prData,
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
    const { lines, ...prData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.purchase_requisition.update({
      where: { id: Number(id) },
      data: {
        ...prData,
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
    return prisma.purchase_requisition.delete({
      where: { id: Number(id) },
    });
  },

  async setStatus(id, status) {
    return prisma.purchase_requisition.update({
      where: { id: Number(id) },
      data: { status },
    });
  },
};
