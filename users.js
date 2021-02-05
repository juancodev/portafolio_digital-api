'use strict'

import { send, json } from 'micro'
import httpHash from 'http-hash'
import Db from 'portafolio_digital-db'
import config from './config.js'
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

hash.set('POST /', async function saveUser (req, res, params) {
  //  obtengo el usuario mediante la peticción http
  const user = await json(req)
  await db.connect()
  //  almaceno el usuario
  const created = await db.saveUser(user)
  await db.disconnect()

  //  garantizamos que le vamos a eliminar los campos email y password antes de enviarle la respuesta
  delete created.email
  delete created.password

  send(res, 201, created)
})

//  creamos en el microservicio la ruta para obtener el nombre de usuario
hash.set('GET /:username', async function getUser (req, res, params) {
  //  En este caso sí utilizamos los parámetros
  const username = params.username
  await db.connect()
  const user = await db.getUser(username)
  delete user.email
  delete user.password
  await db.disconnect()

  send(res, 200, user)
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
