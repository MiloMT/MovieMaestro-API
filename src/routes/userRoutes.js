import { Router } from "express"
import UserModel from "../models/userModel.js"
import authenticateToken from "../middlewares/authenticateToken.js"
import generateAccessToken from "../middlewares/generateAccessToken.js"
import bcrypt from "bcrypt"

const userRoutes = Router()

// Objects defined to format response from database
const adminDetails = {
    _id: 1,
    name: 1,
    email: 1,
    language: 1,
    streamingPlatform: 1,
    region: 1,
    watchList: 1,
    wishList: 1,
    isAdmin: 1
}

const userDetails = {
    _id: 1,
    name: 1,
    email: 1,
    language: 1,
    streamingPlatform: 1,
    region: 1,
    watchList: 1,
    wishList: 1
}

userRoutes.get("/", authenticateToken, async (req, res) => {
    try {
        // If user is admin, will return all users
        if (req.user.isAdmin) {
            return res.send(await UserModel.find({}, adminDetails))
        }
        
        // if user is not admin, will only return their own user
        const user = await UserModel.find({ email: req.user.email }, userDetails)

        if (user) {
            return res.send(user)
        } else {
            return res.status(404).send({ error: "User not found" })
        }
    }
    catch (err) {
        return res.status(500).send({ error: err.message })
    }
})

userRoutes.post("/", async (req, res) => {
    try {
        // Intercepts password to hash it prior to storing
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const insertedUser = await (await UserModel.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        }))
        // Checks whether the new user object meets the schema validation rules
        const savedUser = await insertedUser.save({ validateBeforeSave: true })
        // Lets the console know any errors from the validation check
        if (!savedUser) {
            return res.status(400).send({ error: updatedUser.errors })
        }
        return res.status(201).send(savedUser)
    }
    catch (err) {
        return res.status(500).send({ error: err.message })
    }
})

userRoutes.post("/login", async (req, res) => {
    const user = await UserModel.findOne({ email: req.body.email })

    // If user doesn't exist, lets user know that email or password is incorrect
    if (user == null) {
        return res.status(400).send({ status: "Incorrect Email or Password" })
    }

    try {
        // If password isn't correct, lets user know that email or password is incorrect
        if (await bcrypt.compare(req.body.password, user.password)) {
            // Generates JWT token on correct user & password details
            const accessToken = generateAccessToken(user)
            return res.json({ status: "Successful Login", accessToken: accessToken })
        } else {
            return res.status(409).send({ status: "Incorrect Email or Password" })
        }
    } catch {
        return res.status(500).send({ status: "Incorrect Email or Password" })
    }
})

userRoutes.get("/:id", authenticateToken, async (req, res) => {
    try {
        // If the user is admin, can get/modify any user, however standard users
        // can only retrieve/modify their own details
        if (req.user.id == !req.params.id && !req.user.isAdmin) {
            return res.status(401).send({ 
                error: "You do not have sufficient permissions for this operation" 
            })
        }

        const user = await UserModel.findById(req.params.id, userDetails)
        return res.send(user)
    }
    catch {
        return res.status(404).send({ error: "User not found" })
    }
})

userRoutes.patch("/:id", authenticateToken, async (req, res) => {
    try {
        // If the user is admin, can get/modify any user, however standard users
        // can only retrieve/modify their own details
        if (req.user.id == !req.params.id && !req.user.isAdmin) {
            return res.status(401).send({ 
                error: "You do not have sufficient permissions for this operation" 
            })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        // Runs schema validation on the updated user object
        const savedUser = await updatedUser.save({ validateBeforeSave: true })
        // Send back any validation errors
        if (!savedUser) {
            return res.status(400).send({ error: updatedUser.errors })
        }

        res.send(savedUser)
    }
    catch (err) {
        return res.status(500).send({ error: err.message })
    }
})

userRoutes.delete("/:id", authenticateToken, async (req, res) => {
    try {
        // If the user is admin, can get/modify any user, however standard users
        // can only retrieve/modify their own details
        if (req.user.id == !req.params.id && !req.user.isAdmin) {
            return res.status(401).send({ 
                error: "You do not have sufficient permissions for this operation" 
            })
        }

        const deletedUser = await UserModel.findByIdAndDelete(req.params.id)

        if (deletedUser) {
            return res.status(200).send({ status: "User has been deleted" })
        } else {
            return res.status(404).send({ error: "User not found" })
        }
    }
    catch (err) {
        return res.status(404).send({ error: "User not found" })
    }
})

userRoutes.patch("/:id/watchList", authenticateToken, async (req, res) => {
    try {
        // If the user is admin, can get/modify any user, however standard users
        // can only retrieve/modify their own details
        if (req.user.id == !req.params.id && !req.user.isAdmin) {
            return res.status(401).send({ 
                error: "You do not have sufficient permissions for this operation" 
            })
        }

        const user = await UserModel.findById(req.params.id)
        // Checks whether new object exists in array currently
        if (user.watchList.some(movie => movie.original_title === req.body.original_title)) {
            return res.status(409).send({ error: "Movie already in watched list" })
        }

        user.watchList.push(req.body)  
        // Runs schema validation on updated user object with new movie
        const updatedUser = await user.save()

        if (updatedUser) {
            return res.send(updatedUser)
        } else {
            return res.status(400).send({ error: "Operation not completed successfully" })
        }
    }
    catch (err) {
        return res.status(500).send({ error: err.message })
    }
})

userRoutes.delete("/:id/watchList", authenticateToken, async (req, res) => {
    try {
        // If the user is admin, can get/modify any user, however standard users
        // can only retrieve/modify their own details
        if (req.user.id == !req.params.id && !req.user.isAdmin) {
            return res.status(401).send({ 
                error: "You do not have sufficient permissions for this operation" 
            })
        }

        const user = await UserModel.findById(req.params.id)
        // Checks whether new object does exist in array
        if (!user.watchList.some(movie => movie.original_title === req.body.original_title)) {
            return res.status(404).send({ error: "Movie not in Watched List" })
        }

        const request = {
            // Creates a new array, filtering out the specified movie
            "watchList": user.watchList.filter(movie => {
                return movie.original_title !== req.body.original_title
            })
        }
        const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, request, { new: true })
        
        if (updatedUser) {
            return res.send(updatedUser)
        } else {
            return res.status(400).send({ error: "Operation not completed successfully" })
        }     
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

userRoutes.patch("/:id/wishList", authenticateToken, async (req, res) => {
    try {
        // If the user is admin, can get/modify any user, however standard users
        // can only retrieve/modify their own details
        if (req.user.id == !req.params.id && !req.user.isAdmin) {
            return res.status(401).send({ 
                error: "You do not have sufficient permissions for this operation" 
            })
        }

        const user = await UserModel.findById(req.params.id)
        // Checks whether new object exists in array currently
        if (user.wishList.some(movie => movie.original_title === req.body.original_title)) {
            return res.status(409).send({ error: "Movie already in wish list" })
        }

        user.wishList.push(req.body)  
        // Runs schema validation on updated user object with new movie
        const updatedUser = await user.save()

        if (updatedUser) {
            return res.send(updatedUser)
        } else {
            return res.status(400).send({ error: "Operation not completed successfully" })
        }
    }
    catch (err) {
        return res.status(500).send({ error: err.message })
    }
})

userRoutes.delete("/:id/wishList", authenticateToken, async (req, res) => {
    try {
        // If the user is admin, can get/modify any user, however standard users
        // can only retrieve/modify their own details
        if (req.user.id == !req.params.id && !req.user.isAdmin) {
            return res.status(401).send({ 
                error: "You do not have sufficient permissions for this operation" 
            })
        }

        const user = await UserModel.findById(req.params.id)
        // Checks whether new object does exist in array
        if (!user.wishList.some(movie => movie.original_title === req.body.original_title)) {
            return res.status(404).send({ error: "Movie not in Wish List" })
        }

        const request = {
            // Creates a new array, filtering out the specified movie
            "wishList": user.wishList.filter(movie => {
                return movie.original_title !== req.body.original_title
            })
        }
        const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, request, { new: true })
        
        if (updatedUser) {
            return res.send(updatedUser)
        } else {
            return res.status(400).send({ error: "Operation not completed successfully" })
        }     
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

export default userRoutes