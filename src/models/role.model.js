import { prisma } from "../config/prisma.js";

export const RoleModel = {
  async findAll() {
    return prisma.role.findMany({
      orderBy: { code: "asc" },
    });
  },

  async findById(id) {
    return prisma.role.findUnique({
      where: { id: Number(id) },
    });
  },

  async create(data) {
    return prisma.role.create({ data });
  },

  async update(id, data) {
    return prisma.role.update({
      where: { id: Number(id) },
      data,
    });
  },
};
