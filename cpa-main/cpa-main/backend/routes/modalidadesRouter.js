const express = require('express');
const router = express.Router();
const modalidadesController = require('../controllers/modalidadesController');

router.post('/modalidades', modalidadesController.postModalidades);
router.get('/modalidades', modalidadesController.getModalidades);
router.put('/modalidades/:id', modalidadesController.updateModalidades);
router.get('/modalidades/:id', modalidadesController.getModalidadesByNumero); 
router.delete('/modalidades/:id', modalidadesController.deleteModalidades);

module.exports = router;
