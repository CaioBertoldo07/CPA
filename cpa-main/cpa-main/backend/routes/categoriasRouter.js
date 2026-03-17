const express = require('express');
const router = express.Router();
categoriasController = require('../controllers/categoriasController');


router.get('/categorias', categoriasController.getCategorias)
router.post('/categorias', categoriasController.postCategorias)
router.delete('/categorias/:id', categoriasController.deleteCategorias)
router.put('/categorias/:id', categoriasController.updateCategorias)

module.exports = router;