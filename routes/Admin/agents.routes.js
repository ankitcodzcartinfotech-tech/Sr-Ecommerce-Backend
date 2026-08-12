const express = require('express');
const router = express.Router();
const agentController = require('../../controller/agents.controller');
const { validateBody, addAgentSchema, updateAgentSchema } = require('../../helper/validator');
const { upload } = require('../../helper/upload');

router.post('/', upload.single('profileImage'), agentController.addAgent);
router.get('/', agentController.getAgents);
router.get('/:id', agentController.getAgent);
router.put('/:id', upload.single('profileImage'), agentController.updateAgent);
router.delete('/:id', agentController.deleteAgent);

module.exports = router;
