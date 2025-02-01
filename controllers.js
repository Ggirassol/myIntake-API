const { selectIntakeByDate, createUser, logUser, generateNewToken, insertIntake, editIntake } = require('./models.js');

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
    .then((token) => {
        res.status(200).send({ token })
    })
    .catch((err) => next(err));
}

function createNewToken(req, res, next) {
    const userId = req.body.userId
    generateNewToken(userId)
    .then((newToken) => {
        res.status(200).send({ newToken })
    })
    .catch((err) => next(err));
}

function addIntake(req, res, next) {
    const intake = req.body;
    insertIntake(intake)
    .then((result) => {
        res.status(201).send({ result })
    })
    .catch((err) => next(err));
}

function updateIntake(req, res, next) {
    const intake = req.body;
    editIntake(intake)
    .then((result) => {
        res.status(201).send({ result })
    })
    .catch((err) => next(err));
}

module.exports = { getIntakeByDate, addUser, loginUser, createNewToken, addIntake, updateIntake }