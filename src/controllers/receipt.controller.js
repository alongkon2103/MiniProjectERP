import { ReceiptModel } from "../models/receipt.model.js";
import { ReceiptService } from "../services/receipt.service.js";
import { NumberingService } from "../services/numbering.service.js";

export const ReceiptController = {
  async list(req, res) {
    try {
      const list = await ReceiptModel.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const receipt = await ReceiptModel.findById(req.params.id);
      if (!receipt) {
        return res.status(404).json({ message: "ไม่พบใบรับเงินนี้" });
      }
      res.json(receipt);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const receiptNo = await NumberingService.nextNo("RCV");
      const receipt = await ReceiptModel.create({ ...req.body, receipt_no: receiptNo });
      res.status(201).json(receipt);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async post(req, res) {
    try {
      const userId = req.user.id; // ผู้ post มาจาก token ที่ login
      const receipt = await ReceiptService.post(req.params.id, userId);
      res.json(receipt);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
