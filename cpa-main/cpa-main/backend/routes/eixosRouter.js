const express = require('express');
const router = express.Router();
const eixosController = require('../controllers/eixosController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');


router.get('/eixos', authorize(['read:eixos']), eixosController.getEixos);
router.get('/eixos/:numeroEixo', authorize(['read:eixos']), eixosController.getEixoByNumero);
router.post('/eixos', authorize(['write:eixos']) , eixosController.postEixos);
router.put('/eixos/:numero', eixosController.updateEixos);  // Corrigido para incluir o parâmetro :id
router.delete('/eixos/:numero', eixosController.deleteEixos);

module.exports = router;
