const nodemailer = require('nodemailer');
const config = require("../config");
const { promisify } = require('util');
const handlebars = require('handlebars');
const fs = require('fs');

const transporter = nodemailer.createTransport(config.email);

const readFile = promisify(fs.readFile);

async function sendEmail(mailOptions) {
    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log(err);
    }
}

async function sendVerificationEmail(userInformation, verificationCode) {
    let html = await readFile('mails/confirmation.html', 'utf8');
    let template = handlebars.compile(html);
    let data = {
        first_name: userInformation.first_name,
        registration_code: verificationCode
    };
    let htmlToSend = template(data);

    const mailOptions = {
        from: 'MathRevealer <mathrevealer@garamante.it>',
        to: userInformation.email,
        subject: 'Conferma la tua registrazione per iniziare a usare MathRevealer.',
        html: htmlToSend
    }

    await sendEmail(mailOptions);
}

module.exports = {
    sendVerificationEmail
}