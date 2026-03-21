import express from 'express';
const router = express.Router();
import * as padraoRespostaController from '../controllers/padraoRespostaController';

router.get('/padraoresposta', padraoRespostaController.getPadraoResposta);
router.get('/padraoresposta/:id', padraoRespostaController.getPadraoRespostaById);
router.post('/padraoresposta', padraoRespostaController.postPadraoResposta);
router.put('/padraoresposta/:id', padraoRespostaController.putPadraoResposta);
router.delete('/padraoresposta/:id', padraoRespostaController.deletePadraoResposta);



export default router;