const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    default: 'user'
  },
  enabled: {
    type: Boolean,
    required: true,
    default: false
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    },
    ip: {
      type: String,
      default: null
    }
  }]
})

UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  return _.pick(userObject, ['_id', 'name', 'email', 'role', 'enabled'])
}

UserSchema.methods.generateAuthToken = function (ip) {
  const user = this
  const access = 'auth'
  const token = jwt.sign({_id: user._id.toHexString(), access, name: user.name}, process.env.JWT_SECRET).toString()

  console.log(ip)
  user.tokens.push({access, token, ip})

  return user.save().then(() => {
    return token
  })
}

UserSchema.methods.removeToken = function (token) {
  const user = this

  return user.update({
    $pull: {
      tokens: {token}
    }
  })
}

UserSchema.statics.findByToken = function (token) {
  const User = this
  let decoded = null

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
    return Promise.reject(e)
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

UserSchema.statics.findByCredentials = function (email, password) {
  const User = this

  return User.findOne({email}).then(user => {
    if (!user) { return Promise.reject(new Error(`User with email ${email} could not be found`)) }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        (res) ? resolve(user) : reject(err)
      })
    })
  })
}

UserSchema.pre('save', function (next) {
  const user = this

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

const User = mongoose.model('User', UserSchema)

module.exports = {User}
