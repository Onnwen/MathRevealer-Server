const express = require('express');
const router = express.Router();
const users = require('../services/users');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

/* GET | /users/myaccount */
router.get('/myaccount', async function(req, res, next) {
    try {
        res.json(await users.myAccount(req));
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
        let userInformation = await users.login(req.body, req);
        delete userInformation.hashed_password;
        res.json(userInformation);
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST - /users/logout*/
router.post('/logout', async function(req, res, next) {
    try {
        res.clearCookie('connect.sid');

        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            res.json({status_code: 1, message: "User logged out successfully."});
        });
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
        let responseCode = await users.register(req.body, req);
        res.json(responseCode);
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST - /users/saveExpression*/
router.post('/saveExpression', async function(req, res, next) {
    try {
        if (req.session.userInformation) {
            res.json(await users.saveExpression(req.body.expression, req.session.userInformation.id));
        }
        else {
            res.json({status_code: 0, message: "User not logged."});
        }
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

module.exports = router;