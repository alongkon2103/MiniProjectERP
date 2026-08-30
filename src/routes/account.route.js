import { Router } from "express";
import { AccountController } from "../controllers/account.controller.js";

export const accountRouter = Router();

accountRouter.get("/", AccountController.list);
accountRouter.get("/:id", AccountController.getById);
accountRouter.post("/", AccountController.create);
accountRouter.put("/:id", AccountController.update);
accountRouter.delete("/:id", AccountController.deactivate);
