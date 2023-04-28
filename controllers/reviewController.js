const Review = require('../models/Review')
const Product = require('../models/Product')
const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const { authorizePermissions } = require('../middleware/authentication')
const { checkPermission } = require('../utils/checkPermission')

const createReview = async (req, res) => {
  const { product: productId } = req.body
  if (!productId) {
    throw new CustomError.BadRequestError('Please provide product ID')
  }
  const isProductPresent = await Product.findOne({ _id: productId })
  if (!isProductPresent) {
    throw new CustomError.NotFoundError(
      `Product with Id: ${productId} does not exist`
    )
  }

  const alreadyMadeAReview = await Review.find({
    product: productId,
    user: req.user.userId,
  })

  if (alreadyMadeAReview.length > 0) {
    throw new CustomError.BadRequestError(
      'Sorry, you have already left a review for this product'
    )
  }

  req.body.user = req.user.userId
  const review = await Review.create(req.body)

  res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
  res.status(StatusCodes.OK).json({ reviews })
}

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })
    .populate({ path: 'user', select: 'name role' })
    .populate({ path: 'product', select: 'name price company' })
  res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })
  if (!review) {
    throw new CustomError.NotFoundError('Review does not exist')
  }
  checkPermission(req.user, review.user)

  const { title, comment, rating } = req.body
  if (title) {
    review.title = title
  }
  if (comment) {
    review.comment = comment
  }
  if (rating) {
    review.rating = rating
  }
  await review.save()
  res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })
  if (!review) {
    throw new CustomError.NotFoundError('Review does not exist')
  }
  checkPermission(req.user, review.user)
  await review.remove()
  res.status(StatusCodes.OK).json({ msg: 'Review deleted successfully' })
}

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
}
