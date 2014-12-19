/**
 * Created by syzer on 12/19/2014.
 */
var assert = require("assert");
var bayes = require('./../index.js');
var nb = bayes(require('memdb')());

describe('cb', function () {
    describe('cb train', function () {
        it('returns positive on positive category', function (done) {
            nb.train('positive', 'amazing, awesome movie!! Yeah!! Oh boy.', function () {
                nb.train('positive', 'Sweet, this is incredibly, amazing, perfect, great!!', function () {
                    nb.train('negative', 'terrible, shitty thing. Damn. Sucks!!', function () {
                        nb.classify('awesome, cool, amazing!! Yay.', function (err, category) {
                            assert.equal('positive', category);
                            done();
                        })
                    })
                })
            });
        })
    })
});
