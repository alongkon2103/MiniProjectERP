import { prisma } from "../config/prisma.js";

export const SupplierBillModel = {
  async findAll() {
    return prisma.supplier_bill.findMany({
      include: { supplier: true },
      orderBy: { id: "desc" },
    });
  },

  async findById(id) {
    return prisma.supplier_bill.findUnique({
      where: { id: Number(id) },
      include: {
        supplier: true,
        line: { include: { product: true, account: true } },
      },
    });
  },


  async create(data) {
    const { lines, ...billData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.supplier_bill.create({
      data: {
        ...billData,
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
    const { lines, ...billData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.supplier_bill.update({
      where: { id: Number(id) },
      data: {
        ...billData,
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
    return prisma.supplier_bill.delete({
      where: { id: Number(id) },
    });
  },
};
