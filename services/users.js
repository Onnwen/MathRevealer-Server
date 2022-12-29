const db = require('./db');
const bcrypt = require("bcrypt");
const Uuid = require("uuid");
const mysql = require("mysql2/promise");
const config = require("../config");
const {sendVerificationEmail} = require("./mailer");

async function getUserById(id) {
    return await db.query(`SELECT users.id, users.first_name, users.last_name
                           FROM users
                           WHERE users.id = ${id}`)
}

module.exports = {
    getUserById,
    login,
    register
}