const zod = require('zod')

const movieShema = zod.object({
  title: zod.string({
    required_error: 'Title is required.'
  }),
  year: zod.number().int().positive(),
  director: zod.string(),
  duration: zod.number().int().positive(),
  poster: zod.string().url(),
  genre: zod.array(
    zod.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Crime'])
  ),
  rate: zod.number().min(0).max(10).default(1)
})

function validateMovie (object) {
  return movieShema.safeParse(object)
}

function validatePartialMovie (inputObject) {
  return movieShema.partial().safeParse(inputObject)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
