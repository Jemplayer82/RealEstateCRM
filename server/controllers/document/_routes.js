const express = require('express');
const document = require('./document');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.get('/', auth, document.index);
router.post('/add', auth, document.upload.array('files'), document.file);
router.post('/addDocumentContact', auth, document.upload.array('files'), document.addDocumentContact);
router.post('/addDocumentLead', auth, document.upload.array('files'), document.addDocumentLead);
router.get('/download/:id', auth, document.downloadFile);
router.post('/link-document/:id', auth, document.LinkDocument);
router.delete('/delete/:id', auth, document.deleteFile);
router.use('/images', auth, express.static('uploads/document'));

module.exports = router;
