import { Router } from "express"
import UserModel from "../models/userModel.js"

const userRoutes = Router()

userRoutes.get('/', async (req, res) => {
    res.send(await UserModel.find())
})

userRoutes.post('/', async (req, res) => {
    try {
        const insertedEntry = await (await UserModel.create(req.body))
        res.status(201).send(insertedEntry)
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

userRoutes.get('/:id', async (req, res) => {
    const entry = await UserModel.findById(req.params.id)
    if (entry) {
        res.send(entry)
    } else {
        res.status(404).send({ error: 'Entry not found' })
    }
})

userRoutes.put('/:id', async (req, res) => {
    try {
        const updatedEntry = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (updatedEntry) {
            res.send(updatedEntry)
        } else {
            res.status(404).send({ error: 'Entry not found' })
        }
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

userRoutes.delete('/:id', async (req, res) => {
    try {
        const deletedEntry = await UserModel.findByIdAndDelete(req.params.id)
        if (deletedEntry) {
            res.sendStatus(204)
        } else {
            res.status(404).send({ error: 'Entry not found' })
        }
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }
})

export default userRoutes