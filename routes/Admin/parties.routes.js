const express = require('express');
const router = express.Router();
const partiesController = require('../../controller/parties.controller');
const { upload } = require('../../helper/upload');

router.post('/', upload.single('profileImage'), partiesController.addParty);
router.get('/', partiesController.getParties);
router.get('/gst-details/:gstNo', partiesController.getGstDetails);
router.get('/:id', partiesController.getParty);
router.put('/:id', upload.single('profileImage'), partiesController.updateParty);
router.delete('/:id', partiesController.deleteParty);

module.exports = router;
