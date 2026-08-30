import { prisma } from "../config/prisma.js";

export const PaymentModel = {
  async findAll() {
    return prisma.payment.findMany({
      include: { supplier: true },
      orderBy: { id: "desc" },
    });
  },

  async findById(id) {
    return prisma.payment.findUnique({
      where: { id: Number(id) },
      include: {
        supplier: true,
        account: true, 
        payment_allocation: { include: { supplier_bill: true } },
      },
    });
  },

  async create(data) {
    const { allocations, ...paymentData } = data;

    return prisma.payment.create({
      data: {
        ...paymentData,
        payment_allocation: {
          create: allocations,
        },
      },
      include: {
        payment_allocation: true,
      },
    });
  },

  async update(id, data) {
    const { allocations, ...paymentData } = data;

    return prisma.payment.update({
      where: { id: Number(id) },
      data: {
        ...paymentData,
        payment_allocation: {
          deleteMany: {}, 
          create: allocations,
        },
      },
      include: {
        payment_allocation: true,
      },
    });
  },

  async remove(id) {
    return prisma.payment.delete({
      where: { id: Number(id) },
    });
  },
};
