import { Router } from "express";
import { ShipmentController } from "../controllers/shipment.controller.js";

export const shipmentRouter = Router();

shipmentRouter.get("/", ShipmentController.list);
shipmentRouter.get("/:id", ShipmentController.getById);
shipmentRouter.post("/", ShipmentController.create);
shipmentRouter.post("/:id/post", ShipmentController.post); 
