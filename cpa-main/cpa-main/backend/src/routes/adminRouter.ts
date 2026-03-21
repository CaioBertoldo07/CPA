import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/adminController';


router.get('/admin', adminController.getAllAdmins);
router.post('/admin', adminController.postAdmin);
router.put('/admin/:email', adminController.updateAdmin);
router.delete('/admin/:email', adminController.deleteAdmin);

export default router;
