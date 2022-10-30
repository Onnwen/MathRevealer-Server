const express = require('express');
const router = express.Router();
const users = require('../services/reveal');
const {json} = require("express");

/* GET | /reveal */
router.get('/', async function(req, res, next) {
    res.json({"status": 1});
});

module.exports = router;