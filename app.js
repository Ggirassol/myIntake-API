const express = require("express");
const app = express();
app.use(express.json());
const { getIntakeByDate } = require("./controllers.js");

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`The server is active on port ${PORT}`);
    });
}

app.get("/api/:userId/:date", getIntakeByDate);

module.exports = app;