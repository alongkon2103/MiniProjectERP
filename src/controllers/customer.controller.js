import { CustomerModel } from "../models/customer.model.js";

export const CustomerController = {
  async list(req, res) {
    try {
      const customers = await CustomerModel.findAll();
      res.json(customers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const customer = await CustomerModel.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "ไม่พบลูกค้ารายนี้" });
      }
      res.json(customer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const customer = await CustomerModel.create(req.body);
      res.status(201).json(customer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const customer = await CustomerModel.update(req.params.id, req.body);
      res.json(customer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async deactivate(req, res) {
    try {
      const customer = await CustomerModel.deactivate(req.params.id);
      res.json(customer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
