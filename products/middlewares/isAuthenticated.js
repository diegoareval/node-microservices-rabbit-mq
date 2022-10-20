const jwt = require('jsonwebtoken');
const {jwtSecret} = require("../config")

module.exports = async function isAuthenticated(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(401).json({ message: err });
        } else {
            req.user = user;
            next();
        }
    });
};
