import { Router } from "express"
import UserModel from "../models/userModel.js"
import { authenticateToken, generateAccessToken } from "../middlewares/authenticateToken.js"
import bcrypt from "bcrypt"

const userRoutes = Router()

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
            res.json({ status: "Successful Login", accessToken: accessToken })
        }
    } catch {
        res.status(500).send({ status: "Incorrect Email or Password" })
    }
})

userRoutes.get("/:id", authenticateToken, async (req, res) => {
    const user = await UserModel.findById(req.params.id)
    if (user) {
        res.send(user)
    } else {
        res.status(404).send({ error: "User not found" })
    }
})

userRoutes.patch("/:id", authenticateToken, async (req, res) => {
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

userRoutes.patch("/:id/watchList", authenticateToken, async (req, res) => {
    try {
        if (req.user.id == req.params.id || req.user.isAdmin) {
            const user = await UserModel.findById(req.params.id)
            if (!user.watchList.some(movie => movie.original_title === req.body.original_title)) {
                user.watchList.push(req.body)  
                const request = {
                    "watchList": user.watchList
                }
                const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, request, { new: true })
                if (updatedUser) {
                    res.send(updatedUser)
                } else {
                    res.status(404).send({ error: "Operation not completed successfully" })
                }
            } else {
                res.status(404).send({ error: "Movie already in watched list" })
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

userRoutes.delete("/:id/watchList", authenticateToken, async (req, res) => {
    try {
        if (req.user.id == req.params.id || req.user.isAdmin) {
            const user = await UserModel.findById(req.params.id)
            if (user.watchList.some(movie => movie.original_title === req.body.original_title)) {
                const request = {
                    "watchList": user.watchList.filter(movie => {
                        return movie.original_title !== req.body.original_title
                    })
                }
                console.log(request)
                const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, request, { new: true })
                if (updatedUser) {
                    res.send(updatedUser)
                } else {
                    res.status(404).send({ error: "Operation not completed successfully" })
                }
            } else {
                res.status(404).send({ error: "Movie not in Watched List" })
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

userRoutes.patch("/:id/wishList", authenticateToken, async (req, res) => {
    try {
        if (req.user.id == req.params.id || req.user.isAdmin) {
            const user = await UserModel.findById(req.params.id)
            if (!user.wishList.some(movie => movie.original_title === req.body.original_title)) {
                user.wishList.push(req.body)  
                const request = {
                    "wishList": user.wishList
                }
                const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, request, { new: true })
                if (updatedUser) {
                    res.send(updatedUser)
                } else {
                    res.status(404).send({ error: "Operation not completed successfully" })
                }
            } else {
                res.status(404).send({ error: "Movie already in wish list" })
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

userRoutes.delete("/:id/wishList", authenticateToken, async (req, res) => {
    try {
        if (req.user.id == req.params.id || req.user.isAdmin) {
            const user = await UserModel.findById(req.params.id)
            if (user.wishList.some(movie => movie.original_title === req.body.original_title)) {
                const request = {
                    "wishList": user.wishList.filter(movie => {
                        return movie.original_title !== req.body.original_title
                    })
                }
                const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, request, { new: true })
                if (updatedUser) {
                    res.send(updatedUser)
                } else {
                    res.status(404).send({ error: "Operation not completed successfully" })
                }
            } else {
                res.status(404).send({ error: "Movie not in Wish List" })
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