import { prisma } from "../config/prisma.js";

// รับของ (GR) — เก็บว่ารับอะไรเข้ามาเท่าไร ต้นทุนเท่าไร
// ตอน post ค่อยให้ engine สต๊อกเอา line พวกนี้ไปสร้าง stock_movement (ของเข้า)
export const GoodsReceiptModel = {
  async findAll() {
    return prisma.goods_receipt.findMany({
      include: { supplier: true },
      orderBy: { id: "desc" },
    });
  },

  async findById(id) {
    return prisma.goods_receipt.findUnique({
      where: { id: Number(id) },
      include: {
        supplier: true,
        purchase_order: true,
        line: { include: { product: true } },
      },
    });
  },

  // data = { gr_no, gr_date, supplier_id, po_id?, note, created_by,
  //          lines: [{ product_id, qty, unit_cost, po_line_id? }] }
  async create(data) {
    const { lines, ...receiptData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.goods_receipt.create({
      data: {
        ...receiptData,
        line: {
          create: lineData,
        },
      },
      include: {
        line: true,
      },
    });
  },

  async update(id, data) {
    const { lines, ...receiptData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.goods_receipt.update({
      where: { id: Number(id) },
      data: {
        ...receiptData,
        line: {
          deleteMany: {}, // ลบ line เดิมก่อน แล้วสร้างใหม่
          create: lineData,
        },
      },
      include: {
        line: true,
      },
    });
  },

  // ลบได้เฉพาะ draft ที่ยังไม่ post
  async remove(id) {
    return prisma.goods_receipt.delete({
      where: { id: Number(id) },
    });
  },
};
