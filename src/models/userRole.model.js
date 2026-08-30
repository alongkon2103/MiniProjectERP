import { prisma } from "../config/prisma.js";


export const UserRoleModel = {
  async findByUser(userId) {
    return prisma.user_role.findMany({
      where: { user_id: Number(userId) },
      include: { role: true },
    });
  },

  async assign(userId, roleId) {
    return prisma.user_role.create({
      data: { user_id: Number(userId), role_id: Number(roleId) },
    });
  },

  async remove(userId, roleId) {
    return prisma.user_role.deleteMany({
      where: { user_id: Number(userId), role_id: Number(roleId) },
    });
  },
};
