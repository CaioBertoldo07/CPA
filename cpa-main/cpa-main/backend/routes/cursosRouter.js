// routes/cursos.js
const express = require('express');
const router = express.Router();
const cursosController = require('../controllers/cursosController');

// Endpoint para obter cursos por unidade

router.get('/cursos/by-unidades', cursosController.getCursosByUnidadesIds);
router.get('/cursos/by-modalidades', cursosController.getCursosByModalidade);
router.get('/cursos', cursosController.getTodosCursos);

module.exports = router;