const express = require('express') //se usa require pq se usa commonjs
const movies = require('./movies.json')
const crypto = require('crypto') //biblioteca nativa de node q permite crear id unicas
const { validateMovie, validatePartialMovie } = require('./schemas/movies.js')
const cors = require('cors') //se instala el modulo de cors

const app = express() //creamos el express
app.use(express.json()) //para traer el cuerpo de la request es necesario un middlewar q captura la request
app.disable('x-powered-by') //desabilitar un encabezado q saca express
//al cors se le pueden pasar opciones para decir q dominios tienen acceso
app.use(
  cors(/*{
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'https://movies.com',
        'https://midu.dev',
      ]

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }

      if (!origin) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
  }*/)
)

app.get('/', (req, res) => {
  res.json({ message: 'hola mundo' })
})

// los recursos q sean movies se identifican con movies
app.get('/movies', (req, res) => {
  //...todos los origenes q no sean nuestro propio origen estan permitidos
  //res.header('Access-Control-Allow-Origin', '*')

  const { genre } = req.query //de las res.query se desestructura el genero

  if (genre) {
    const filterMovies = movies.filter(
      //de cada pelicula vemos el genero y usamos some y transformamos el g.lowelcase y el genero en lowelcase y asi no importa el uso de minusculas y mayusculas
      (movie) =>
        movie.genre.some(
          (g) => g.toLocaleLowerCase() === genre.toLocaleLowerCase()
        ) //movie.genre.includes(genre) //como genre es arreglo podemos usar el include genre para ver si lo tiene
    )
    return res.json(filterMovies)
  }
  res.json(movies)
})

//recuperar una pelicula por el id
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id) //hacemos un find a ver si encontramos la peli segun el id q se paso
  if (movie) return res.json(movie) //si existe movie la devolvemos en la respuesta

  //si no se encuenta
  res.status(400).json({ message: 'Movie not found' })
})

//crear una peli...

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body) //podemos acceder a req.body gracias al middleware de express

  if (result.error) {
    // return res.status(400).json({ error: JSON.parse(result.error.message) })
    console.log(result.error.message) // Imprime el mensaje de error original en la consola
    return res
      .status(400)
      .json({ error: 'Error en la validación del objeto de película' })
  }

  const newMovie = {
    id: crypto.randomUUID(), //crea un uuid v4
    ...result.data, //como ya estan validados los datos se puede acceder a ellos en result.data
  }
  //esto no es rest, es solo para guardar los datos en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie) //201 cuando se crea un recurso
})

//actualizar algo especifico en la pelicula
app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body) //se guarda lo q el usuario envia pq quiere actualizar en especifico

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  //si no encuentra el indice de la peli se lanza un error
  if (movieIndex === -1) {
    return res.status(400).json({ message: 'Movie not found' })
  }

  //actualizamos la peli con loda datos de la pelicula y lo q envio el usuario
  const updateMovie = { ...movies[movieIndex], ...result.data }

  //la peli en ese index pasa a ser la peli actualizada
  movies[movieIndex] = updateMovie
  //devolvemos un json con la peli con los cambios echos
  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  //res.header('Access-Control-Allow-Origin', '*')

  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie deleted' })
})

//esto es necesario para los metodos post, put y delete si no se usa el middleware de cors
/*app.options('/movies/:id', (req, res) => {
  //...todos los origenes q no sean nuestro propio origen estan permitidos
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE')
  res.send(200)
})*/

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
