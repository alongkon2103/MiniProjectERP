import { prisma } from "../config/prisma.js";

export const SupplierModel = {
  async findAll() {
    return prisma.supplier.findMany({
      where: { is_active: true },
      orderBy: { code: "asc" },
    });
  },

  async findById(id) {
    return prisma.supplier.findUnique({
      where: { id: Number(id) },
    });
  },

  async create(data) {
    return prisma.supplier.create({ data });
  },

  async update(id, data) {
    return prisma.supplier.update({
      where: { id: Number(id) },
      data,
    });
  },

  async deactivate(id) {
    return prisma.supplier.update({
      where: { id: Number(id) },
      data: { is_active: false },
    });
  },
};
