
import { Router } from "express";
import { AdminController } from "../controllers/manageUser.controller";
import authenticate from "../../../middlewares/auth.middleware"; 
import { authorizeRole } from "../authorize"; 

const  router = Router();
router.post("/add-admin", authenticate, authorizeRole("SUPERADMIN"), AdminController.addAdmin);
router.post("/remove-admin", authenticate, authorizeRole("SUPERADMIN"), AdminController.removeAdmin);
export default router;
