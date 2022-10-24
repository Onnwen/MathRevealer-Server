const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getUserById(id) {
    const userInformation = await db.query(`SELECT Users.id, Users.nome, Users.cognome
                                            FROM Users WHERE Users.id = ${id}`);
    return helper.emptyOrRows(userInformation);
}

module.exports = {
    getUserById
}