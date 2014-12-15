var memdb = require('memdb')
var tape = require('tape')
var bayes = require('./')

tape('postive / negative', function(t) {
  var nb = bayes(memdb())

  nb.train('positive', 'amazing, awesome movie!! Yeah!! Oh boy.', function(err) {
    t.notOk(err, 'no err')
    nb.train('positive', 'Sweet, this is incredibly, amazing, perfect, great!!', function(err) {
      t.notOk(err, 'no err')
      nb.train('negative', 'terrible, shitty thing. Damn. Sucks!!', function(err) {
        t.notOk(err, 'no err')
        nb.classify('awesome, cool, amazing!! Yay.', function(err, category) {
          t.same(category, 'positive', 'should be positive')
          t.end()
        })
      })
    })
  })
})

tape('spam / not spam', function(t) {
  var nb = bayes(memdb())

  nb.train('spam', 'Great viagra for you!', function(err) {
    t.notOk(err, 'no err')
    nb.train('not spam', 'UTOSC is the best conference ever!', function(err) {
      t.notOk(err, 'no err')
      nb.train('not spam', 'Some more strings that are not spam!', function(err) {
        t.notOk(err, 'no err')
        nb.classify('Great opportunity in Nigeria!', function(err, category) {
          t.same(category, 'spam', 'should be spam')
          t.end()
        })
      })
    })
  })
})
