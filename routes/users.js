const express = require('express');
const router = express.Router();
const users = require('../services/users');
const {json} = require("express");

/* GET | /users/id */
router.get('/:id', async function(req, res, next) {
    try {
        let userInformation = await users.getUserById(req.params.id);
        if (userInformation.length) {
            res.json(userInformation[0]);
        }
        else {
            res.json({message: "User does not exist."});
        }
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST - /users/login */
router.post('/login', async function(req, res, next) {
    try {
        let userInformation = await users.getUserByCredentials(req.body);
        if (userInformation.length) {
            res.json({status_code: 1, userInformation: userInformation[0]});
        }
        else {
            res.json({status_code: 0});
        }
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST - /users/register */
router.post('/register', async function(req, res, next) {
    try {
        let responseCode = await users.addUser(req.body);
        res.json({status_code: responseCode});
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

module.exports = router;