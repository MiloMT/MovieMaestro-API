import app from './src/app.js'

const port = process.env.PORT || 4001

app.listen(port, () => {
    console.log(`MovieMaestro API listening on port ${port}`)
})