import { Router } from "express";
import { SupplierBillController } from "../controllers/supplierBill.controller.js";

export const supplierBillRouter = Router();

supplierBillRouter.get("/", SupplierBillController.list);
supplierBillRouter.get("/:id", SupplierBillController.getById);
supplierBillRouter.post("/", SupplierBillController.create);
supplierBillRouter.post("/:id/post", SupplierBillController.post); 
