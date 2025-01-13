import express from "express";
import AuthController from "../controllers/auth.controller";
import { validateRegister,validateLogin,validateForgotPassword,validateResetPassword } from "../../../validators/userValidator";
import { UserController } from "../../users/user.controller";
import authenticate from "../../../middlewares/auth.middleware";

const router = express.Router();

router.post("/register" ,validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.post("/forgot-password",validateForgotPassword, AuthController.forgotPassword);
router.post("/reset-password",validateResetPassword, AuthController.resetPassword);
router.post("/logout", AuthController.logout);


router.get("/",authenticate, UserController.getUsers);
router.get("/:userId",authenticate, UserController.getUserById);
router.delete("/:userId",authenticate, UserController.deleteUser);
router.put("/:userId", authenticate,UserController.updateUser);


export default router;
