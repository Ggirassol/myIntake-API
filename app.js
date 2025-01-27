const express = require("express");
const app = express();
app.use(express.json());
const { getIntakeByDate, addUser, loginUser, createNewToken, addIntake } = require("./controllers.js");
const { handleCustomErrors } = require("./handleCustomErrors.js");
const { authenticateToken } = require("./middleware.js");

app.get("/api/:userId/:date", authenticateToken, getIntakeByDate);
app.post("/api/register", addUser)
app.post("/api/auth", loginUser)
app.post("/api/refresh-token", createNewToken);
app.post("/api/add-intake", authenticateToken, addIntake)
// create endpoint for post - add intake
// create endpoint for put - updating intake
app.use(handleCustomErrors)

module.exports = app;