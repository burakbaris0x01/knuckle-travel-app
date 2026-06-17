const createCollection = require('../utils/jsonCollection')

module.exports = createCollection('users.json', {
  uniqueKey: 'username',
  defaults: {
    refreshTokens: [],
  },
})
