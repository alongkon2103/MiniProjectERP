import { prisma } from "../config/prisma.js";

export const ProductCategoryModel = {
  async findAll() {
    return prisma.product_category.findMany({
      orderBy: { code: "asc" },
    });
  },

  async findById(id) {
    return prisma.product_category.findUnique({
      where: { id: Number(id) },
    });
  },

  async create(data) {
    return prisma.product_category.create({ data });
  },

  async update(id, data) {
    return prisma.product_category.update({
      where: { id: Number(id) },
      data,
    });
  },
};
