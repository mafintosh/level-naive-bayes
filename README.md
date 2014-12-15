# level-naive-bayes

Naive Bayes text classifier that runs on top of leveldb so you can work with datasets that
doesn't fit in memory. Based on the [bayes](https://github.com/ttezel/bayes) module.

```
npm install level-naive-bayes
```

## Usage

``` js
var bayes = require('level-naive-bayes')

var nb = bayes(db) // where db is a levelup instance

nb.train('positive', 'amazing, awesome movie!! Yeah!! Oh boy.', function() {
  nb.train('positive', 'Sweet, this is incredibly, amazing, perfect, great!!', function() {
    nb.train('negative', 'terrible, shitty thing. Damn. Sucks!!', function() {
      nb.classify('awesome, cool, amazing!! Yay.', function(err, category) {
        console.log('category is '+category)
      })
    })
  })
})
```

## License

MIT
