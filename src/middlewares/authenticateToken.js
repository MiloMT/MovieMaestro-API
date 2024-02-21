import jwt from "jsonwebtoken"

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]
    if (token == null) {
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

function generateAccessToken(user) {
    return jwt.sign({ 
        email: user.email, 
        isAdmin: user.isAdmin,
        id: user.id
    }, process.env.ACCESS_TOKEN_SECRET)
}

export { authenticateToken, generateAccessToken }