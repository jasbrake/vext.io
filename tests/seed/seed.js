const {ObjectID} = require('mongodb')
const jwt = require('jsonwebtoken')

const {User} = require('../../db/models/User')

const userOneId = new ObjectID()
const userTwoId = new ObjectID()

const users = [
  {
    _id: userOneId,
    name: 'test1',
    email: 'test1@example.com',
    password: 'test1password',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }],
    enabled: true
  },
  {
    _id: userTwoId,
    name: 'test2',
    email: 'test2@example.com',
    password: 'test2password',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }],
    enabled: false
  }
]

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const userOne = new User(users[0]).save()
    const userTwo = new User(users[1]).save()

    return Promise.all([userOne, userTwo])
  }).then(() => done())
}

module.exports = {users, populateUsers}