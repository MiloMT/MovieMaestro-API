import { Router } from "express"
import jwt from "jsonwebtoken"
import UserModel from "../models/userModel.js"
import authenticateToken from "../middlewares/authenticateToken.js"
import dotenv from "dotenv"
import bcrypt from "bcrypt"

const userRoutes = Router()

dotenv.config()

function generateAccessToken(email) {
    return jwt.sign(email, process.env.ACCESS_TOKEN_SECRET)
}

userRoutes.get("/", authenticateToken, async (req, res) => {
    res.send(await UserModel.find({ email: req.user.email }))
})

userRoutes.post("/", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const insertedEntry = await (await UserModel.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        }))
        res.status(201).send(insertedEntry)
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

userRoutes.post("/login", async (req, res) => {
    const user = await UserModel.findOne({ email: req.body.email })

    if (user == null) {
        return res.status(400).send({ status: "Incorrect Email or Password" })
    }

    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = generateAccessToken(user.email)
            // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
            // refreshTokens.push(refreshToken)
            res.json({ status: "Successful Login", accessToken: accessToken })
        }
    } catch {
        res.status(500).send({ status: "Incorrect Email or Password" })
    }
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