import { ShipmentModel } from "../models/shipment.model.js";
import { ShipmentService } from "../services/shipment.service.js";
import { NumberingService } from "../services/numbering.service.js";

export const ShipmentController = {
  async list(req, res) {
    try {
      const list = await ShipmentModel.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const shipment = await ShipmentModel.findById(req.params.id);
      if (!shipment) {
        return res.status(404).json({ message: "ไม่พบใบส่งของนี้" });
      }
      res.json(shipment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const shNo = await NumberingService.nextNo("SH");
      const shipment = await ShipmentModel.create({ ...req.body, sh_no: shNo });
      res.status(201).json(shipment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async post(req, res) {
    try {
      const userId = req.user.id; // ผู้ post มาจาก token ที่ login
      const shipment = await ShipmentService.post(req.params.id, userId);
      res.json(shipment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
