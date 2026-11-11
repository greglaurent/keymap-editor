const api = require('./api')
const config = require('./api/config')

api.listen(config.PORT, config.HOST)
console.log('listening on', config.HOST, config.PORT)
