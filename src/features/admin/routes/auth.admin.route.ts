import express from "express";
import { validateLogin } from "../../../validators/userValidator";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import AuthController from "../../authenetication/controllers/auth.controller";
import { UserController } from "../../users/user.controller";

const router = express.Router();

router.post("/admin-login",authenticate, isAdmin, validateLogin,AuthController.login);
router.post("/admin-register",authenticate, isAdmin,AuthController.register);
router.post("/admin-logout",authenticate, isAdmin,AuthController.logout);
router.get("/allUsers",authenticate, isAdmin,UserController.getUsers);
router.get("/roles",authenticate, isAdmin,UserController.getAdmins);
router.patch("/update/:userId",authenticate,isAdmin, UserController.updateUser);
router.get("/allUsers/:userId",authenticate, isAdmin,UserController.getUserById);
router.delete("/delete/:userId",authenticate, isAdmin,UserController.deleteUser);

export default router;