import { SalesOrderModel } from "../models/salesOrder.model.js";
import { NumberingService } from "../services/numbering.service.js";

export const SalesOrderController = {
  async list(req, res) {
    try {
      const list = await SalesOrderModel.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const so = await SalesOrderModel.findById(req.params.id);
      if (!so) {
        return res.status(404).json({ message: "ไม่พบใบสั่งขายนี้" });
      }
      res.json(so);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const soNo = await NumberingService.nextNo("SO");
      const so = await SalesOrderModel.create({ ...req.body, so_no: soNo });
      res.status(201).json(so);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const so = await SalesOrderModel.update(req.params.id, req.body);
      res.json(so);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async approve(req, res) {
    try {
      const so = await SalesOrderModel.findById(req.params.id);
      if (!so) {
        return res.status(404).json({ message: "ไม่พบใบสั่งขายนี้" });
      }
      if (so.status !== "draft") {
        return res.status(400).json({ message: "อนุมัติได้เฉพาะใบสถานะ draft" });
      }
      const updated = await SalesOrderModel.setStatus(so.id, "approved");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async cancel(req, res) {
    try {
      const so = await SalesOrderModel.findById(req.params.id);
      if (!so) {
        return res.status(404).json({ message: "ไม่พบใบสั่งขายนี้" });
      }
      if (so.status === "cancelled") {
        return res.status(400).json({ message: "ใบนี้ยกเลิกไปแล้ว" });
      }
      const updated = await SalesOrderModel.setStatus(so.id, "cancelled");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
