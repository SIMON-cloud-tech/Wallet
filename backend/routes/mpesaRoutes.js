const express = require('express');
const router = express.Router();
const { mpesaCallback } = require('../controllers/mpesaController');

// No auth - Safaricom calls this
router.post('/callback', mpesaCallback);

module.exports = router;