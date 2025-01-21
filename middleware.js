const jwt = require('jsonwebtoken');

async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ") [1];

    if (!token) {
        return res.status(401).send({ msg: "No token"})
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN)
        next();
    } catch {
        return res.status(403).send({ msg: "Expired or invalid token" });
    }
}

module.exports = { authenticateToken }