import closeConnection from "../src/config/db.js"
import UserModel from "../src/models/userModel.js"

const users = [
    {
        "name": "Myles",
        "email": "fake@fake.com",
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
        ]
    },
    {
        "name": "Yoshi",
        "email": "fake1@fake.com",
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
        ]
    },
    {
        "name": "Mitch",
        "email": "fake2@fake.com",
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
        ]
    }
]

await UserModel.deleteMany()
console.log('Deleted users')
await UserModel.init()
const usrs = await UserModel.insertMany(users)
console.log('Added users')

closeConnection()