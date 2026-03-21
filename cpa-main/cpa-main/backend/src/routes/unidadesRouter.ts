import express from 'express';
const router = express.Router();
import * as unidadesController from '../controllers/unidadesController';

// Rota correta para buscar unidades por múltiplos municípios
router.get('/unidades/municipios', unidadesController.getUnidadesByMunicipios);
// Rota para listar todas as unidades
router.get('/unidades', unidadesController.getUnidades);

// Rota para buscar uma unidade específica pelo ID
router.get('/unidades/:id', unidadesController.getUnidadeById);



export default router;
