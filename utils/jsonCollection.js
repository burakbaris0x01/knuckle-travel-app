const fs = require('fs/promises')
const path = require('path')
const crypto = require('crypto')

const dataDir = path.join(__dirname, '..', 'data')
let writeQueue = Promise.resolve()

const ensureFile = async (filePath) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, '[]', 'utf8')
  }
}

const readJson = async (filePath) => {
  await ensureFile(filePath)
  const content = await fs.readFile(filePath, 'utf8')
  return content.trim() ? JSON.parse(content) : []
}

const writeJson = async (filePath, data) => {
  writeQueue = writeQueue.then(async () => {
    await ensureFile(filePath)
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  })
  return writeQueue
}

const getValue = (item, key) => item[key]

const matchesValue = (actual, expected) => {
  if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
    if (Array.isArray(expected.$in)) {
      return Array.isArray(actual)
        ? actual.some((value) => expected.$in.includes(value))
        : expected.$in.includes(actual)
    }
  }

  if (Array.isArray(actual)) {
    return actual.includes(expected)
  }

  return actual === expected
}

const matchesQuery = (item, query = {}) => {
  return Object.entries(query).every(([key, expected]) => matchesValue(getValue(item, key), expected))
}

const applyUpdate = (item, update = {}) => {
  if (update.$push) {
    for (const [key, value] of Object.entries(update.$push)) {
      if (!Array.isArray(item[key])) item[key] = []
      if (!item[key].includes(value)) item[key].push(value)
    }
  }

  if (update.$pull) {
    for (const [key, value] of Object.entries(update.$pull)) {
      if (Array.isArray(item[key])) item[key] = item[key].filter((entry) => entry !== value)
    }
  }

  if (update.$unset) {
    for (const key of Object.keys(update.$unset)) {
      delete item[key]
    }
  }

  const directUpdates = Object.entries(update).filter(([key]) => !key.startsWith('$'))
  for (const [key, value] of directUpdates) {
    item[key] = value
  }
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const createQuery = (resolver) => ({
  lean: async () => clone(await resolver()),
  then: (resolve, reject) => resolver().then(resolve, reject),
  catch: (reject) => resolver().catch(reject),
})

const createCollection = (fileName, options = {}) => {
  const filePath = path.join(dataDir, fileName)

  return {
    find(query = {}) {
      return createQuery(async () => {
        const items = await readJson(filePath)
        return clone(items.filter((item) => matchesQuery(item, query)))
      })
    },

    findOne(query = {}) {
      return createQuery(async () => {
        const items = await readJson(filePath)
        const item = items.find((entry) => matchesQuery(entry, query))
        return item ? clone(item) : null
      })
    },

    async create(document) {
      const items = await readJson(filePath)
      const newDocument = {
        _id: crypto.randomUUID(),
        ...(options.defaults || {}),
        ...document,
      }

      if (options.uniqueKey && items.some((item) => item[options.uniqueKey] === newDocument[options.uniqueKey])) {
        const error = new Error(`${options.uniqueKey} must be unique`)
        error.code = 11000
        throw error
      }

      items.push(newDocument)
      await writeJson(filePath, items)
      return clone(newDocument)
    },

    async updateOne(query = {}, update = {}) {
      const items = await readJson(filePath)
      const item = items.find((entry) => matchesQuery(entry, query))

      if (!item) {
        return { matchedCount: 0, modifiedCount: 0 }
      }

      applyUpdate(item, update)
      await writeJson(filePath, items)
      return { matchedCount: 1, modifiedCount: 1 }
    },

    async deleteOne(query = {}) {
      const items = await readJson(filePath)
      const nextItems = items.filter((item) => !matchesQuery(item, query))
      await writeJson(filePath, nextItems)
      return { deletedCount: items.length - nextItems.length }
    },
  }
}

module.exports = createCollection
