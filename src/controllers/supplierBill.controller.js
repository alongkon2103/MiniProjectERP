import { SupplierBillModel } from "../models/supplierBill.model.js";
import { SupplierBillService } from "../services/supplierBill.service.js";
import { NumberingService } from "../services/numbering.service.js";

export const SupplierBillController = {
  async list(req, res) {
    try {
      const list = await SupplierBillModel.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const bill = await SupplierBillModel.findById(req.params.id);
      if (!bill) {
        return res.status(404).json({ message: "ไม่พบใบตั้งหนี้นี้" });
      }
      res.json(bill);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const billNo = await NumberingService.nextNo("BILL");
      const bill = await SupplierBillModel.create({ ...req.body, bill_no: billNo });
      res.status(201).json(bill);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async post(req, res) {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ message: "ต้องระบุ userId (ผู้ post)" });
      }
      const bill = await SupplierBillService.post(req.params.id, userId);
      res.json(bill);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
