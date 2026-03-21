// routes/cursos.js
import express from 'express';
const router = express.Router();
import * as cursosController from '../controllers/cursosController';

// Endpoint para obter cursos por unidade

router.get('/cursos/by-unidades', cursosController.getCursosByUnidadesIds);
router.get('/cursos/by-modalidades', cursosController.getCursosByModalidade);
router.get('/cursos', cursosController.getTodosCursos);

export default router;