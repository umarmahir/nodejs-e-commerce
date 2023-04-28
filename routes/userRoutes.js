const express = require('express')
const router = express.Router()
const {
  authenticateUser,
  authorizePermission,
} = require('../middleware/authentication')

const {
  updateUser,
  updateUserPassword,
  getAllUsers,
  getSingleUser,
  showCurrentUser,
} = require('../controllers/userController')

router
  .route('/')
  .get(
    authenticateUser,
    authorizePermission('admin', 'staff', 'owner'),
    getAllUsers
  )

router.route('/showCurrentUser').get(authenticateUser, showCurrentUser)
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword)
router.route('/updateUser').patch(authenticateUser, updateUser)
router.route('/:id').get(getSingleUser)

module.exports = router
