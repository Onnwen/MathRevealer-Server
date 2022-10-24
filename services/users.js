const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getUserById(id) {
    const userInformations = await db.query(`SELECT Users.id, Users.first_name, Users.last_name
                                             FROM Users
                                             WHERE Users.id = ${id}`);
    return helper.emptyOrRows(userInformations);
}

async function getUserByCredentials(credentials) {
    console.log(credentials);
    const userInformations = await db.query(`SELECT Users.id, Users.first_name, Users.last_name, Users.email
                                             FROM Users
                                             WHERE Users.email = '${credentials.email}'
                                               AND Users.hashed_password = '${credentials.hashed_password}'`);
    return helper.emptyOrRows(userInformations);
}

module.exports = {
    getUserById,
    getUserByCredentials
}