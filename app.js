const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const app = express()
const moviesJson = require('./movies')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

app.disable('x-powered-by')
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev',
      'https://api-rest-lilac-xi.vercel.app'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/movies', (req, res) => {
  const { gender } = req.query
  if (gender) {
    const moviesByGender = moviesJson.filter(movie => movie.genre.includes(gender))
    // alternative for case sensitive (movie => movie.genre.some(g => g.toLowerCase() === gender.toLowerCase())
    return res.json(moviesByGender)
  }
  res.json(moviesJson)
})

app.get('/movies/:id', (req, res) => { // path to regex
  const { id } = req.params
  const movie = moviesJson.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not Found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data // can do this because data was validate in previous function
  }

  moviesJson.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (result.error) {
    res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const { id } = req.params
  const movieIndex = moviesJson.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    res.status(404).json({ message: 'Movie not Found' })
  }
  const alterMovie = {
    ...moviesJson[movieIndex], // movie by ID
    ...result.data // data to update validated
  }
  moviesJson[movieIndex] = alterMovie

  return res.json(alterMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = moviesJson.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    res.status(404).json({ message: 'Movie not Found' })
  }

  moviesJson.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})
