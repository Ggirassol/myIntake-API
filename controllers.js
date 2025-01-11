const { selectIntakeByDate, createUser } = require('./models.js');

function getIntakeByDate(req, res, next) {
    const userId = req.params.userId;
    const date = req.params.date;
    selectIntakeByDate(userId, date)
    .then((intake) => {
        res.status(200).send({ intake })
    })
    .catch((err) => next(err));
}

function addUser(req, res, next) {
    const { username, email, password } = req.body;
    createUser(username, email, password)
    .then((result) => {
        res.status(201).send({ result })
    })
    .catch((err) => next(err));
}


module.exports = { getIntakeByDate, addUser }