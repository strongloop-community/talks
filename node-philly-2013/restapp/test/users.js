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

    var id;
    describe('POST /rest/users', function () {
        it('should create a new user and return it', function (done) {
            request(app)
                .post('/rest/users')
                .set('Content-Type', 'application/json')
                .send(json({
                    username: 'mattpardee',
                    first_name: 'Matt',
                    last_name: 'Pardee',
                    email: 'matt@strongloop.com',
                    password: 'strongstrong'
            })).expect(200).end(function (err, res) {
                    if (err)
                        console.log('ERROR', arguments);

                    res.should.have.property('body');
                    res.body.should.have.property('username', 'mattpardee');
                    res.body.should.have.property('first_name', 'Matt');
                    res.body.should.have.property('last_name', 'Pardee');
                    res.body.should.have.property('email', 'matt@strongloop.com');
                    id = res.body._id;
                    done();
                });
        });
    });
});