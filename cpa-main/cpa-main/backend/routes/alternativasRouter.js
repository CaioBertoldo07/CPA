const express = require('express');
const router = express.Router();
const alternativasController = require('../controllers/alternativasController');

router.get('/alternativas', alternativasController.getAlternativas);
router.get('/alternativas/:id', alternativasController.getAlternativaById);
router.post('/alternativas', alternativasController.postAlternativas);
router.put('/alternativas/:id', alternativasController.putAlternativas);
router.delete('/alternativas/:id', alternativasController.deleteAlternativas);
router.get('/alternativas/byIdPadrao/:id', alternativasController.getAlternativasByPadraoRespostaId);

module.exports = router;