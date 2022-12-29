const express = require('express');
const router = express.Router();
const users = require('../services/users');

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

module.exports = router;