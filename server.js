const express = require("express");
const app = express();
const port = 3000;
const users = require("./routes/users");

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

/* Routes */
app.get("/", (req, res) => {
    res.json({server_status: "running"});
});

app.use("/users", users);

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