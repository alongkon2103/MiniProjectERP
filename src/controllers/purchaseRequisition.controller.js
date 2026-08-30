import { PurchaseRequisitionModel } from "../models/purchaseRequisition.model.js";
import { NumberingService } from "../services/numbering.service.js";

export const PurchaseRequisitionController = {
  async list(req, res) {
    try {
      const list = await PurchaseRequisitionModel.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const pr = await PurchaseRequisitionModel.findById(req.params.id);
      if (!pr) {
        return res.status(404).json({ message: "ไม่พบใบขอซื้อนี้" });
      }
      res.json(pr);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // สร้าง draft — ออกเลข pr_no อัตโนมัติ
  async create(req, res) {
    try {
      const prNo = await NumberingService.nextNo("PR");
      const pr = await PurchaseRequisitionModel.create({ ...req.body, pr_no: prNo });
      res.status(201).json(pr);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const pr = await PurchaseRequisitionModel.update(req.params.id, req.body);
      res.json(pr);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // draft -> pending (ส่งขออนุมัติ)
  async submit(req, res) {
    try {
      const pr = await PurchaseRequisitionModel.findById(req.params.id);
      if (!pr) {
        return res.status(404).json({ message: "ไม่พบใบขอซื้อนี้" });
      }
      if (pr.status !== "draft") {
        return res.status(400).json({ message: "ส่งขออนุมัติได้เฉพาะใบสถานะ draft" });
      }
      const updated = await PurchaseRequisitionModel.setStatus(pr.id, "pending");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async approve(req, res) {
    try {
      const pr = await PurchaseRequisitionModel.findById(req.params.id);
      if (!pr) {
        return res.status(404).json({ message: "ไม่พบใบขอซื้อนี้" });
      }
      if (pr.status !== "pending") {
        return res.status(400).json({ message: "อนุมัติได้เฉพาะใบที่ส่งขออนุมัติแล้ว (pending)" });
      }
      const updated = await PurchaseRequisitionModel.setStatus(pr.id, "approved");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async cancel(req, res) {
    try {
      const pr = await PurchaseRequisitionModel.findById(req.params.id);
      if (!pr) {
        return res.status(404).json({ message: "ไม่พบใบขอซื้อนี้" });
      }
      if (pr.status === "cancelled") {
        return res.status(400).json({ message: "ใบนี้ยกเลิกไปแล้ว" });
      }
      if (pr.status === "approved") {
        return res.status(400).json({ message: "ใบที่อนุมัติแล้ว ยกเลิกไม่ได้" });
      }
      const updated = await PurchaseRequisitionModel.setStatus(pr.id, "cancelled");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
