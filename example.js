var bayes = require('./')

var nb = bayes(require('memdb')())

nb.train('positive', 'amazing, awesome movie!! Yeah!! Oh boy.', function() {
  nb.train('positive', 'Sweet, this is incredibly, amazing, perfect, great!!', function() {
    nb.train('negative', 'terrible, shitty thing. Damn. Sucks!!', function() {
      nb.classify('awesome, cool, amazing!! Yay.', function(err, category) {
        console.log('category is '+category)
      })
    })
  })
})
