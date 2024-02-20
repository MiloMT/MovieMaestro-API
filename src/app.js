import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes.js'
import closeConnection from "./config/db.js"

const app = express()

app.use(cors())

app.use(express.json())

app.get("/", (req, res) => res.send({ info: "MovieMaestro API" }))
app.use("/users", userRoutes)

export default app