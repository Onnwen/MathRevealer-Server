const bcrypt = require("bcrypt");
const Uuid = require("uuid");
const db = require("./db");
const {sendVerificationEmail} = require("./mailer");

async function registration(userInformation, req) {
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

async function resend(email) {
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

async function confirm(verificationCode) {
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
    registration,
    resend,
    confirm
}