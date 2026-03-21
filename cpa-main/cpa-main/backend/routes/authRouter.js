console.log('Carregando authRouter...');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
// router.post('/login-dev', authController.loginDev);
router.post('/register', authController.register);

module.exports = router;