'use strict'

import test from 'ava'
import micro from 'micro'
import uuid from 'uuid-base62'
import listen from 'test-listen'
import request from 'request-promise'
import pictures from '../pictures.js'

test('GET /:id', async t => {
  const id = uuid.v4()

  const srv = micro(pictures)

  const url = await listen(srv)
  const body = await request({ uri: `${url}/${id}`, json: true })
  t.deepEqual(body, { id })
})

test.todo('POST /')
test.todo('POST /:id/like')
