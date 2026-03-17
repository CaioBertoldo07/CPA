const express = require('express');
const router = express.Router();
const questoesController = require('../controllers/questoesController');

router.get('/questoes', questoesController.getQuestoes);
router.post('/questoes', questoesController.postQuestoes)
router.delete('/questoes/:id', questoesController.deleteQuestoes)
router.put('/questoes/:id', questoesController.updateQuestoes)
router.get('/questoes/:id', questoesController.getQuestaoById)


module.exports = router;