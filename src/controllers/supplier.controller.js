import { SupplierModel } from "../models/supplier.model.js";

export const SupplierController = {
  async list(req, res) {
    try {
      const suppliers = await SupplierModel.findAll();
      res.json(suppliers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const supplier = await SupplierModel.findById(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "ไม่พบผู้ขายรายนี้" });
      }
      res.json(supplier);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const supplier = await SupplierModel.create(req.body);
      res.status(201).json(supplier);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const supplier = await SupplierModel.update(req.params.id, req.body);
      res.json(supplier);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async deactivate(req, res) {
    try {
      const supplier = await SupplierModel.deactivate(req.params.id);
      res.json(supplier);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
