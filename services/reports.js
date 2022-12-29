const db = require("./db");

async function expression(expression, user_id) {
    try {
        const result = await db.query(
            `INSERT INTO reports (expression, user_id)
         VALUES ('${expression}', ${user_id})`
        );

        // return also the id of the report
        return { status_code: 1, message: "Expression saved successfully.", report_id: result.insertId };
    }
    catch (err) {
        console.log(err);
        return { status_code: 0, message: "Report not saved." };
    }
}

async function addDescription(report_id, description) {
    try {
        await db.query(
            `UPDATE reports
         SET description = '${description}'
         WHERE id = ${report_id}`
        );

        return { status_code: 1, message: "Description saved successfully." };
    }
    catch (err) {
        console.log(err);
        return { status_code: 0, message: "Description not saved." };
    }
}

module.exports = {
    expression,
    addDescription
}