var memdb = require('memdb')
var tape = require('tape')
var bayes = require('./../')
var q = require('bluebird')

tape('postive / negative', function (t) {
  var nb = bayes(memdb())

  nb.train('positive', 'amazing, awesome movie!! Yeah!! Oh boy.', function (err) {
    t.notOk(err, 'no err')
    nb.train('positive', 'Sweet, this is incredibly, amazing, perfect, great!!', function (err) {
      t.notOk(err, 'no err')
      nb.train('negative', 'terrible, shitty thing. Damn. Sucks!!', function (err) {
        t.notOk(err, 'no err')
        nb.classify('awesome, cool, amazing!! Yay.', function (err, category) {
          t.same(category, 'positive', 'should be positive')
          t.end()
        })
      })
    })
  })
})

tape('spam / not spam', function (t) {
  var nb = bayes(memdb())

  nb.train('spam', 'Great viagra for you!', function (err) {
    t.notOk(err, 'no err')
    nb.train('not spam', 'UTOSC is the best conference ever!', function (err) {
      t.notOk(err, 'no err')
      nb.train('not spam', 'Some more strings that are not spam!', function (err) {
        t.notOk(err, 'no err')
        nb.classify('Great opportunity in Nigeria!', function (err, category) {
          t.same(category, 'spam', 'should be spam')
          t.end()
        })
      })
    })
  })
})

tape('train with promise', function (t) {
  var nb = bayes(memdb())

  nb.trainAsync('positive', 'amazing, awesome movie!! Yeah!! Oh boy.')
    .then(function () {
      return nb.trainAsync('positive', 'Sweet, this is incredibly, amazing, perfect, great!!')
    })
    .then(function () {
      return nb.trainAsync('negative', 'terrible, shitty thing. Damn. Sucks!!');
    })
    .then(function () {
      return nb.classify('awesome, cool, amazing!! Yay.', function (err, category) {
        t.same('positive', category, 'should be positive')
        t.end()
      })
    })
})

tape('que all train promises', function (t) {
  var nb = bayes(memdb())

  var thingsToDo = [
    nb.trainAsync('positive', 'Sweet, this is incredibly, amazing, perfect, great!!'),
    nb.trainAsync('positive', 'amazing, awesome movie!! Yeah!! Oh boy.'),
    nb.trainAsync('negative', 'terrible, shitty thing. Damn. Sucks!!')
  ];

  q.all(thingsToDo).then(function () {
    return nb.classify('awesome, cool, amazing!! Yay.', function (err, category) {
      t.same('positive', category, 'should be positive')
      t.end()
    })
  })
})

tape('classify can be used as promise', function (t) {
  var nb = bayes(memdb())

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
      t.same('positive', category, 'should be positive')
      t.end()
    })
})

tape('classifyLabels with three labels', function (t) {
  var nb = bayes(memdb())

  nb.train('spam', 'Great viagra for you!', function (err) {
    t.notOk(err, 'no err')
    nb.train('not spam', 'UTOSC is the best conference ever!', function (err) {
      t.notOk(err, 'no err')
      nb.train('dont know', 'It might be good opportunity.', function (err) {
        t.notOk(err, 'no err')
        nb.train('not spam', 'Some more strings that are not spam!', function (err) {
          t.notOk(err, 'no err')
          nb.classifyLabels('Great opportunity in Nigeria!', function (err, categories) {
            t.same(categories[0].label, 'spam', 'should be spam')
            t.same(categories[1].label, 'dont know', 'dont know is second guess')
            t.same(categories[2].label, 'not spam', 'last possible guess')
            t.end()
          })
        })
      })
    })
  })
})

tape('classifyLabels with promises', testClasifyLabels)

function testClasifyLabels(t) {
  var nb = bayes(memdb())

  var thingsToDo = [
    nb.trainAsync('positive', 'Sweet, this is incredibly, amazing, perfect, great!!'),
    nb.trainAsync('neutral', 'Additionally, the cost of computing the addition can be avoided in some situations'),
    nb.trainAsync('neutral', 'many applications a multiplication of probabilities'),
    nb.trainAsync('positive', 'amazing, awesome movie!! Yeah!! Oh boy.'),
    nb.trainAsync('negative', 'terrible, shitty thing. Damn. Sucks!!'),
    nb.trainAsync('neutral', 'probabilities in this way has two main advantages')
  ];

  q.all(thingsToDo)
    .then(() => {
      return nb.classifyLabelsAsync('awesome, cool, amazing!! Yay.')
    })
    .then(labels => t.same('positive', labels[0].label, 'should be positive'))
    .then(() => nb.classifyLabelsAsync('probabilities are this gives a lower bound'))
    .then(labels => {
      t.same('neutral', labels[0].label, 'should be neutral')
      t.same('number', typeof labels[0].logProb, 'should be Number')
      t.end()
    })
}