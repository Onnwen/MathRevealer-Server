const db = require("./db");
const bcrypt = require("bcrypt");

async function getInformation(req) {
    if (req.session.userInformation) {
        const information = req.session.userInformation;
        delete information.hashed_password;
        console.log("An authenticated user requested his information. (ID: " + information.id + "; IP: " + req.ip + ")");
        return {status_code: 1, userInformation: information};
    }
    console.log("A user tried to access information without being logged in. (IP: " + req.ip + ")");
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
                                       WHERE chronology.user_id = ${user_id} ORDER BY chronology.date DESC`);
        let chronology = {};
        for (let i = 0; i < result.length; i++) {
            let date = result[i].date;
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let key = `${day}/${month}/${year}`;
            if (chronology[key] === undefined) {
                let labelName = "";
                let today = new Date();
                let yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);
                if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
                    labelName = "Oggi";
                }
                else if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
                    labelName = "Ieri";
                }
                else {
                    let daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24));
                    if (daysAgo < 7) {
                        labelName = `${daysAgo} giorni fa`;
                    }
                    else if (daysAgo < 30) {
                        labelName = `${Math.floor(daysAgo / 7)} settimane fa`;
                    }
                    else if (daysAgo < 365) {
                        labelName = `${Math.floor(daysAgo / 30)} mesi fa`;
                    }
                    else {
                        labelName = `${Math.floor(daysAgo / 365)} anni fa`;
                    }
                }
                chronology[key] = {labelName: labelName, expressions: []};
            }
            chronology[key].expressions.push(result[i].expression);
        }

        return {status_code: 1, chronology: chronology};
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