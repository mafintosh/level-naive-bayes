var after = require('after-all')
var mutexify = require('mutexify')
var through = require('through2')
var pump = require('pump')
var b = require('bluebird')
var noop = function() {}

var defaultTokenize = function(str) {
  str = str.replace(/[^\w\s]/g, ' ').trim()
  return !str ? [] : str.split(/\s+/).map(function(s) { return s.toLowerCase() })
}

var get = function(db, names, cb) {
  var result = {}

  var next = after(function(err) {
    if (err) return cb(err)
    cb(null, result)
  })

  names.forEach(function(name) {
    var cb = next()

    db.get(name, function(err, num) {
      if (err && !err.notFound) return cb(err)
      result[name] = Number(num || 0)
      cb()
    })
  })
}

var frequencyTable = function(tokens) {
  var table = {}

  tokens.forEach(function (token) {
    table[token] = (table[token] || 0) + 1
  })

  return table
}

module.exports = function(db, opts) {
  if (!opts) opts = {}

  var that = {}
  var lock = mutexify()
  var tokenize = opts.tokenize || defaultTokenize

  var train = function(category, tokens, cb) {
    if (!cb) cb = noop
    if (typeof tokens === 'string') tokens = tokenize(tokens)

    var batch = []
    var catSamples = 'samples!'+category
    var catFreq = 'frequency!'+category+'!'
    var catTokens = 'tokens!'+category
    var vocInc = 0

    var put = function(key, value) {
      batch.push({
        type:'put',
        key:key,
        value:''+value
      })
    }

    get(db, ['samples', '$v', catSamples, catTokens], function(err, result) {
      if (err) return cb(err)

      put('samples', result.samples+1)
      put(catSamples, result[catSamples]+1)
      put(catTokens, result[catTokens]+tokens.length)

      var $v = result.$v
      var freqs = frequencyTable(tokens)
      var keys = Object.keys(freqs).map(function(token) {
        return catFreq+token
      })

      get(db, keys, function(err, result) {
        if (err) return cb(err)

        Object.keys(freqs).forEach(function(key) {
          put(catFreq+key, result[catFreq+key]+freqs[key])
        })

        var vocs = Object.keys(freqs).map(function(key) {
          return '$v!'+key
        })

        get(db, vocs, function(err, result) {
          var inc = 0

          Object.keys(result).forEach(function(key) {
            if (result[key]) return
            put(key, 1)
            inc++
          })

          if (inc) put('$v', $v+inc)
          db.batch(batch, cb)
        })
      })
    })
  }

  that.db = db

  that.train = function(category, tokens, cb) {
    lock(function(release) {
      train(category, tokens, function(err) {
        if (err) return release(cb, err)
        release(cb)
      })
    })
  }

  that.trainAsync = b.promisify(that.train)

  that.classify = function(tokens, cb) {
    if (typeof tokens === 'string') tokens = tokenize(tokens)

    var maxProp = -Infinity
    var freqs = frequencyTable(tokens)
    var chosen = null

    var write = function(data, enc, cb) {
      var category = data.key.slice('samples!'.length)
      var catSamples = Number(data.value)
      var catFreq = 'frequency!'+category+'!'
      var catTokens = 'tokens!'+category

      var keys = ['samples', '$v', catTokens]

      Object.keys(freqs).forEach(function(key) {
        keys.push(catFreq+key)
      })

      get(db, keys, function(err, result) {
        if (err) return cb(err)

        var catProp = catSamples / result.samples
        var logProb = Math.log(catProp)

        Object.keys(freqs).forEach(function(key) {
          var tokenFreq = result[catFreq+key]
          var tokenProb = (tokenFreq+1) / (result[catTokens]+result.$v)

          logProb += freqs[key] * Math.log(tokenProb)
        })

        if (logProb > maxProp) {
          maxProp = logProb
          chosen = category
        }

        cb()
      })
    }

    pump(db.createReadStream({gt:'samples!', lt:'samples!\xff'}), through.obj(write), function(err) {
      if (err) return cb(err)
      cb(null, chosen)
    })
  }

  that.classifyAsync = b.promisify(that.classify)


  return that
}
