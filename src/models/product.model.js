import { prisma } from "../config/prisma.js";


export const ProductModel = {
  async findAll() {
    return prisma.product.findMany({
      where: { is_active: true },
      include: { unit: true, product_category: true },
      orderBy: { sku: "asc" },
    });
  },

  async findById(id) {
    return prisma.product.findUnique({
      where: { id: Number(id) },
      include: { unit: true, product_category: true },
    });
  },

  async findBySku(sku) {
    return prisma.product.findUnique({
      where: { sku },
    });
  },

  async getOnHand(id) {
    const result = await prisma.stock_movement.aggregate({
      where: { product_id: Number(id) },
      _sum: { qty_change: true },
    });
    return Number(result._sum.qty_change) || 0;
  },

  async findAllWithStock() {
    return prisma.$queryRaw`
      WITH stock AS (
          SELECT
              product_id,
              SUM(qty_change) AS on_hand
          FROM stock_movement
          GROUP BY product_id
      )

      SELECT
          p.id,
          p.sku,
          p.name,
          p.sale_price,
          p.reorder_point,

          u.id AS unit_id,
          u.code AS unit_code,
          u.name AS unit_name,

          pc.id AS category_id,
          pc.code AS category_code,
          pc.name AS category_name,

          COALESCE(stock.on_hand, 0) AS on_hand,

          COALESCE(stock.on_hand, 0) <= p.reorder_point AS low_stock

      FROM product p

      JOIN unit u
          ON u.id = p.unit_id

      LEFT JOIN product_category pc
          ON pc.id = p.category_id

      LEFT JOIN stock
          ON stock.product_id = p.id

      WHERE p.is_active = true

      ORDER BY p.sku ASC;
    `;
  },

  async create(data) {
    return prisma.product.create({ data });
  },

  async update(id, data) {
    return prisma.product.update({
      where: { id: Number(id) },
      data,
    });
  },

  async deactivate(id) {
    return prisma.product.update({
      where: { id: Number(id) },
      data: { is_active: false },
    });
  },
};
