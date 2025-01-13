const express = require("express");
const app = express();
app.use(express.json());
const { getIntakeByDate, addUser } = require("./controllers.js");
const { handleCustomErrors } = require("./handleCustomErrors.js");

app.get("/api/:userId/:date", getIntakeByDate);
app.post("/api/register", addUser)
app.use(handleCustomErrors)

module.exports = app;