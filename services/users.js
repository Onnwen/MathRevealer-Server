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

async function getUserByCredentials(credentials) {
    const userInformation = await db.query(`SELECT users.id,
                                                   users.first_name,
                                                   users.last_name,
                                                   users.email,
                                                   users.hashed_password,
                                                   users.email_verified
                                            FROM users
                                            WHERE users.email = '${credentials.email}'`);
    if (userInformation.length) {
        return bcrypt
            .compare(credentials.password, userInformation[0].hashed_password)
            .then(function (result) {
                if (result) {
                    if (userInformation[0].email_verified) {
                        return {status_code: 1, userInformation: userInformation[0]};
                    }
                    else {
                        return {status_code: 2, userInformation: userInformation[0]};
                    }
                } else {
                    return {status_code: -1, message: "Incorrect password."};
                }
            });
    } else {
        return {status_code: 0, message: "User does not exist."};
    }
}

async function addUser(userInformation) {
    if (userInformation.first_name === undefined || userInformation.last_name === undefined || userInformation.password === undefined || userInformation.email === undefined) {
        return 0;
    }
    try {
        return bcrypt
            .hash(userInformation.password, 10)
            .then(async function (hash) {
                try {
                    const url = Uuid.v4();
                    const result = await db.query(`INSERT INTO users (first_name, last_name, hashed_password, email) VALUES ('${userInformation.first_name}', '${userInformation.last_name}','${hash}', '${userInformation.email}')`);
                    await db.query(`INSERT INTO verification_urls (user_id, url) VALUES (${result.insertId}, '${url}')`);
                    await sendVerificationEmail(userInformation.email, url);
                    return {status_code: 1, message: "User created successfully."};
                } catch (err) {
                    console.log(err);
                    return {status_code: 0, message: "User already exists."};
                }
            })
    } catch (e) {
        return -1;
    }
}

async function resendVerificationEmail(email) {
    try {
        const url = Uuid.v4();
        // Update query to update the verification code from user mail
        await db.query(`UPDATE verification_urls SET url = '${url}' WHERE user_id = (SELECT id FROM users WHERE email = '${email}')`);
        await sendVerificationEmail(email, url);
        return {status_code: 1, message: "Email sent successfully."};
    } catch (err) {
        console.log(err);
        return {status_code: 0, message: "Email not sent."};
    }
}

async function confirmUserRegistration(verificationCode) {
    const result = await db.query(`SELECT verification_urls.user_id
                                   FROM verification_urls
                                   WHERE verification_urls.url = '${verificationCode}'`);
    if (result.length) {
        await db.query(`UPDATE users
                        SET email_verified = 1
                        WHERE users.id = ${result[0].user_id}`);
        await db.query(`DELETE FROM verification_urls
                        WHERE verification_urls.url = '${verificationCode}'`);
        return {status_code: 1, message: "User verified successfully."};
    } else {
        return {status_code: 0, message: "Verification code not found."};
    }
}

module.exports = {
    getUserById,
    getUserByCredentials,
    addUser,
    resendVerificationEmail,
    confirmUserRegistration
}