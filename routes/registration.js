const express = require('express');
const registration = require("../services/registration");
const router = express.Router();


/* POST - /registration/resend */
router.post('/resend', async function(req, res, next) {
    try {
        res.json(await registration.resend(req.body.email));
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST - /registration/confirm */
router.post('/confirm', async function(req, res, next) {
    try {
        res.json(await registration.confirm(req.body.code));
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST - /registration/register*/
router.post('/register', async function(req, res, next) {
    try {
        let responseCode = await users.register(req.body, req);
        res.json(responseCode);
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

module.exports = router;