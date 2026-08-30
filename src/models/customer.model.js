import { prisma } from "../config/prisma.js";

export const CustomerModel = {
  async findAll() {
    return prisma.customer.findMany({
      where: { is_active: true },
      orderBy: { code: "asc" },
    });
  },

  async findById(id) {
    return prisma.customer.findUnique({
      where: { id: Number(id) },
    });
  },

  async create(data) {
    return prisma.customer.create({ data });
  },

  async update(id, data) {
    return prisma.customer.update({
      where: { id: Number(id) },
      data,
    });
  },

  async deactivate(id) {
    return prisma.customer.update({
      where: { id: Number(id) },
      data: { is_active: false },
    });
  },
};
