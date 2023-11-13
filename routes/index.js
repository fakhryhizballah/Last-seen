const express = require('express');
const router = express.Router();
const seen = require('../controllers');

router.get('/update/:app', seen.update);
router.get('/online/:app', seen.online);
router.get('/lastSeen/byname/:app', seen.lastSeenByName);
router.get('/lastSeen/byid/:app', seen.lastSeenById);
router.get('/test', seen.test);

module.exports = router;

