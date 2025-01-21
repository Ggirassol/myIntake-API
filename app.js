const express = require("express");
const app = express();
app.use(express.json());
const { getIntakeByDate, addUser, loginUser } = require("./controllers.js");
const { handleCustomErrors } = require("./handleCustomErrors.js");
const { authenticateToken } = require("./middleware.js");

app.get("/api/:userId/:date", authenticateToken, getIntakeByDate);
app.post("/api/register", addUser)
app.post("/api/auth", loginUser)
app.use(handleCustomErrors)

module.exports = app;