const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getUserById(id) {
    const userInformation = await db.query(`SELECT Users.id, Users.first_name, Users.last_name
                                             FROM Users
                                             WHERE Users.id = ${id}`);
    return helper.emptyOrRows(userInformation);
}

async function getUserByCredentials(credentials) {
    console.log(credentials);
    const userInformation = await db.query(`SELECT Users.id, Users.first_name, Users.last_name, Users.email
                                             FROM Users
                                             WHERE Users.email = '${credentials.email}'
                                               AND Users.hashed_password = '${credentials.hashed_password}'`);
    return helper.emptyOrRows(userInformation);
}

async function addUser(userInformation) {
    if (userInformation.first_name === undefined || userInformation.last_name === undefined || userInformation.hashed_password === undefined || userInformation.email === undefined) {
        return 0;
    }
    try {
        await db.query(`INSERT INTO Users (first_name, last_name, hashed_password, email) VALUES ('${userInformation.first_name}', '${userInformation.last_name}', '${userInformation.hashed_password}', '${userInformation.email}')`);
        return 1;
    }
    catch (e) {
        return -1;
    }
}

module.exports = {
    getUserById,
    getUserByCredentials,
    addUser
}