const express = require('express');
const router = express.Router();
const users = require('../services/users');
const {json} = require("express");

/* GET | /users/id */
router.get('/:id', async function(req, res, next) {
    try {
        let userInformations = await users.getUserById(req.params.id);
        if (userInformations.length) {
            res.json(userInformations[0]);
        }
        else {
            res.json({message: "User does not exist."});
        }
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST | /users/login */
router.post('/login', async function(req, res, next) {
    try {
        let userInformations = await users.getUserByCredentials(req.body);
        if (userInformations.length) {
            res.json({status_code: 1, userInformations: userInformations[0]});
        }
        else {
            res.json({status_code: 0});
        }
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

module.exports = router;