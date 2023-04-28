const { StatusCodes } = require('http-status-codes')
const Order = require('../models/Order')
const Product = require('../models/Product')

const checkPermission = require('../utils/checkPermission')
const CustomError = require('../errors/index')

const createOrder = async (req, res) => {
  const { tax, shippingFee, items: cartItems } = req.body
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('cart items can not be empty')
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError('please provide tax and shipping fee')
  }

  let orderItems = []
  let subtotal = 0

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product })
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `product with id: ${item.product} not found!`
      )
    }

    const { image, name, price } = dbProduct
    subtotal += item.amount * price
    console.log(subtotal)
    const singleOrderItem = {
      image,
      name,
      price,
      amount: item.amount,
      product: dbProduct._id,
    }
    orderItems = [...orderItems, singleOrderItem]
  }

  const total = subtotal + shippingFee + tax
  const order = await Order.create({
    tax,
    shippingFee,
    subtotal,
    total,
    user: req.user.userId,
    orderItems,
  })

  res.status(StatusCodes.OK).json({ order, test: order.tax })
}

const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
  res.status(StatusCodes.OK).json({ orders })
}

const getSingleOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id })
  res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId })
  res.status(StatusCodes.OK).json({ orders })
}

const updateOrder = async (req, res) => {
  const { paymentIntentId } = req.body
  const order = await Order.findOne({ _id: req.params.id })
  checkPermission(req.user, order.user)
  order.status = 'delivered'
  order.paymentIntentId = paymentIntentId
  await order.save()
  res.status(StatusCodes.OK).send('Order updated')
}

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
}
