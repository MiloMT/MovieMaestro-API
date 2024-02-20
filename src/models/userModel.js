import usersSchema from "../controllers/userController.js"
import mongoose from 'mongoose'

const UserModel = mongoose.model('User', usersSchema)

export default UserModel