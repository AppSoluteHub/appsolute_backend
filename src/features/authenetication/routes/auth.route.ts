// import express from "express";
// import AuthController from "../controllers/auth.controller";
// import { validateRegister,validateLogin,validateForgotPassword,validateResetPassword } from "../../../validators/userValidator";
// import authenticate from "../../../middlewares/auth.middleware";

// const router = express.Router();

// router.post("/register" ,validateRegister, AuthController.register);
// router.post("/login", validateLogin, AuthController.login);
// router.post("/login", validateLogin, AuthController.login);
// router.post("/forgot-password",validateForgotPassword, AuthController.forgotPassword);
// router.post("/reset-password",validateResetPassword, AuthController.resetPassword);
// router.post("/logout", AuthController.logout);



// export default router;


import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();


router.post("/register", AuthController.register);

router.get("/verify-email", AuthController.verifyEmail);

router.post("/resend-verification", AuthController.resendVerificationEmail);

router.post("/login", AuthController.login);

router.post("/forgot-password", AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

router.post("/logout", AuthController.logout);

router.get("/user/:id", AuthController.getUserById);

export default router;
