import { prisma } from "../config/prisma.js";


export const RolePermissionModel = {
  async findByRole(roleId) {
    return prisma.role_permission.findMany({
      where: { role_id: Number(roleId) },
      include: { permission: true },
    });
  },


  async assign(roleId, permissionId) {
    return prisma.role_permission.create({
      data: { role_id: Number(roleId), permission_id: Number(permissionId) },
    });
  },


  async remove(roleId, permissionId) {
    return prisma.role_permission.deleteMany({
      where: { role_id: Number(roleId), permission_id: Number(permissionId) },
    });
  },
};
