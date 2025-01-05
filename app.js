const express = require("express");
const app = express();
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`The server is active on port ${PORT}`);
    });
}


module.exports = app;