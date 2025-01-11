const express = require("express");
const app = express();
app.use(express.json());
const { getIntakeByDate, addUser } = require("./controllers.js");
const { handleCustomErrors } = require("./handleCustomErrors.js");

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`The server is active on port ${PORT}`);
    });
}

app.get("/api/:userId/:date", getIntakeByDate);
app.post("/api/users", addUser)
app.use(handleCustomErrors)

module.exports = app;