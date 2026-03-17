const express = require('express');
const router = express.Router();
const padraoRespostaController = require('../controllers/padraoRespostaController');

router.get('/padraoresposta', padraoRespostaController.getPadraoResposta);
router.get('/padraoresposta/:id', padraoRespostaController.getPadraoRespostaById);
router.post('/padraoresposta', padraoRespostaController.postPadraoResposta);
router.put('/padraoresposta/:id', padraoRespostaController.putPadraoResposta);
router.delete('/padraoresposta/:id', padraoRespostaController.deletePadraoResposta);



module.exports = router;