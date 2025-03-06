import express from 'express'
import authenticate, { isAdmin } from '../../../middlewares/auth.middleware'
import AuthController from '../../authenetication/controllers/auth.controller'
import { UserController } from '../../users/user.controller'

const router = express.Router()
router.post('/loginAdmin', authenticate, isAdmin, AuthController.login );
router.get('/users', authenticate, isAdmin, UserController.getUsers );
router.get('/userId', authenticate, isAdmin, UserController.getUserById );
router.delete('/userId', authenticate, isAdmin, UserController.deleteUser );

export default router