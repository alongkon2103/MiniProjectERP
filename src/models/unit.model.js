import { prisma } from "../config/prisma.js";

export const UnitModel = {
  async findAll() {
    return prisma.unit.findMany({
      orderBy: { code: "asc" },
    });
  },

  async findById(id) {
    return prisma.unit.findUnique({
      where: { id: Number(id) },
    });
  },

  async create(data) {
    return prisma.unit.create({ data });
  },

  async update(id, data) {
    return prisma.unit.update({
      where: { id: Number(id) },
      data,
    });
  },
};
