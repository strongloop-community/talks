process.env.NODE_ENV = 'test';
require('should');
var app = require('../app.js'), 
    request = require('supertest'), 
    mongoose = require('mongoose'), 
    _u = require('underscore');
    assert = require('assert');

var json = JSON.stringify;

before(function onBefore(done) {
    var connection = mongoose.connection;
    connection.on('open', function () {
        connection.db.dropDatabase(function () {
            console.log('dropped database [' + connection.name + ']');
            done();
        });
    });
});

describe('rest', function () {
    describe('GET /rest/users', function () {
        it('should return empty list', function (done) {
            request(app).get('/rest/users')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err)
                        console.log('ERROR', arguments);

                    res.should.have.property('body');
                    res.body.should.be.an.instanceOf(Array);
                    res.body.should.have.length(0);

                    done();
                });
        });

    });
});