const { selectIntakeByDate, createUser, logUser, generateNewToken, insertIntake, removeUserRefreshToken, selectDescription, editTodayIntake, findWeeklyIntake } = require('./models.js');

function getIntakeByDate(req, res, next) {
    const userId = req.body.userId;
    const date = req.params.date;
    selectIntakeByDate(userId, date)
    .then((intake) => {
        res.status(200).send(intake)
    })
    .catch((err) => next(err));
}

function addUser(req, res, next) {
    const { username, email, password } = req.body;
    createUser(username, email, password)
    .then((result) => {
        res.status(201).send( result )
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
        res.status(200).send( newToken )
    })
    .catch((err) => next(err));
}

function addIntake(req, res, next) {
    const intake = req.body;
    insertIntake(intake)
    .then((result) => {
        res.status(201).send(result)
    })
    .catch((err) => next(err));
}

function logoutUser(req, res, next) {
    const userId = req.body.userId
    if (!userId) {
        res.status(400).send({ msg: "No userId provided"})
    }
    removeUserRefreshToken(userId)
    .then((result) => {
        res.status(200).send( result )
    })
    .catch((err) => next(err));
}

function editIntake(req, res, next) {
    const userId = req.body.userId;
    const intakeId = req.body.intakeId;
    const intakeIndex = req.body.intakeIndex;
    const newIntake = req.body.newIntake;
    editTodayIntake(userId, intakeId, intakeIndex, newIntake)
    .then((updatedIntake) => {
        res.status(200).send( updatedIntake )
    })
    .catch((err) => next(err));
}

function getWeekIntake(req, res, next) {
    const userId = req.body.userId;
    const date = req.body.date;
    findWeeklyIntake(userId, date)
    .then((weekIntake) => {
        res.status(200).send( weekIntake )
    })
    .catch((err) => next(err));
 }
 
function getEndpointsDescription(req, res, next) {
    selectDescription()
    .then((endpointsDescription) => {
      res.status(200).send(endpointsDescription);
    })
    .catch((err) => next(err));
}

module.exports = { getIntakeByDate, addUser, loginUser, createNewToken, addIntake, logoutUser, getEndpointsDescription, editIntake, getWeekIntake }