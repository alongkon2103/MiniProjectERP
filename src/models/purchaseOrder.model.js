import { prisma } from "../config/prisma.js";

export const PurchaseOrderModel = {
  async findAll() {
    return prisma.purchase_order.findMany({
      include: { supplier: true },
      orderBy: { id: "desc" },
    });
  },

  async findById(id) {
    return prisma.purchase_order.findUnique({
      where: { id: Number(id) },
      include: {
        supplier: true,
        line: { include: { product: true } },
      },
    });
  },


  async create(data) {
    const { lines, ...orderData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.purchase_order.create({
      data: {...orderData,
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
    const { lines, ...orderData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.purchase_order.update({
      where: { id: Number(id) },
      data: {
        ...orderData,
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
    return prisma.purchase_order.delete({
      where: { id: Number(id) },
    });
  },

  async setStatus(id, status) {
    return prisma.purchase_order.update({
      where: { id: Number(id) },
      data: { status },
    });
  },
};
