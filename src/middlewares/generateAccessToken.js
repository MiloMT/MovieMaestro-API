import jwt from "jsonwebtoken"

function generateAccessToken(user) {
    return jwt.sign({ 
        email: user.email, 
        isAdmin: user.isAdmin,
        id: user.id
    }, process.env.ACCESS_TOKEN_SECRET)
}

export default generateAccessToken