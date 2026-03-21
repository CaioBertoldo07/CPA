import express from 'express';
const router = express.Router();
import * as modalidadesController from '../controllers/modalidadesController';

router.post('/modalidades', modalidadesController.postModalidades);
router.get('/modalidades', modalidadesController.getModalidades);
router.put('/modalidades/:id', modalidadesController.updateModalidades);
router.get('/modalidades/:id', modalidadesController.getModalidadesByNumero); 
router.delete('/modalidades/:id', modalidadesController.deleteModalidades);

export default router;
