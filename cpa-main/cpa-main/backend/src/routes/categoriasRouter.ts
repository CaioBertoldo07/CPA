import express from 'express';
const router = express.Router();
import * as categoriasController from '../controllers/categoriasController';


router.get('/categorias', categoriasController.getCategorias)
router.post('/categorias', categoriasController.postCategorias)
router.delete('/categorias/:id', categoriasController.deleteCategorias)
router.put('/categorias/:id', categoriasController.updateCategorias)

export default router;