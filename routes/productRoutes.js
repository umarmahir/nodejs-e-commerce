const express = require('express')
const router = express.Router()
const {
  authenticateUser,
  authorizePermission,
} = require('../middleware/authentication')

const {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  uploadImage,
  getSingleProductReviews,
} = require('../controllers/productController')

router
  .route('/')
  .get(getAllProducts)
  .post(authenticateUser, authorizePermission('admin'), createProduct)
router
  .route('/uploadImage')
  .post(authenticateUser, authorizePermission('admin'), uploadImage)
router
  .route('/:id')
  .get(getSingleProduct)
  .delete(authenticateUser, authorizePermission('admin'), deleteProduct)
  .patch(authenticateUser, authorizePermission('admin'), updateProduct)
router.route('/:id/reviews').get(getSingleProductReviews)

module.exports = router
