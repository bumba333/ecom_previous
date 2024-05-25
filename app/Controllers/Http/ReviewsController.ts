'use strict'
import Order from 'App/Models/Order'
import Product from 'App/Models/Product'
import Review from 'App/Models/Review'

export default class ReviewController {
  public async store({ request, response, auth }) {
    const user = auth.user
    const { productId, title, content, rating } = request.only([
      'productId',
      'title',
      'content',
      'rating',
    ])

    // Check if the user has a valid order history for the product
    const hasPurchased = await this.userHasPurchasedProduct(user.id, productId)

    if (!hasPurchased) {
      return response.status(403).json({
        status: 'error',
        message: 'You can only review products you have purchased.',
      })
    }

    const review = new Review()
    review.userId = user.id
    review.productId = productId
    review.title = title
    review.content = content
    review.rating = rating

    await review.save()

    return response.status(201).json({
      status: 'success',
      message: 'Review created',
      data: review,
    })
  }

  private async userHasPurchasedProduct(userId, productId) {
    // Here, you should query the database to check if the user has purchased the product.
    // You can do this by looking for orders associated with the user and containing the product.
    // If an order is found, it means the user has purchased the product.
    // You should implement this function based on your data model.

    const order = await Order.query()
      .where('user_id', userId)
      .whereHas('orderItems', (query) => {
        query.where('product_id', productId)
      })
      .first()

    return !!order
  }

  public async update({ request, response, params }) {
    const { rating, title, content } = request.only(['rating', 'title', 'content'])
    const reviewId = params.reviewId

    const review = await Review.findOrFail(reviewId)

    if (rating) {
      review.rating = rating
    }
    if (content) {
      review.content = content
    }
    if (title) {
      review.title = title
    }

    await review.save()

    return response.status(200).json({
      status: 'success',
      message: 'Review updated successfully',
      data: review,
    })
  }

  public async destroy({ response, params }) {
    const reviewId = params.reviewId

    const review = await Review.findOrFail(reviewId)
    await review.delete()

    return response.status(204)
  }

  public async index({ response, params }) {
    const productId = params.productId

    const product = await Product.findOrFail(productId)
    const reviews = await product.related('reviews').query().preload('user')

    return response.status(200).json({
      status: 'success',
      data: reviews,
    })
  }

  public async show({ params, response }) {
    const review = await Review.find(params.id)

    if (!review) {
      return response.status(404).json({
        status: 'failure',
        message: 'Review not found',
      })
    }

    return response.json({
      status: 'success',
      data: review,
    })
  }

  public async getAverageScore({ response, params }) {
    const productId = params.productId
    // eslint-disable-next-line no-debugger
    debugger
    const product = await Product.findOrFail(productId)
    const result = await product.getAverageReviewScore(productId)
    const averageScore = result?.averageScore
    const totalReviews = result?.totalReviews
    return response.status(200).json({
      status: 'success',
      data: {
        averageScore: averageScore || 0,
        totalReviews: totalReviews,
      },
    })
  }
}

module.exports = ReviewController
