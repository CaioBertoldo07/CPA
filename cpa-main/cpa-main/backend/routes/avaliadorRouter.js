const express = require('express');
const router = express.Router();
const avaliadorController = require('../controllers/avaliadorController');

router.get('/avaliadores', avaliadorController.getAvaliadores);
router.post('/avaliadores', avaliadorController.createAvaliador);
router.get('/avaliadores/:id', avaliadorController.getAvaliadorById);
router.put('/avaliadores/:id', avaliadorController.updateAvaliador);
router.delete('/avaliadores/:id', avaliadorController.deleteAvaliador);

module.exports = router;
