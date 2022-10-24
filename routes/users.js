const express = require('express');
const router = express.Router();
const users = require('../services/users');
const {json} = require("express");

/* GET | /users/id */
router.get('/:id', async function(req, res, next) {
    try {
        let usersList = await users.getUserById(req.params.id);
        if (usersList.length) {
            res.json(usersList[0]);
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
router.get('/login', async function(req, res, next) {
    try {
        let usersList = await users.getUserByCredentials(req.params.id);
        if (usersList.length) {
            res.json(usersList[0]);
        }
        else {
            res.json({message: "User does not exist."});
        }
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

module.exports = router;