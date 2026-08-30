import { PurchaseOrderModel } from "../models/purchaseOrder.model.js";
import { NumberingService } from "../services/numbering.service.js";

export const PurchaseOrderController = {
  async list(req, res) {
    try {
      const list = await PurchaseOrderModel.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const po = await PurchaseOrderModel.findById(req.params.id);
      if (!po) {
        return res.status(404).json({ message: "ไม่พบใบสั่งซื้อนี้" });
      }
      res.json(po);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const poNo = await NumberingService.nextNo("PO");
      const po = await PurchaseOrderModel.create({ ...req.body, po_no: poNo });
      res.status(201).json(po);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const po = await PurchaseOrderModel.update(req.params.id, req.body);
      res.json(po);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async approve(req, res) {
    try {
      const po = await PurchaseOrderModel.findById(req.params.id);
      if (!po) {
        return res.status(404).json({ message: "ไม่พบใบสั่งซื้อนี้" });
      }
      if (po.status !== "draft") {
        return res.status(400).json({ message: "อนุมัติได้เฉพาะใบสถานะ draft" });
      }
      const updated = await PurchaseOrderModel.setStatus(po.id, "approved");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async cancel(req, res) {
    try {
      const po = await PurchaseOrderModel.findById(req.params.id);
      if (!po) {
        return res.status(404).json({ message: "ไม่พบใบสั่งซื้อนี้" });
      }
      if (po.status === "cancelled") {
        return res.status(400).json({ message: "ใบนี้ยกเลิกไปแล้ว" });
      }
      const updated = await PurchaseOrderModel.setStatus(po.id, "cancelled");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
