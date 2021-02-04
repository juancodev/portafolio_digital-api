'use strict'

import fixtures from '../fixtures/index.js'

//  este modulo será una clase y con esto probaremos si las rutas funcionan o no, ya que la base de datos se probó en el módulo anterior
export default class Db {
  connect () {
    return Promise.resolve(true)
  }

  disconnect () {
    return Promise.resolve(true)
  }

  getImage (id) {
    return Promise.resolve(fixtures.getImage())
  }

  saveImage (image) {
    return Promise.resolve(fixtures.getImage())
  }

  likeImage (id) {
    const image = fixtures.getImage()
    image.liked = true
    image.likes = 1
    return Promise.resolve(image)
  }

  getImages () {
    return Promise.resolve(fixtures.getImages())
  }

  getImagesByTag (tag) {
    return Promise.resolve(fixtures.getImagesByTag())
  }
}
