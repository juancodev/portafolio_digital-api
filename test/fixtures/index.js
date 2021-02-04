export default {
  getImage () {
    return {
      id: '4VHRRq5sDwPdhsdDMx33Um',
      publicId: '4v4jh26mc1pnMLISBeCO9j',
      userId: 'jmontilla',
      liked: false,
      likes: 0,
      src: 'http://portfolio.test/cambiar_esta_ruta.jpg',
      description: '#increible',
      tag: ['increible'],
      createdAt: new Date().toString()
    }
  },

  getImages () {
    return [
      this.getImage(),
      this.getImage(),
      this.getImage()
    ]
  },

  getImagesByTag () {
    return [
      this.getImage(),
      this.getImage()
    ]
  }
}
