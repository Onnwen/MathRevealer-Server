const db = require("./db");
const bcrypt = require("bcrypt");

async function getInformation(req) {
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

async function getSavedExpressions(user_id) {
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

module.exports = {
    getInformation,
    saveExpression,
    getSavedExpressions,
    login
}