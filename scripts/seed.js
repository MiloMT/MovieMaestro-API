import bcrypt from "bcrypt"
import closeConnection from "../src/config/db.js"
import UserModel from "../src/models/userModel.js"
import dotenv from "dotenv"

dotenv.config()

const hashedPassword1 = await bcrypt.hash(process.env.TEST_PASSWORD, 10)
const hashedPassword2 = await bcrypt.hash(process.env.TEST_PASSWORD, 10)
const hashedPassword3 = await bcrypt.hash(process.env.TEST_PASSWORD, 10)

const users = [
    {
        "name": "Myles",
        "email": "fake@fake.com",
        "password": hashedPassword1,
        "language": "en",
        "streamingPlatform": [
            "Netflix",
            "Binge"
        ],
        "region": "AU",
        "watchList": [
        ],
        "wishList": [
        ],
        "isAdmin": true
    },
    {
        "name": "Yoshi",
        "email": "fake1@fake.com",
        "password": hashedPassword2,
        "language": "ja",
        "streamingPlatform": [
            "Netflix",
            "Binge"
        ],
        "region": "AU",
        "watchList": [
        ],
        "wishList": [
        ],
        "isAdmin": true
    },
    {
        "name": "Mitch",
        "email": "fake2@fake.com",
        "password": hashedPassword3,
        "language": "en",
        "streamingPlatform": [
            "Netflix",
            "Binge"
        ],
        "region": "JP",
        "watchList": [
        ],
        "wishList": [
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