// Request body sanitize dirty content
// Always put after body parser [express.json()]
const sanitizeHtml = require('sanitize-html')
const config = require('../config/sanitizer_rules/sanitize-request-body.config')
const raygunClient = require('../src/lib/raygun/raygun-client').raygunClient

const sanitize = (val) => {
  if (typeof val !== 'string') {
    return val
  }

  try {
    const dirty = val
    const clean = sanitizeHtml(val, config)

    // Raygun report if sanitized
    if (dirty !== clean) {
      console.error(`SANITIZED | DIRTY: ${dirty} | CLEAN: ${clean}`)
      const error = new Error({
        message: 'Dirty html content sanitized',
        dirty,
        clean
      })
      raygunClient.send(error)
    }

    return clean
  } catch (e) {
    console.error('Sanitization failed', val, e)
    const error = new Error({
      message: 'Failed to sanitize html',
      html: val
    })
    raygunClient.send(error)
    return val
  }
}

// Iterate over body object
const iterateRecursiveAndSanitize = obj => {
  for (const i in obj) {
    if (typeof obj[i] === 'object' && obj[i] !== null) {
      iterateRecursiveAndSanitize(obj[i])
    } else {
      if (obj[i]) {
        obj[i] = sanitize(obj[i])
      }
    }
  }
}

// Middleware function
module.exports = (req, res, next) => {
  if (req.body) {
    iterateRecursiveAndSanitize(req.body)
  }

  next()
}
