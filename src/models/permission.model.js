import { prisma } from "../config/prisma.js";

export const PermissionModel = {
  async findAll() {
    return prisma.permission.findMany({
      orderBy: { module: "asc" },
    });
  },

  async findById(id) {
    return prisma.permission.findUnique({
      where: { id: Number(id) },
    });
  },

  async create(data) {
    return prisma.permission.create({ data });
  },
};
