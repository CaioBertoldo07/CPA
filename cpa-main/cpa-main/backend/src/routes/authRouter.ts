import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController';

router.post('/login', authController.login);
// router.post('/login-dev', authController.loginDev);
router.post('/register', authController.register);

export default router;