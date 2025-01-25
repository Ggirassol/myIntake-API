// const cookieParser = require('cookie-parser')
const { selectIntakeByDate, createUser, logUser, generateNewToken } = require('./models.js');

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

function loginUser(req, res, next) {
    const { email, password } = req.body;
    logUser(email, password)
    .then((tokens) => {
        res.status(200).send({ tokens })
    })
    .catch((err) => next(err));
}

function createNewToken(req, res, next) {
    const refreshToken = req.body.token;
    generateNewToken(refreshToken)
    .then((tokens) => {
        res.status(200).send({ tokens })
    })
    .catch((err) => next(err));
}


module.exports = { getIntakeByDate, addUser, loginUser, createNewToken }