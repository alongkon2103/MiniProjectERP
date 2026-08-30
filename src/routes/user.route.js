import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/", UserController.list);
userRouter.get("/:id", UserController.getById);
userRouter.post("/", UserController.create);
userRouter.put("/:id", UserController.update);
userRouter.delete("/:id", UserController.deactivate);
