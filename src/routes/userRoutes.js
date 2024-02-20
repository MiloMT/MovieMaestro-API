import { Router } from "express"
import jwt from "jsonwebtoken"
import UserModel from "../models/userModel.js"
import authenticateToken from "../middlewares/authenticateToken.js"
import dotenv from "dotenv"

const userRoutes = Router()

dotenv.config()

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1hr" })
}

userRoutes.get("/", authenticateToken, async (req, res) => {
    res.send(await UserModel.find({ email: req.user.email }))
})

userRoutes.post("/", authenticateToken, async (req, res) => {
    try {
        const insertedEntry = await (await UserModel.create(req.body))
        res.status(201).send(insertedEntry)
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

userRoutes.post("/login", async (req, res) => {
    // Authenticate user

    const email = req.body.email
    const user = { email: email }

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

// To decide whether to implement refresh tokens down the track
// userRoutes.post("/token", async (req, res) => {
//     const refreshToken = req.body.token
//     if (refreshToken == null) {
//         return res.sendStatus(401)
//     }
//     if (refreshTokens.includes(refreshToken)) {
//         return res.sendStatus(403)
//     }
//     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
//         if (err) return res.sendStatus(403)
//         const accessToken = generateAccessToken({ email: user.email })
//         res.json({ accessToken: accessToken })
//     })
// })

// app.delete("/logout", (req, res) => {
//     refreshTokens = refreshTokens.filter(token => token !== req.body.token)
//     res.sendStatus(204)
// })

userRoutes.get("/:id", async (req, res) => {
    const entry = await UserModel.findById(req.params.id)
    if (entry) {
        res.send(entry)
    } else {
        res.status(404).send({ error: "Entry not found" })
    }
})

userRoutes.put("/:id", async (req, res) => {
    try {
        const updatedEntry = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (updatedEntry) {
            res.send(updatedEntry)
        } else {
            res.status(404).send({ error: "Entry not found" })
        }
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

userRoutes.delete("/:id", async (req, res) => {
    try {
        const deletedEntry = await UserModel.findByIdAndDelete(req.params.id)
        if (deletedEntry) {
            res.sendStatus(204)
        } else {
            res.status(404).send({ error: "Entry not found" })
        }
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

export default userRoutes