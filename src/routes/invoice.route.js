import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller.js";

export const invoiceRouter = Router();

invoiceRouter.get("/", InvoiceController.list);
invoiceRouter.get("/:id", InvoiceController.getById);
invoiceRouter.post("/", InvoiceController.create);
invoiceRouter.post("/:id/post", InvoiceController.post); // ลงบัญชีขาย
