'use strict'

import { send } from 'micro'
import httpHash from 'http-hash'

//  creamos la instancia de la clase
const hash = httpHash()

//  esta línea nos permite determinar cuales son las rutas y qué es lo que vamos a recibir
hash.set('GET /:id', async function getPicture (req, res, params) {
  //  respondemos a la solicitud que no está haciendo la ruta
  send(res, 200, params)
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
