import express from "express";
import { UserController } from "./user.controller";
import authenticate from "../../middlewares/auth.middleware";
import { validateUpdateUser } from "../../validators/userValidator";

const router = express.Router();
router.get("/", UserController.getUsers);
router.get("/:userId", UserController.getUserById);
router.delete("/:userId", authenticate,UserController.deleteUser);
router.patch("/:userId",authenticate, validateUpdateUser, UserController.updateUser);
router.patch("/:userId",authenticate, validateUpdateUser, UserController.updateProfileImage);


export default router;
