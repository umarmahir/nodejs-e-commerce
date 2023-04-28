const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const Product = require('../models/Product')
const path = require('path')
const Review = require('../models/Review')

const createProduct = async (req, res) => {
  const userId = req.user.userId
  req.body.user = userId

  const product = await Product.create(req.body)
  res.status(StatusCodes.CREATED).json({ product })
}

const getAllProducts = async (req, res) => {
  const products = await Product.find({})
  res.status(StatusCodes.OK).json({ products })
}

const getSingleProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id })
  res.status(StatusCodes.OK).json({ product })
}

const updateProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  )
  res.status(StatusCodes.OK).json({ product })
}

const deleteProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id })
  await product.remove()
  res
    .status(StatusCodes.OK)
    .json({ msg: `Product with id: ${req.params.id} deleted` })
}

const uploadImage = async (req, res) => {
  const theImage = req.files.image
  if (!theImage) {
    throw new CustomError.BadRequestError('Please select a file')
  }
  if (!theImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please select an image file')
  }

  const imagePath = path.join(__dirname, '../uploads/' + theImage.name)
  await theImage.mv(imagePath)

  res.status(StatusCodes.OK).json({ msg: `/uploads/${theImage.name} uploaded` })
}

const getSingleProductReviews = async (req, res) => {
  const productId = req.params.id

  const reviews = await Review.find({ product: productId })
  res.status(StatusCodes.OK).json({ reviews })
}

module.exports = {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  uploadImage,
  getSingleProductReviews,
}
