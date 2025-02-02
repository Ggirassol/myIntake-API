const express = require("express");
const app = express();
app.use(express.json());
const { getIntakeByDate, addUser, loginUser, createNewToken, addIntake, updateIntake, logoutUser } = require("./controllers.js");
const { handleCustomErrors } = require("./handleCustomErrors.js");
const { authenticateToken } = require("./middleware.js");

app.get("/api/:date", authenticateToken, getIntakeByDate);
app.post("/api/register", addUser)
app.post("/api/auth", loginUser)
app.post("/api/refresh-token", createNewToken);
app.post("/api/add-intake", authenticateToken, addIntake)
app.put("/api/add-more-intake", authenticateToken, updateIntake)
app.put("/api/logout", logoutUser)
app.use(handleCustomErrors)

module.exports = app;