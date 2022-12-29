const db = require('./db');

async function getUserById(id) {
    return await db.query(`SELECT users.id, users.first_name, users.last_name
                           FROM users
                           WHERE users.id = ${id}`)
}

module.exports = {
    getUserById
}