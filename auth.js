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

hash.set('POST /', async function authenticate (req, res, params) {
  //  primero debemos crear un objeto que contiene las credenciales
  const credentials = await json(req)
  await db.connect()
  const auth = await db.authenticate(credentials.username, credentials.password)

  //  si no hay autenticación voy a retornar un mensaje de error
  if (!auth) {
    return send(res, 401, { error: 'invalid credentials' })
  }

  //  creamos un nuevo token
  const token = await utils.signToken({
    username: credentials.username
  }, config.secret)

  //  enviamos la respuesta con un success
  send(res, 200, token)
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
