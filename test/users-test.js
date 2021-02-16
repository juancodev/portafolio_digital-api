'use strict'

const test = require('ava')
const micro = require('micro')
const listen = require('test-listen')
const request = require('request-promise')
const fixtures = require('./fixtures/index.js')
const users = require('../users.js')

//  para no estar creando cada vez la base de datos sino que siempre antes se cree y después se desconecte
test.beforeEach(async t => {
  const srv = micro(users)
  t.context.url = await listen(srv)
})

//  primero crearemos un test para almacenar los usuarios
test('POST /', async t => {
  //  vamos a necesitar obtener un usuario de los fixtures. Los fixtures son datos de prueba básicos
  const user = fixtures.getUser()
  const url = t.context.url

  const options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      name: user.name,
      username: user.username,
      password: user.password,
      email: user.email
    },
    resolveWithFullResponse: true
  }

  const response = await request(options)

  //  de esta forma indicamos que los dos campos solicitados no serán visible para el consumidor (cliente)
  delete user.email
  delete user.password

  t.is(response.statusCode, 201)
  t.deepEqual(response.body, user)
})

test('GET/:username', async t => {
  const user = fixtures.getUser()
  const url = t.context.url

  const options = {
    method: 'GET',
    uri: `${url}/${user.username}`,
    json: true
  }

  const body = await request(options)

  delete user.email
  delete user.password

  t.deepEqual(body, user)
})
