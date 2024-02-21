import { Router } from "express"
import UserModel from "../models/userModel.js"
import { authenticateToken, generateAccessToken } from "../middlewares/authenticateToken.js"
import dotenv from "dotenv"
import bcrypt from "bcrypt"

const userRoutes = Router()

dotenv.config()

userRoutes.get("/", authenticateToken, async (req, res) => {
    try {
        if (req.user.isAdmin) {
            res.send(await UserModel.find())
        } else {
            const user = await UserModel.find({ email: req.user.email })
            if (user) {
                return res.send(user)
            } else {
                return res.status(400).send({ 
                    error: "User not found" 
                })
            }
        }
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
    
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
            const accessToken = generateAccessToken(user)
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

userRoutes.get("/:id", authenticateToken, async (req, res) => {
    const user = await UserModel.findById(req.params.id)
    if (user) {
        res.send(user)
    } else {
        res.status(404).send({ error: "User not found" })
    }
})

userRoutes.put("/:id", authenticateToken, async (req, res) => {
    try {
        if (req.user.id == req.params.id || req.user.isAdmin) {
            const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
            if (updatedUser) {
                res.send(updatedUser)
            } else {
                res.status(404).send({ error: "User not found" })
            }
        } else {
            return res.status(401).send({ 
                error: "You do not have sufficient permissions for this operation" 
            })
        }
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

userRoutes.delete("/:id", authenticateToken, async (req, res) => {
    try {
        if (req.user.id == req.params.id || req.user.isAdmin) {
            const deletedUser = await UserModel.findByIdAndDelete(req.params.id)
            if (deletedUser) {
                res.sendStatus(204)
            } else {
                res.status(404).send({ error: "User not found" })
            }
        } else {
            return res.status(401).send({ 
                error: "You do not have sufficient permissions for this operation" 
            })
        }
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

export default userRoutes