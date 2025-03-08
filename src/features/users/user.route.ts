import express from "express";
import { UserController } from "./user.controller";
import authenticate from "../../middlewares/auth.middleware";
import { validateUpdateUser } from "../../validators/userValidator";
import { UploadStream } from "cloudinary";
import { upload } from "../..";

const router = express.Router();
router.get("/", UserController.getUsers);
router.get("/:userId", UserController.getUserById);
router.delete("/:userId", UserController.deleteUser);
router.patch("/:userId", validateUpdateUser, UserController.updateUser);


export default router;
