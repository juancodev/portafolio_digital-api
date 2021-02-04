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
test.todo('POST /:id/like')
