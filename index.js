// Request body sanitize dirty content
// Always put after body parser [express.json()]
const sanitizeHtml = require('sanitize-html')

module.exports = function (config) {
  
  const sanitize = (val) => {
    if (typeof val !== 'string') {
      return val
    }
  
    try {
      const dirty = val
      const clean = sanitizeHtml(val, config)
  
      return clean
    } catch (e) {
      console.error('Sanitization failed', val, e)
      const error = new Error({
        message: 'Failed to sanitize html',
      })
      return val
    }
  }
  
  // Iterate over body object
  const iterateRecursiveAndApplyFun = (obj, fun) => {
    for (const i in obj) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        iterateRecursiveAndApplyFun(obj[i])
      } else {
        if (obj[i]) {
          obj[i] = fun(obj[i])
        }
      }
    }
  }
  
  return function (req, res, next) {
    if (req.body) {
      iterateRecursiveAndApplyFun(req.body, sanitize)
    }
  
    next()
  }
  
}


