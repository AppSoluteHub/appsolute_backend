import express from "express";
import { UserController } from "./user.controller";
import authenticate from "../../middlewares/auth.middleware";

const router = express.Router();

router.get("/users",authenticate, UserController.getUsers);
router.get("/users/:userId",authenticate, UserController.getUserById);
router.delete("/users/:userId",authenticate, UserController.deleteUser);
router.put("/users/:userId", authenticate,UserController.updateUser);

export default router;
