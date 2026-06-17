const createCollection = require('../utils/jsonCollection')

module.exports = createCollection('travels.json', {
  uniqueKey: 'locationId',
  defaults: {
    interestedUsers: [],
  },
})
