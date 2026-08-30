import { prisma } from "../config/prisma.js";

// ใบสั่งขาย (SO) — ข้อผูกพันกับลูกค้า ยังไม่กระทบสต๊อก/บัญชี
export const SalesOrderModel = {
  async findAll() {
    return prisma.sales_order.findMany({
      include: { customer: true },
      orderBy: { id: "desc" },
    });
  },

  async findById(id) {
    return prisma.sales_order.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
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

    return prisma.sales_order.create({
      data: {
        ...orderData,
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

    return prisma.sales_order.update({
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
    return prisma.sales_order.delete({
      where: { id: Number(id) },
    });
  },
};
