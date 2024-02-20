import closeConnection from "../src/config/db.js"
import UserModel from "../src/models/userModel.js"

const users = [
    {
        "name": "Myles"
    },
    {
        "name": "Yoshi"
    },
    {
        "name": "Mitch"
    }
]

await UserModel.deleteMany()
console.log('Deleted users')
const usrs = await UserModel.insertMany(users)
console.log('Added users')

closeConnection()