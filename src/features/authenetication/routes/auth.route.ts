import express from "express";
import AuthController from "../controllers/auth.controller";
import { validateRegister,validateLogin,validateForgotPassword,validateResetPassword } from "../../../validators/userValidator";

const router = express.Router();

router.post("/register" ,validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.post("/forgot-password",validateForgotPassword, AuthController.forgotPassword);
router.post("/reset-password",validateResetPassword, AuthController.resetPassword);
router.post("/logout", AuthController.logout);

export default router;
