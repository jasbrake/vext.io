const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const {app} = require('../server')
const {User} = require('../db/models/User')
const {users, populateUsers} = require('./seed/seed')

beforeEach(populateUsers)

describe('GET /api/users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/api/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done)
  })

  it('should return 401 if not authenticated', done => {
    request(app)
      .get('/api/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({})
      })
      .end(done)
  })
})

describe('POST /api/users', () => {
  it('should create a user', done => {
    const name = 'unique'
    const email = 'unique@example.com'
    const password = 'testpassworddddd'

    request(app)
      .post('/api/users')
      .send({name, email, password})
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy()
        expect(res.body._id).toBeTruthy()
        expect(res.body.name).toBe(name)
        expect(res.body.email).toBe(email)
      })
      .end(err => {
        if (err) { return done(err) }

        User.findOne({email}).then(user => {
          expect(user).toBeTruthy()
          expect(user.password).not.toBe(password)
          done()
        }).catch(e => done(e))
      })
  })

  it('should return validation errors if request invalid', done => {
    request(app)
      .post('/api/users')
      .send({email: 'blahblah', password: 'what'})
      .expect(400)
      .end(done)
  })

  it('should not create user if email in use', done => {
    request(app)
      .post('/api/users')
      .send({email: users[0].email, password: users[0].password})
      .expect(400)
      .end(done)
  })
})

describe('POST /api/user/login', () => {
  it('should login user and return auth token', done => {
    request(app)
      .post('/api/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.header['x-auth']).toBeTruthy()
      })
      .end((err, res) => {
        if (err) { return done(err) }

        User.findById(users[1]._id).then(user => {
          expect(user.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          })
          done()
        }).catch(e => done(e))
      })
  })

  it('should reject invalid login', done => {
    request(app)
      .post('/api/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect(res => {
        expect(res.header['x-auth']).toBeFalsy()
      })
      .end((err, res) => {
        if (err) { return done(err) }

        User.findById(users[1]._id).then(user => {
          expect(user.tokens.length).toBe(1)
          done()
        }).catch(e => done(e))
      })
  })
})

describe('DELETE /api/users/me/token', () => {
  it('should remove auth token on logout', done => {
    request(app)
      .delete('/api/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) { return done(err) }

        User.findById(users[0]._id).then(user => {
          expect(user.tokens.length).toBe(0)
          done()
        }).catch(e => done(e))
      })
  })
})
