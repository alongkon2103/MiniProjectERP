import { Router } from "express";
import { PurchaseOrderController } from "../controllers/purchaseOrder.controller.js";

export const purchaseOrderRouter = Router();

purchaseOrderRouter.get("/", PurchaseOrderController.list);
purchaseOrderRouter.get("/:id", PurchaseOrderController.getById);
purchaseOrderRouter.post("/", PurchaseOrderController.create);
purchaseOrderRouter.put("/:id", PurchaseOrderController.update);
purchaseOrderRouter.post("/:id/approve", PurchaseOrderController.approve); 
purchaseOrderRouter.post("/:id/cancel", PurchaseOrderController.cancel); 
