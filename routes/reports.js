const reports = require('../services/reports');

/* POST | /report/expression */
router.post('/expression', async function(req, res, next) {
    try {
        if (req.session.userInformation) {
            res.json(await reports.expression(req.body.expression, req.session.userInformation.id));
        }
        else {
            res.json({status_code: 0, message: "User not logged."});
        }
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

/* POST | /report/addDescription */
router.post('/addDescription', async function(req, res, next) {
    try {
        if (req.session.userInformation) {
            res.json(await reports.addDescription(req.body.report_id, req.body.description));
        }
        else {
            res.json({status_code: 0, message: "User not logged."});
        }
    } catch (err) {
        console.error(`Error`, err.message);
        next(err);
    }
});

module.exports = router;