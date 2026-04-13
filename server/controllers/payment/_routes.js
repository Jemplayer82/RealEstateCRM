const express = require('express');
const payment = require('./payment');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.post('/add', auth, payment.add);
router.get('/', auth, payment.index);

module.exports = router;
