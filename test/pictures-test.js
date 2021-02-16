'use strict'

const test = require('ava')
const micro = require('micro')
const listen = require('test-listen')
const request = require('request-promise')
const fixtures = require('./fixtures/index.js')
const pictures = require('../pictures.js')
const utils = require('../lib/utils.js')
const config = require('../config.js')

//  para no estar creando cada vez la base de datos sino que siempre antes se cree y después se desconecte
test.beforeEach(async t => {
  const srv = micro(pictures)
  t.context.url = await listen(srv)
})

test('GET /:id', async t => {
  const image = fixtures.getImage()
  const url = t.context.url
  const body = await request({ uri: `${url}/${image.publicId}`, json: true })
  t.deepEqual(body, image)
})

//  Prueba de token seguro
test('secure POST /', async t => {
  //  creamos la variable que almacena los fixtures con el método getImage()
  const image = fixtures.getImage()
  const url = t.context.url
  //  Generamos un token, utilizando la lib creada con utils.signToken(), pasando el payload (data) como el userId lo vamos a obtener de la imagen.userId y le pasamos el secret que será elaborado en un archivo aparte
  const token = await utils.signToken({ userId: image.userId }, config.secret)

  const options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    headers: {
      Authorization: `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  //  creamos la respuesta primero
  const response = await request(options)

  t.is(response.statusCode, 201)
  t.deepEqual(response.body, image)
})

test('POST /:id/like', async t => {
  const image = fixtures.getImage()
  const url = t.context.url

  const options = {
    method: 'POST',
    // se le pasa en la uri: el contexto obtenido, el id de la imagen y el like
    uri: `${url}/${image.id}/like`,
    json: true
  }

  //  en este caso no vamos a validar el statusCode solo estamos atento a recibir lo solicitado
  const body = await request(options)
  //  para este caso como es un objeto pequeño utilizaremos este método pero no es muy recomendable utilizarlo para clonar imágenes a grandes objetos
  const imageNew = JSON.parse(JSON.stringify(image))
  imageNew.liked = true
  imageNew.likes = 1
  t.deepEqual(body, imageNew)
})

test('GET /list', async t => {
  const images = fixtures.getImages()
  const url = t.context.url

  const options = {
    method: 'GET',
    uri: `${url}/list`,
    json: true
  }

  const body = await request(options)

  t.deepEqual(body, images)
})

test('GET /tag/:tag', async t => {
  const images = fixtures.getImagesByTag()
  const url = t.context.url

  const options = {
    method: 'GET',
    uri: `${url}/tag/increible`,
    json: true
  }

  const body = await request(options)

  t.deepEqual(body, images)
})
