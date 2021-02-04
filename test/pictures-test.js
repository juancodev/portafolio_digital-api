'use strict'

import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import fixtures from './fixtures/index.js'
import pictures from '../pictures.js'

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

test('POST /', async t => {
  //  creamos la variable que almacena los fixtures con el método getImage()
  const image = fixtures.getImage()
  const url = t.context.url

  const options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    resolveWithFullResponse: true
  }

  //  luego vamos a ejecutar el request
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
