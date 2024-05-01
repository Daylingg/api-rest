const z = require('zod') //libreria para hacer validaciones

//esquema de validaciones para la pelicula
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string', //si el tipo es invalido se le pasa un msj
    required_error: 'Movie title is required', //si es requerido tambien lanzamos msj
  }),
  year: z.number().int().min(1900).max(2024), //en el año queremos q sea nuero y se le encadena q sea entero y ademas el rango minimo y maximo
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5), //como tiene valor quiere decir q es opcional si no pasan el valor por defecto coge 5 en este caso
  poster: z.string().url({
    message: 'Poster must be a valid url',
  }),
  genre: z.array(
    z.enum([
      'Action',
      'Adventure',
      'Comedy',
      'Drama',
      'Fantasy',
      'Horror',
      'Thriller',
      'Sci-Fi',
      'Crime',
    ]), //se usa un enum donde se puede poner el array de los generos
    {
      required_error: 'Genre is required',
      invalid_type_error: 'Movie genre must by an array of enum',
    }
  ),
})

//se crea una funcion donde se le pasa un object para validar si en realidad es una movie
function validateMovie(object) {
  return movieSchema.safeParse(object) //saveParse para gestionar el error devuelve un obj resolt q dice si hay un error o si hay datos
}

function validatePartialMovie(input) {
  //el .partial() lo q hace es q pone opcional las propiedades si no estan no pasa nada y si esta la valida como debe hacerlo
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie,
}
