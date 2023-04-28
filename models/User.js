const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide name'],
    minLength: 3,
  },
  email: {
    type: String,
    unique: [true, 'this email is already taken, please choose another'],
    required: [true, 'please provide email'],
    validate: {
      validator: validator.isEmail,
    },
    // match: [
    //   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    //   'Please provide a valid email',
    // ],  ALTERNATIVE match for email
  },
  password: {
    type: String,
    required: [true, 'please provide password'],
    minLength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

UserSchema.pre('save', async function () {
  const isPasswordModified = this.isModified('password')
  if (!isPasswordModified) return
  const hash = await bcrypt.genSalt(10)
  const crypted = await bcrypt.hash(this.password, hash)
  this.password = crypted
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)
