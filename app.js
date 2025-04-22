const express = require("express");
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const { getIntakeByDate, addUser, loginUser, createNewToken, addIntake, logoutUser, getEndpointsDescription, editIntake, getWeekIntake, getMonthlyIntake, verifyUser } = require("./controllers.js");
const { handleCustomErrors } = require("./handleCustomErrors.js");
const { authenticateToken } = require("./middleware.js");

app.get("/api/:date", authenticateToken, getIntakeByDate);
app.post("/api/register", addUser)
app.get("/api/verify-email/:token?/:email?", verifyUser)
app.post("/api/auth", loginUser)
app.post("/api/refresh-token", createNewToken);
app.post("/api/add-intake", authenticateToken, addIntake)
app.put("/api/logout", authenticateToken,logoutUser)
app.put("/api/edit-intake", authenticateToken, editIntake)
app.post("/api/weekly", authenticateToken, getWeekIntake)
app.post("/api/monthly", authenticateToken, getMonthlyIntake)
app.get("/api/", getEndpointsDescription)
app.use(handleCustomErrors)

module.exports = app;