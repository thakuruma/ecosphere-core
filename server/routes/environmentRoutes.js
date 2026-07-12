const express = require('express');
const router = express.Router();

const controller = require('../controllers/environmentController');

console.log("Controller Export:", controller);

router.get('/emission-factors', controller.getEmissionFactors);
router.post('/emission-factors', controller.createEmissionFactor);

module.exports = router;
