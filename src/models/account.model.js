import { prisma } from "../config/prisma.js";

export const AccountModel = {
  async findAll() {
    return prisma.account.findMany({
      where: { is_active: true, },
      orderBy: { code: "asc", },
    });
  },

  async findById(id) {
    return prisma.account.findUnique({
      where: {
        id: Number(id),
      },
    });
  },

  async findByCode(code) {
    return prisma.account.findUnique({
      where: {
        code,
      },
    });
  },

  async create(data) {
    return prisma.account.create({
      data,
    });
  },

  async update(id, data) {
    return prisma.account.update({
      where: {
        id: Number(id),
      },
      data,
    });
  },

  async deactivate(id) {
    return prisma.account.update({
      where: {
        id: Number(id),
      },
      data: {
        is_active: false,
      },
    });
  },
};
