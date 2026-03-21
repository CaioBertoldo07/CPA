// /src/routes/dimensoesRoutes.js
import express from 'express';
const router = express.Router();
import * as dimensoesController from '../controllers/dimensoesController';

// Rota para obter uma dimensão pelo número
router.get('/numero/:numero', dimensoesController.getDimensaoByNumero);

// Rota para obter dimensões por número do eixo
router.get('/eixo/:numeroEixo', dimensoesController.getDimensoesByEixo);

// Rota para obter o número do eixo associado a uma dimensão
router.get('/eixo/numero/:numeroDimensao', dimensoesController.getNumeroEixoByDimensao);


// Rota para criar uma nova dimensão
router.get('/', dimensoesController.getDimensoes);
router.post('/', dimensoesController.postDimensoes);

// Rota para deletar uma dimensão pelo número
router.delete('/:numero', dimensoesController.deleteDimensao);

// Rota para atualizar uma dimensão
router.put('/:numero', dimensoesController.updateDimensao);

export default router;