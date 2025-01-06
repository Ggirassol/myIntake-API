const { selectIntakeByDate } = require('./models.js');

function getIntakeByDate(req, res, next) {
    const userId = req.params.userId;
    const date = req.params.date;
    selectIntakeByDate(userId, date)
    .then((intake) => {
        res.status(200).send({ intake })
    })
    .catch((err) => next(err));
}


module.exports = { getIntakeByDate }