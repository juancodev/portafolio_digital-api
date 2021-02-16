'use strict'

const jwt = require('jsonwebtoken')
const bearer = require('token-extractor')

//  generamos un objeto por defecto que vamos a exportar
module.exports = {
  //  le generamos un nombre asíncrono a una funcion que recibe el payload (datos), palabra clave y options
  async signToken (payload, secret, options) {
    return new Promise((resolve, reject) => {
      //  para validar que recibe el dato correcto, en mi caso es por nombre de usuario y nos devuelve la información en un callback
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) return reject(err)

        resolve(token)
      })
    })
  },

  async verifyToken (token, secret, options) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, options, (err, decoded) => {
        if (err) return reject(err)

        //  este es el payload ya decodificado
        resolve(decoded)
      })
    })
  },

  async extractToken (req) {
    return new Promise((resolve, reject) => {
      bearer(req, (err, token) => {
        if (err) return reject(err)

        resolve(token)
      })
    })
  }
}
