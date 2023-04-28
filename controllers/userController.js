const { StatusCodes } = require('http-status-codes')
const User = require('../models/User')
const CustomError = require('../errors/index')

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password')
  if (!users) {
    res.status(StatusCodes.OK).send('No users yet')
  }
  res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password')
  if (!user) {
    throw new CustomError.NotFoundError(
      `User with id: ${req.params.id} not found`
    )
  }
  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user })
}

const updateUser = async (req, res) => {
  const { email, name } = req.body
  const { userId } = req.user

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { email: email, name: name },
    { new: true, runValidators: true }
  )
  const userInfo = {
    userRole: user.role,
    userId: user._id,
    userName: user.name,
  }
  const token = await createJWT(userInfo)
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  })
  res.status(StatusCodes.OK).json({ user })
}

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide all details')
  }

  const { userId } = req.user

  const user = await User.findOne({ _id: userId })
  const isPasswordMatch = user.comparePassword(oldPassword)
  if (!isPasswordMatch) {
    throw new CustomError.UnauthenticatedError(
      'Please provide valid credentials'
    )
  }
  user.password = newPassword
  await user.save()

  res.status(StatusCodes.OK).json({ msg: 'Password updated!' })
}

module.exports = {
  updateUser,
  updateUserPassword,
  getAllUsers,
  getSingleUser,
  showCurrentUser,
}
