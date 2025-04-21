import express from "express";
import { validateLogin } from "../../../validators/userValidator";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import AuthController from "../../authenetication/controllers/auth.controller";
import { UserController } from "../../users/user.controller";
const router = express.Router();

router.post("/admin-login",authenticate, isAdmin, validateLogin,AuthController.login);
router.post("/admin-register",authenticate, isAdmin, validateLogin,AuthController.register);
router.post("/allUsers",authenticate, isAdmin, validateLogin,UserController.getUsers);
router.post("/roles",authenticate, isAdmin, validateLogin,UserController.getAdmins);
router.post("/update/:userId",authenticate, isAdmin, validateLogin,UserController.updateUser);
router.post("/allUsers/:userId",authenticate, isAdmin, validateLogin,UserController.getUserById);
router.post("/admin-logout",authenticate, isAdmin,AuthController.logout);
export default router;