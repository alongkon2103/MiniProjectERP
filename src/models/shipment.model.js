import { prisma } from "../config/prisma.js";

// ส่งของ (Shipment) — เก็บว่าส่งอะไรออกเท่าไร (line มีแค่ qty)
// ตอน post ค่อยให้ stock engine ตัดของออกตามต้นทุนถัวเฉลี่ย
export const ShipmentModel = {
  async findAll() {
    return prisma.shipment.findMany({
      include: { customer: true },
      orderBy: { id: "desc" },
    });
  },

  async findById(id) {
    return prisma.shipment.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        sales_order: true,
        line: { include: { product: true } },
      },
    });
  },

  async create(data) {
    const { lines, ...shipmentData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.shipment.create({
      data: {
        ...shipmentData,
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
    const { lines, ...shipmentData } = data;

    const lineData = lines.map((line, index) => ({
      ...line,
      line_no: index + 1,
    }));

    return prisma.shipment.update({
      where: { id: Number(id) },
      data: {
        ...shipmentData,
        line: {
          deleteMany: {},
          create: lineData,
        },
      },
      include: {
        line: true,
      },
    });
  },

  async remove(id) {
    return prisma.shipment.delete({
      where: { id: Number(id) },
    });
  },
};
