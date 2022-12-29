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

async function login(credentials, req) {
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
                    req.session.userInformation = userInformation[0];
                    delete userInformation[0].hashed_password;
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

async function register(userInformation, req) {
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
                    await sendVerificationEmail(userInformation, url);
                    req.session.userInformation = userInformation[0];
                    return {status_code: 1, message: "User created successfully."};
                } catch (err) {
                    switch ((await login(userInformation, req)).status_code) {
                        case 1:
                            return {status_code: 3, message: "User already exists. Credentials are correct."};
                        case 2:
                            return {status_code: 2, message: "User already exists. Pending confirmation."};
                        case -1:
                            return {status_code: 0, message: "User already exists. Credentials are incorrect."};
                        default:
                            return {status_code: -1, message: "User does not exits. Error creating user."};
                    }
                }
            })
    } catch (e) {
        return -1;
    }
}

async function resendVerificationEmail(email) {
    const result = await db.query(`SELECT users.email_verified FROM users WHERE users.email = '${email}'`);
    if (result.length) {
        if (result[0].email_verified) {
            return {status_code: 2, message: "User already verified."};
        }
        else {
            try {
                const url = Uuid.v4();
                await db.query(`UPDATE verification_urls
                            SET url = '${url}'
                            WHERE user_id = (SELECT id FROM users WHERE email = '${email}')`);
                let userInformation = {email: email}
                await sendVerificationEmail(userInformation, url);
                return {status_code: 1, message: "Email sent successfully."};
            } catch (err) {
                console.log(err);
                return {status_code: 0, message: "Email not sent."};
            }
        }
    }
    else {
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

async function myAccount(req) {
    if (req.session.userInformation) {
        const information = req.session.userInformation;
        delete information.hashed_password;
        return {status_code: 1, userInformation: information};
    }
    else {

    }
    return {status_code: 0, message: "User not logged."};
}

async function saveExpression(expression, id) {
    try {
        await db.query(`INSERT INTO chronology (user_id, expression)
                        VALUES (${id}, '${expression}')`);
        return {status_code: 1, message: "Expression saved successfully."};
    } catch (err) {
        console.log(err);
        return {status_code: 0, message: "Expression not saved."};
    }
}

async function getChronolgy(user_id) {
    try {
        const result = await db.query(`SELECT chronology.expression, chronology.date
                                       FROM chronology
                                       WHERE chronology.user_id = ${user_id}`);
        let chronology = {};
        for (let i = 0; i < result.length; i++) {
            let date = result[i].date;
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let key = `${day}/${month}/${year}`;
            if (chronology[key] === undefined) {
                chronology[key] = [];
            }
            chronology[key].push(result[i].expression);
        }

        return {status_code: 1, chronology: result};
    } catch (err) {
        console.log(err);
        return {status_code: 0, message: "Chronology not found."};
    }
}

module.exports = {
    getUserById,
    login,
    register,
    resendVerificationEmail,
    confirmUserRegistration,
    myAccount,
    saveExpression,
    getChronolgy
}