'use strict'

import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import fixtures from './fixtures/index.js'
import auth from '../auth.js'
import utils from '../lib/utils.js'
import config from '../config.js'

//  para no estar creando cada vez la base de datos sino que siempre antes se cree y después se desconecte
test.beforeEach(async t => {
  const srv = micro(auth)
  t.context.url = await listen(srv)
})

//  primero vamos a validar que la ruta es válida
test('success POST /', async t => {
  //  vamos a obtener el usuario de los fixtures
  const user = fixtures.getUser()
  const url = t.context.url

  //  y realizamos la siguiente petición http
  const options = {
    method: 'POST',
    uri: url,
    body: {
      username: user.username,
      password: user.password
    },
    json: true
  }

  //  esto nos genera un token
  const token = await request(options)
  //  validar que sea un token válido
  const decoded = await utils.verifyToken(token, config.secret)

  //  nuestro test debería validar que nuestro nombre de usuario decodificado sea el mismo que el usuario
  t.is(decoded.username, user.username)
})
