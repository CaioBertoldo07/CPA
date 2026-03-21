import express from 'express';
const router = express.Router();
import * as municipiosController from '../controllers/municipiosController';

router.get('/municipios', municipiosController.getMunicipios);
router.get('/municipios/:id', municipiosController.getMunicipioById);

export default router;
