import express from 'express';
const router = express.Router();
import * as questoesController from '../controllers/questoesController';

router.get('/questoes', questoesController.getQuestoes);
router.post('/questoes', questoesController.postQuestoes)
router.delete('/questoes/:id', questoesController.deleteQuestoes)
router.put('/questoes/:id', questoesController.updateQuestoes)
router.get('/questoes/:id', questoesController.getQuestaoById)


export default router;