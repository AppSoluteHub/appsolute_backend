import express from "express";
import { UserController } from "./user.controller";
import authenticate, { isAdmin } from "../../middlewares/auth.middleware";
import { validateUpdateUser } from "../../validators/userValidator";
import multer from "multer";

const upload = multer();

const router = express.Router();
router.get("/", UserController.getUsers);
router.get("/:userId", UserController.getUserById);
router.delete("/:userId",UserController.deleteUser);
// router.patch("/:userId",authenticate, validateUpdateUser, UserController.updateUser);
router.patch(
  "/role",
  authenticate,       
       isAdmin,
  UserController.updateUserRole
);
router.patch("/profile/:userId",authenticate,upload.single("file"), UserController.updateProfileImage);
router.patch("/:userId",authenticate, validateUpdateUser, UserController.updateUser);


export default router;
