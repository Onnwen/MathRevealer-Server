const express = require('express');
const router = express.Router();
const myAccount = require('../services/myAccount');

/* POST - /myAccount/login */
router.post('/login', async function(req, res, next) {
    try {
        let userInformation = await myAccount.login(req.body, req);
        delete userInformation.hashed_password;
        res.json(userInformation);
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST - /myAccount/logout*/
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


/* POST - /myAccount/saveExpression*/
router.post('/saveExpression', async function(req, res, next) {
    try {
        if (req.session.userInformation) {
            res.json(await myAccount.saveExpression(req.body.expression, req.session.userInformation.id));
        }
        else {
            res.json({status_code: 0, message: "User not logged."});
        }
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* GET - /myAccount/chronology*/
router.get('/chronology', async function(req, res, next) {
    try {
        if (req.session.userInformation) {
            res.json(await myAccount.getSavedExpressions(req.session.userInformation.id));
        }
        else {
            res.json({status_code: 0, message: "User not logged."});
        }
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* GET | /myAccount/information */
router.get('/information', async function(req, res, next) {
    try {
        res.json(await myAccount.getInformation(req));
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

module.exports = router;