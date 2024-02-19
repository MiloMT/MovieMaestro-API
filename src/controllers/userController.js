import mongoose from 'mongoose'

const usersSchema = new mongoose.Schema({
    name: { type: String, required: true }
})

export default usersSchema