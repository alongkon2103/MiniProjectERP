import { prisma } from "../config/prisma.js";

// รับเงิน (Receipt) — 1 การรับตัดได้หลาย invoice (receipt_allocation)
// post แล้วลงบัญชี Dr เงินสด-ธนาคาร / Cr ลูกหนี้การค้า
export const ReceiptModel = {
  async findAll() {
    return prisma.receipt.findMany({
      include: { customer: true },
      orderBy: { id: "desc" },
    });
  },

  async findById(id) {
    return prisma.receipt.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        account: true, // บัญชีเงินสด/ธนาคารที่รับเข้า
        receipt_allocation: { include: { invoice: true } },
      },
    });
  },

  async create(data) {
    const { allocations, ...receiptData } = data;

    return prisma.receipt.create({
      data: {
        ...receiptData,
        receipt_allocation: {
          create: allocations,
        },
      },
      include: {
        receipt_allocation: true,
      },
    });
  },

  async update(id, data) {
    const { allocations, ...receiptData } = data;

    return prisma.receipt.update({
      where: { id: Number(id) },
      data: {
        ...receiptData,
        receipt_allocation: {
          deleteMany: {},
          create: allocations,
        },
      },
      include: {
        receipt_allocation: true,
      },
    });
  },

  async remove(id) {
    return prisma.receipt.delete({
      where: { id: Number(id) },
    });
  },
};
