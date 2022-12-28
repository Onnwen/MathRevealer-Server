const express = require('express');
const router = express.Router();
const users = require('../services/users');

/* GET | /users/myaccount */
router.get('/myaccount', async function(req, res, next) {
    try {
        res.json(await users.myAccount());
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* GET | /users/id */
router.get('/get/:id', async function(req, res, next) {
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
        delete userInformation.hashed_password;
        res.json(userInformation);
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST - /users/resend */
router.post('/resend', async function(req, res, next) {
    try {
        res.json(await users.resendVerificationEmail(req.body.email));
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST - /users/confirm */
router.post('/confirm', async function(req, res, next) {
    try {
        res.json(await users.confirmUserRegistration(req.body.code));
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST - /users/register*/
router.post('/register', async function(req, res, next) {
    try {
        let responseCode = await users.addUser(req.body);
        res.json(responseCode);
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

module.exports = router;