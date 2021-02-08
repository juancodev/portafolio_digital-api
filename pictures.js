'use strict'

import { send, json } from 'micro'
import httpHash from 'http-hash'
import Db from 'portafolio_digital-db'
import config from './config.js'
import utils from './lib/utils.js'
import DbStub from './test/stub/db.js'

//  obtenemos el entorno de ejecución y si no se decide ningún tipo de variable será producción
const env = process.env.NODE_ENV || 'production'

//  necesitamos instanciar la clase Db
let db = new Db(config.db)

if (env === 'test') {
  db = new DbStub()
}

//  creamos la instancia de la clase
const hash = httpHash()

//  creamos la ruta para obtener imagenes por tag
hash.set('GET /tag/:tag', async function byTag (req, res, params) {
  const tag = params.tag
  await db.connect()
  const images = await db.getImagesByTag(tag)
  await db.disconnect()
  send(res, 200, images)
})

//  crearemos la ruta de listar imagen antes de la ruta del id
hash.set('GET /list', async function list (req, res, params) {
  await db.connect()
  const images = await db.getImages()
  await db.disconnect()
  send(res, 200, images)
})

//  esta línea nos permite determinar cuales son las rutas y qué es lo que vamos a recibir
hash.set('GET /:id', async function getPicture (req, res, params) {
  //  primero vamos a obtener el id de los parámetros
  const id = params.id
  //  necesitamos esperar a que se conecte a la base de datos
  await db.connect()
  //  realizamos la consulta
  const image = await db.getImage(id)
  //  terminamos ya nuestra consulta
  await db.disconnect()
  //  y enviamos esa imagen en nuestra respuesta
  send(res, 200, image)
})

hash.set('POST /', async function postPicture (req, res) {
  const image = await json(req)
  //  antes de validar la conexión a la base de datos, necesitamos validar si recibe un token o no
  try {
    const token = await utils.extractToken(req)
    const encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== image.userId) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, { error: 'Token invalido' })
  }

  await db.connect()
  const created = await db.saveImage(image)
  await db.disconnect()
  send(res, 201, created)
})

hash.set('POST /:id/like', async function likePicture (req, res, params) {
  const id = params.id
  await db.connect()
  //  en este caso le hacemos like a la imagen
  const image = await db.likeImage(id)
  await db.disconnect()
  send(res, 200, image)
})

//  micro, espera que se le exporte una función asíncrona
export default async function main (req, res) {
  //  Acá se almaceraná toda la lógica de las peticiones que vamos a recibir
  const { method, url } = req
  //  crearemos un match que es el que verifica si lo que le estamos pasando en el hash.set() tiene el mismo patrón
  const match = hash.get(`${method.toUpperCase()} ${url}`)
  //  Para saber si la ruta está definida o no es con el handle fue definido, es la función que vamos a ejecutar en todo el proceso de ejecución
  if (match.handler) {
    try {
      await match.handler(req, res, match.params)
    } catch (e) {
      send(res, 500, { error: e.message })
    }
  } else {
    send(res, 404, { error: 'ruta no encontrada' })
  }
}
//  línea 15 es lo mismo que escriba const method = req.method o url = req.url
