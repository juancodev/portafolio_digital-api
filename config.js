module.exports = {
  db: {},
  secret: process.env.PORTAFOLIO_SECRET || 'p0rt4f0l10' //  no usar default
}
//  en este caso, crearemos una variable de entorno que sea la secret para poder así tener más seguridad y control a la hora de que subamos nuestro repositorio a cualquier plataforma
