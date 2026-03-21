import express from 'express';
const router = express.Router();
import * as avaliadorController from '../controllers/avaliadorController';

router.get('/avaliadores', avaliadorController.getAvaliadores);
router.post('/avaliadores', avaliadorController.createAvaliador);
router.get('/avaliadores/:id', avaliadorController.getAvaliadorById);
router.put('/avaliadores/:id', avaliadorController.updateAvaliador);
router.delete('/avaliadores/:id', avaliadorController.deleteAvaliador);

export default router;
