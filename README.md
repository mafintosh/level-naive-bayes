# level-naive-bayes

Naive Bayes text classifier that runs on top of leveldb. Based on the [bayes](https://github.com/ttezel/bayes) module.
It returns log-probabilities.
[Log_probaility](https://en.wikipedia.org/wiki/Log_probability)

```
npm install syzer-level-naive-bayes
```
[![build status](http://img.shields.io/travis/syzer/level-naive-bayes.svg?style=flat)](http://travis-ci.org/syzer/level-naive-bayes)
[![devDependency Status](https://david-dm.org/syzer/level-naive-bayes/dev-status.svg)](https://david-dm.org/syzer/level-naive-bayes#info=devDependencies)

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
Returns a promise of finished training, usage:

``` js
nb.trainAsync('positive', 'amazing, awesome movie!! Yeah!! Oh boy.').then(function () {
  return nb.classify('awesome, cool, amazing!! Yay.', function (err, category) {
    console.log('positive', category);
  })
})
```

### `nb.classifyAsync(text)`
Returns a promise of finished classification, usage:

```js
var thingsToDo = [
  nb.trainAsync('positive', 'Sweet, this is incredibly, amazing, perfect, great!!'),
  nb.trainAsync('positive', 'amazing, awesome movie!! Yeah!! Oh boy.'),
  nb.trainAsync('negative', 'terrible, shitty thing. Damn. Sucks!!')
];

q.all(thingsToDo)
  .then(function () {
    return nb.classifyAsync('awesome, cool, amazing!! Yay.')
  })
  .then(function (category) {
    console.log(category, 'should be positive')
  })
```

### `nb.classifyLabelsAsync(text)`
Returns a promise of finished classification, usage:

```js
var thingsToDo = [
  nb.trainAsync('positive', 'Sweet, this is incredibly, amazing, perfect, great!!'),
  nb.trainAsync('neutral', 'amazing, awesome movie!! Yeah!! Oh boy.'),
  nb.trainAsync('negative', 'terrible, shitty thing. Damn. Sucks!!')
];

q.all(thingsToDo)
  .then(() => (nb.classifyLabelsAsync('awesome, cool, amazing!! Yay.')))
  .then((labels) => {
    console.log(labels[0].label, 'should be neutral') 
    console.log(labels[0].logProb, 'should be logProbability')
    console.log(labels[1].label, 'should be second guess')
    console.log(labels[1].logProb, 'should be logProbability')
  })
```


### Tests
`npm test`

## License

MIT
