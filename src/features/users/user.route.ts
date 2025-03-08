import express from "express";
import { UserController } from "./user.controller";
import authenticate from "../../middlewares/auth.middleware";
import { validateUpdateUser } from "../../validators/userValidator";
import { UploadStream } from "cloudinary";
import { upload } from "../..";

const router = express.Router();
router.get("/",authenticate, UserController.getUsers);
router.get("/:userId",authenticate, UserController.getUserById);
router.delete("/:userId",authenticate, UserController.deleteUser);
router.patch("/:userId", authenticate, validateUpdateUser, UserController.updateUser);


export default router;
