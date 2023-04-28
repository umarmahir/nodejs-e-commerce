const CustomError = require('../errors/index')
const checkPermission = (authObj, dbId) => {
  if (authObj.role === 'admin') return
  if (authObj.userId === dbId.toString()) return

  throw new CustomError.UnAuthorizedError(
    'You are not permitted to access this route'
  )
}

module.exports = checkPermission
