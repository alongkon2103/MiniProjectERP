import { Router } from "express";
import { PurchaseRequisitionController } from "../controllers/purchaseRequisition.controller.js";

export const purchaseRequisitionRouter = Router();

purchaseRequisitionRouter.get("/", PurchaseRequisitionController.list);
purchaseRequisitionRouter.get("/:id", PurchaseRequisitionController.getById);
purchaseRequisitionRouter.post("/", PurchaseRequisitionController.create);
purchaseRequisitionRouter.put("/:id", PurchaseRequisitionController.update);
purchaseRequisitionRouter.post("/:id/submit", PurchaseRequisitionController.submit); 
purchaseRequisitionRouter.post("/:id/approve", PurchaseRequisitionController.approve);  
purchaseRequisitionRouter.post("/:id/cancel", PurchaseRequisitionController.cancel);    
