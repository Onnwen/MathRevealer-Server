const express = require("express");
const crypto = require("crypto");
const app = express();
const port = 3000;
const session = require("express-session");

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

/* Headers setting */
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    //res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

app.use(session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true,
    secure: process.env.NODE_ENV === 'production',
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

/* Routes */
app.get("/", (req, res) => {
    res.json({server_status: "running"});
});

app.use("/users", require("./routes/users"));

app.use("/myAccount", require("./routes/myAccount"));

app.use("/registration", require("./routes/registration"));

app.use("/reports", require("./routes/reports"));

/* Error handler */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({message_error: err.message});
});

app.listen(port, () => {
    console.log(`MathRevealer API running at https://mathrevealer.garamante.it/api`);
    console.log(`Local path: http://localhost:${port}`);
});
