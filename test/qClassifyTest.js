/**
 * Created by syzer on 12/19/2014.
 */
var assert = require("assert");
var bayes = require('./../index.js');
var nb = bayes(require('memdb')());
var q = require('q');

describe('train with promise', function () {
    it('returns positive on positive category', function (done) {
        nb.trainAsync('positive', 'amazing, awesome movie!! Yeah!! Oh boy.')
            .then(function () {
                return nb.trainAsync('positive', 'Sweet, this is incredibly, amazing, perfect, great!!')
            })
            .then(function () {
                return nb.trainAsync('negative', 'terrible, shitty thing. Damn. Sucks!!');
            })
            .then(function () {
                return nb.classify('awesome, cool, amazing!! Yay.', function (err, category) {
                    assert.equal('positive', category);
                    done();
                })
            })
    });

    it('can que all asynchronous code', function (done) {
        var thingsToDo = [
            nb.trainAsync('positive', 'Sweet, this is incredibly, amazing, perfect, great!!'),
            nb.trainAsync('positive', 'amazing, awesome movie!! Yeah!! Oh boy.'),
            nb.trainAsync('negative', 'terrible, shitty thing. Damn. Sucks!!')
        ];

        q.all(thingsToDo).then(function() {
            return nb.classify('awesome, cool, amazing!! Yay.', function (err, category) {
                assert.equal('positive', category);
                done();
            })
        })
    });

});
