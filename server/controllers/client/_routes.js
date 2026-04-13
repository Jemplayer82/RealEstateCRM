const express = require('express');
const client = require('./client');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.get('/', auth, client.index)
router.post('/add', auth, client.add)
router.post('/addMany', auth, client.addMany)
router.post('/add-property-interest/:id', auth, client.addPropertyInterest)
router.get('/view/:id', auth, client.view)
router.put('/edit/:id', auth, client.edit)
router.delete('/delete/:id', auth, client.deleteData)
router.post('/deleteMany', auth, client.deleteMany)


module.exports = router