# level-naive-bayes

Naive Bayes text classifier that runs on top of leveldb. Based on the [bayes](https://github.com/ttezel/bayes) module.

```
npm install level-naive-bayes
```

[![build status](http://img.shields.io/travis/mafintosh/level-naive-bayes.svg?style=flat)](http://travis-ci.org/mafintosh/level-naive-bayes)

## Usage

``` js
var bayes = require('level-naive-bayes')

var nb = bayes(db) // where db is a levelup instance

nb.train('positive', 'amazing, awesome movie!! Yeah!! Oh boy.', function() {
  nb.train('positive', 'this is incredibly, amazing, perfect, great!', function() {
    nb.train('negative', 'terrible, shitty thing. Damn. Sucks!!', function() {
      nb.classify('awesome, cool, amazing!! Yay.', function(err, category) {
        console.log('category is '+category)
      })
    })
  })
})
```

## API

#### `nb = bayes(db, [options])`

Creates a new instance. `db` should be a [levelup](https://github.com/rvagg/node-levelup).
Options include:

``` js
{
  tokenize: function(str) {
    return str.split(' ') // pass in custom tokenizer
  }
}
```

#### `nb.train(category, text, cb)`

Train the classifier with the given text for a category.
If the text is already tokenized pass in an array of tokens instead of text

#### `nb.classify(text, cb)`

Classify the given text into a category.
If the text is already tokenized pass in an array of tokens instead of text


#### `nb.trainAsync(category, text)`
Returns promise of finished training, usage:

``` js
nb.trainAsync('positive', 'amazing, awesome movie!! Yeah!! Oh boy.').then(function () {
  return nb.classify('awesome, cool, amazing!! Yay.', function (err, category) {
    console.log('positive', category);
  })
})
```

For better example look at `/test/qClassifyTest.js`
'can que all asynchronous code'



### Tests
`npm i --save-dev`

or

`npm i -g mocha`

then run:
`mocha`

## License

MIT
