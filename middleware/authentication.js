const { decodeJWT } = require('../utils/jwt')
const CustomError = require('../errors/index')

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token
  if (!token) {
    throw new CustomError.UnauthenticatedError('Unauthenticated user!')
  }

  try {
    const { userName, userRole, userId } = await decodeJWT(token)
    req.user = { userName, userRole, userId }
    next()
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Unauthenticated user!')
  }
}

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userRole)) {
      throw new CustomError.UnAuthorizedError(
        'you are not authorized to access this route'
      )
    }
    next()
  }
}

module.exports = { authenticateUser, authorizePermission }
