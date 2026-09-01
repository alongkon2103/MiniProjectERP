import { QuotationModel } from "../models/quotation.model.js";
import { NumberingService } from "../services/numbering.service.js";

export const QuotationController = {
  async list(req, res) {
    try {
      const list = await QuotationModel.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const qt = await QuotationModel.findById(req.params.id);
      if (!qt) {
        return res.status(404).json({ message: "ไม่พบใบเสนอราคานี้" });
      }
      res.json(qt);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const qtNo = await NumberingService.nextNo("QT");
      const qt = await QuotationModel.create({ ...req.body, qt_no: qtNo });
      res.status(201).json(qt);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const qt = await QuotationModel.update(req.params.id, req.body);
      res.json(qt);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async submit(req, res) {
    try {
      const qt = await QuotationModel.findById(req.params.id);
      if (!qt) {
        return res.status(404).json({ message: "ไม่พบใบเสนอราคานี้" });
      }
      if (qt.status !== "draft") {
        return res.status(400).json({ message: "ส่งได้เฉพาะใบสถานะ draft" });
      }
      const updated = await QuotationModel.setStatus(qt.id, "pending");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // pending -> approved (ลูกค้าตอบรับ)
  async approve(req, res) {
    try {
      const qt = await QuotationModel.findById(req.params.id);
      if (!qt) {
        return res.status(404).json({ message: "ไม่พบใบเสนอราคานี้" });
      }
      if (qt.status !== "pending") {
        return res.status(400).json({ message: "ตอบรับได้เฉพาะใบที่ส่งแล้ว (pending)" });
      }
      const updated = await QuotationModel.setStatus(qt.id, "approved");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // -> cancelled
  async cancel(req, res) {
    try {
      const qt = await QuotationModel.findById(req.params.id);
      if (!qt) {
        return res.status(404).json({ message: "ไม่พบใบเสนอราคานี้" });
      }
      if (qt.status === "cancelled") {
        return res.status(400).json({ message: "ใบนี้ยกเลิกไปแล้ว" });
      }
      const updated = await QuotationModel.setStatus(qt.id, "cancelled");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
