const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      maxlength: [50, 'Product length should not exceed 50 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
    },
    company: {
      type: String,
      required: [true, 'Please provide product company'],
      maxlength: [50, 'Product company should not exceed 50 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: {
        values: ['office', 'kitchen', 'bedroom'],
        message: '{VALUE} is not in the specified categories',
      },
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [50, 'Product description should not exceed 100 characters'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '/uploads/example.jpg',
    },
    inventory: {
      type: Number,
      default: 10,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    colors: {
      type: [String],
      default: ['255'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

productSchema.pre('remove', async function () {
  await this.model('Review').deleteMany({ product: this._id })
})

module.exports = mongoose.model('Product', productSchema)
