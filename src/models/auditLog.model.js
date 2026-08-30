import { prisma } from "../config/prisma.js";


export const AuditLogModel = {
  async create(data) {
    return prisma.audit_log.create({ data });
  },


  async findAll() {
    return prisma.audit_log.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
    });
  },

  async findByEntity(entity, entityId) {
    return prisma.audit_log.findMany({
      where: { entity, entity_id: Number(entityId) },
      orderBy: { created_at: "desc" },
    });
  },
};
