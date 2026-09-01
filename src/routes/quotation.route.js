import { Router } from "express";
import { QuotationController } from "../controllers/quotation.controller.js";

export const quotationRouter = Router();

quotationRouter.get("/", QuotationController.list);
quotationRouter.get("/:id", QuotationController.getById);
quotationRouter.post("/", QuotationController.create);
quotationRouter.put("/:id", QuotationController.update);
quotationRouter.post("/:id/submit", QuotationController.submit);   // ส่งให้ลูกค้า
quotationRouter.post("/:id/approve", QuotationController.approve); // ลูกค้าตอบรับ
quotationRouter.post("/:id/cancel", QuotationController.cancel);   // ยกเลิก
