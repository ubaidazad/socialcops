// set NODE_ENV to test to disable logging while testing.
process.env.NODE_ENV = 'test';

import chai = require('chai');
import chaiHttp = require('chai-http');
const app = require('../src/index').app;
const server = require('../src').server;

const expect = chai.expect;

chai.use(chaiHttp);

describe('ROUTES', () => {

    describe('POST /api/authenticate', () => {
        it('should return success as false when either username and password is not present', (done) => {
            chai.request(server).post('/api/authenticate')
                .send({
                    username: 'abc',
                })
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.success).to.equal(false);
                    done();
                })
        });

        it('should return a auth token when both username and password is present', (done) => {
            chai.request(server).post('/api/authenticate')
                .send({
                    username: 'abc',
                    password: 'pass'
                })
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.success).to.equal(true);
                    done();
                })
        });
    });

    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFiYyIsImlhdCI6MTUxNDAyNjE5MX0.bNjG6tF0AwTccO69BolvLYfYyGLyaxUFi_7J36T31Pc';

    describe('PATCH /api/jsonpatch', () => {
        it('should return success as false when either doc or path is not present', (done) => {
            chai.request(server).patch('/api/jsonpatch')
                .set('x-access-token', token)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.success).to.equal(false);
                    done();
                })
        });
    });


    describe('POST /api/thumbnail', () => {
        it('should return 403 forbidden when x-access-token header is not present', (done) => {
            chai.request(server).post('/api/thumbnail')
                .send({
                    imageUrl: ''
                })
                .end((err, res) => {
                    expect(res.status).to.equal(403);
                    expect(res.body.success).to.equal(false);
                    done();
                })
        });

        it('should return 403 when wrong access token is present', (done) => {
            chai.request(server).post('/api/thumbnail')
                .set('x-access-token', 'hello')
                .send({
                    imageUrl: ''
                })
                .end((err, res) => {
                    expect(res.status).to.equal(403);
                    expect(res.body.success).to.equal(false);
                    done();
                })
        });

        it('should return success as false when imageUrl is wrong', (done) => {
            chai.request(server).post('/api/thumbnail')
                .set('x-access-token', token)
                .send({
                    imageUrl: ''
                })
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.success).to.equal(false);
                    done();
                })
        });

        it('should return success as true when imageUrl is correct', (done) => {
            const uri = 'http://www.1stopdesign.com/wp-content/uploads/2017/07/photo.jpg';
            chai.request(server).post('/api/thumbnail')
                .set('x-access-token', token)
                .send({
                    imageUrl: uri
                })
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.text).to.equal('images\\aHR0cDovL3d3dy4xc3RvcGRlc2lnbi5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMTcvMDcvcGhvdG8uanBn.jpg')
                    done();
                })
        });

        it('should return success as false when imageUrl is wrong', (done) => {
            const uri = 'http://www.1stopdesign.com/wp-content/photo.jpg';
            chai.request(server).post('/api/thumbnail')
                .set('x-access-token', token)
                .send({
                    imageUrl: uri
                })
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.success).to.equal(false)
                    done();
                });
        });
    })

});
