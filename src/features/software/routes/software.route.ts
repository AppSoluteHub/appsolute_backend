import { Router } from 'express';
import * as softwareController from '../controllers/software.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createSoftwareDto, updateSoftwareDto } from '../dto/software.dto';
import authenticate, { isAdmin } from '../../../middlewares/auth.middleware';
import { is } from 'cheerio/dist/commonjs/api/traversing';

const router = Router();

router.post('/',authenticate,isAdmin, validateRequest(createSoftwareDto), softwareController.createSoftware);
router.get('/', softwareController.getAllSoftware);
router.get('/:id', softwareController.getSoftwareById);
router.patch('/:id', authenticate, isAdmin,validateRequest(updateSoftwareDto), softwareController.updateSoftware);
router.delete('/:id',authenticate, isAdmin, softwareController.deleteSoftware);

export default router;