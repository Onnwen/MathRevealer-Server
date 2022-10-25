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
    res.json({message: "ok"});
});

app.use("/users", users);

/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({message_error: err.message});
    return;
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});