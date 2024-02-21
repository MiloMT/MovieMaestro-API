import bcrypt from "bcrypt"
import closeConnection from "../src/config/db.js"
import UserModel from "../src/models/userModel.js"

const hashedPassword1 = await bcrypt.hash("password", 10)
const hashedPassword2 = await bcrypt.hash("password", 10)
const hashedPassword3 = await bcrypt.hash("password", 10)

const users = [
    {
        "name": "Myles",
        "email": "fake@fake.com",
        "password": hashedPassword1,
        "language": "en-au",
        "streamingPlatform": [
            "Netflix",
            "Binge"
        ],
        "watchList": [
            "Migration"
        ],
        "wishList": [
            "Beekeeper"
        ],
        "isAdmin": true
    },
    {
        "name": "Yoshi",
        "email": "fake1@fake.com",
        "password": hashedPassword2,
        "language": "en-au",
        "streamingPlatform": [
            "Netflix",
            "Binge"
        ],
        "watchList": [
            "Migration"
        ],
        "wishList": [
            "Beekeeper"
        ],
        "isAdmin": true
    },
    {
        "name": "Mitch",
        "email": "fake2@fake.com",
        "password": hashedPassword3,
        "language": "en-au",
        "streamingPlatform": [
            "Netflix",
            "Binge"
        ],
        "watchList": [
            "Migration"
        ],
        "wishList": [
            "Beekeeper"
        ],
        "isAdmin": true
    }
]

await UserModel.deleteMany()
console.log('Deleted users')
await UserModel.init()
const usrs = await UserModel.insertMany(users)
console.log('Added users')

closeConnection()