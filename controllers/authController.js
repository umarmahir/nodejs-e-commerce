const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { createJWT, decodeJWT } = require('../utils/jwt')
const CustomError = require('../errors/index')

const register = async (req, res) => {
  const { name, email, password } = req.body

  const isFirst = (await User.countDocuments({})) == 0
  const role = isFirst ? 'admin' : 'user'

  const user = await User.create({ name, email, password, role })

  const userInfo = {
    userName: user.name,
    userRole: user.role,
    userId: user._id,
  }
  const token = await createJWT(userInfo)
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  })
  res.status(StatusCodes.CREATED).json({ user, token })
}

const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide credentials')
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new CustomError.UnauthenticatedError('invalid credentials')
  }
  const isPasswordMatch = await user.comparePassword(password)
  if (!isPasswordMatch) {
    throw new CustomError.UnauthenticatedError('invalid credentials')
  }

  const userInfo = {
    userName: user.name,
    userRole: user.role,
    userId: user._id,
  }
  const token = await createJWT(userInfo)

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  })
  res.status(StatusCodes.CREATED).json({ user, token })
}

const logout = async (req, res) => {
  res.cookie('token', 'log out', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })

  res.send('Logged out successfully')
}

module.exports = { register, login, logout }
