import { GoodsReceiptModel } from "../models/goodsReceipt.model.js";
import { GoodsReceiptService } from "../services/goodsReceipt.service.js";
import { NumberingService } from "../services/numbering.service.js";

export const GoodsReceiptController = {
  async list(req, res) {
    try {
      const list = await GoodsReceiptModel.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const gr = await GoodsReceiptModel.findById(req.params.id);
      if (!gr) {
        return res.status(404).json({ message: "ไม่พบใบรับของนี้" });
      }
      res.json(gr);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const grNo = await NumberingService.nextNo("GR");
      const gr = await GoodsReceiptModel.create({ ...req.body, gr_no: grNo });
      res.status(201).json(gr);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async post(req, res) {
    try {
      const userId = req.user.id; // ผู้ post มาจาก token ที่ login
      const gr = await GoodsReceiptService.post(req.params.id, userId);
      res.json(gr);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
