import { prisma } from "../config/prisma.js";

const safeFields = {
  id: true,
  username: true,
  full_name: true,
  email: true,
  is_active: true,
  created_at: true,
  updated_at: true,
};

export const UserModel = {
  async findAll() {
    return prisma.app_user.findMany({
      where: { is_active: true },
      select: safeFields,
      orderBy: { username: "asc" },
    });
  },

  async findById(id) {
    return prisma.app_user.findUnique({
      where: { id: Number(id) },
      select: safeFields,
    });
  },

  async findByUsername(username) {
    return prisma.app_user.findUnique({
      where: { username },
    });
  },

  async create(data) {
    return prisma.app_user.create({ data, select: safeFields });
  },

  async update(id, data) {
    return prisma.app_user.update({
      where: { id: Number(id) },
      data,
      select: safeFields,
    });
  },

  async deactivate(id) {
    return prisma.app_user.update({
      where: { id: Number(id) },
      data: { is_active: false },
      select: safeFields,
    });
  },
};
