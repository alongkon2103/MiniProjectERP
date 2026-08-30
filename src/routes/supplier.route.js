import { Router } from "express";
import { SupplierController } from "../controllers/supplier.controller.js";

export const supplierRouter = Router();

supplierRouter.get("/", SupplierController.list);
supplierRouter.get("/:id", SupplierController.getById);
supplierRouter.post("/", SupplierController.create);
supplierRouter.put("/:id", SupplierController.update);
supplierRouter.delete("/:id", SupplierController.deactivate);
