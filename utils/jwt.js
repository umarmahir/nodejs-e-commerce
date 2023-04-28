const jwt = require('jsonwebtoken')
const CustomError = require('../errors/index')

const createJWT = async (payload) => {
  return await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })
}

const decodeJWT = async (token) => {
  return await jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = {
  createJWT,
  decodeJWT,
}
