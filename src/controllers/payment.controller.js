import { PaymentModel } from "../models/payment.model.js";
import { PaymentService } from "../services/payment.service.js";
import { NumberingService } from "../services/numbering.service.js";

export const PaymentController = {
  async list(req, res) {
    try {
      const list = await PaymentModel.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const payment = await PaymentModel.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: "ไม่พบใบจ่ายเงินนี้" });
      }
      res.json(payment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // สร้าง draft — ออกเลข payment_no อัตโนมัติ
  async create(req, res) {
    try {
      const paymentNo = await NumberingService.nextNo("PAY");
      const payment = await PaymentModel.create({ ...req.body, payment_no: paymentNo });
      res.status(201).json(payment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // post — ลงบัญชีจ่ายเงิน
  async post(req, res) {
    try {
      const userId = req.user.id; // ผู้ post มาจาก token ที่ login
      const payment = await PaymentService.post(req.params.id, userId);
      res.json(payment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
