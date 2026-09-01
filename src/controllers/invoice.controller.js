import { InvoiceModel } from "../models/invoice.model.js";
import { InvoiceService } from "../services/invoice.service.js";
import { NumberingService } from "../services/numbering.service.js";

export const InvoiceController = {
  async list(req, res) {
    try {
      const list = await InvoiceModel.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const invoice = await InvoiceModel.findById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "ไม่พบใบแจ้งหนี้นี้" });
      }
      res.json(invoice);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const invNo = await NumberingService.nextNo("INV");
      const invoice = await InvoiceModel.create({ ...req.body, inv_no: invNo });
      res.status(201).json(invoice);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async post(req, res) {
    try {
      const userId = req.user.id; // ผู้ post มาจาก token ที่ login
      const invoice = await InvoiceService.post(req.params.id, userId);
      res.json(invoice);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
