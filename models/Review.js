const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxlength: [100, 'Review title should not exceed 100 characters'],
      required: [true, 'Please provide review title'],
      trim: true,
    },
    comment: {
      type: String,
      maxlength: [1000, 'Review comment should not exceed 1000 characters'],
      required: [true, 'Please provide review'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
)

ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

ReviewSchema.statics.createAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        numOfReviews: {
          $sum: 1,
        },
        averageRating: {
          $avg: '$rating',
        },
      },
    },
  ])

  try {
    await this.model('Product').findOneAndUpdate(
      { _id: productId },
      {
        averageRating: result[0]?.averageRating || 0,
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    )
  } catch (error) {
    console.log(error)
  }
}

ReviewSchema.post('remove', async function () {
  await this.constructor.createAverageRating(this.product)
})

ReviewSchema.post('save', async function () {
  await this.constructor.createAverageRating(this.product)
})

module.exports = mongoose.model('Review', ReviewSchema)
