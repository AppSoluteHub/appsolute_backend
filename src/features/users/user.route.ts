import express from "express";
import { UserController } from "./user.controller";
import authenticate, { isAdmin } from "../../middlewares/auth.middleware";
import { validateUpdateUser } from "../../validators/userValidator";
import multer from "multer";

const upload = multer();

const router = express.Router();
router.get("/",authenticate, isAdmin, UserController.getUsers);
router.get("/allAdmins",authenticate, isAdmin, UserController.getAdmins);
router.get("/roles",authenticate, isAdmin, UserController.getRoles);
router.get("/:userId",authenticate,isAdmin, UserController.getUserById);
router.delete("/:userId",authenticate, isAdmin, UserController.deleteUser);

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
