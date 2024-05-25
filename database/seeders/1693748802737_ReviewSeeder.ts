import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Review from 'App/Models/Review'
import Product from 'App/Models/Product'
import { DateTime } from 'luxon'

export default class ReviewSeeder extends BaseSeeder {
  public async run() {
    // Generate 20 mock reviews
    const reviewsData = [
      { userId: 1, productId: 1, content: 'Quality awesome', rating: 5 },
      { userId: 2, productId: 1, content: 'Great product!', rating: 4 },
      { userId: 3, productId: 2, content: 'Good value for money', rating: 4 },
      { userId: 4, productId: 2, content: 'Could be better', rating: 3 },
      // Add more reviews...
    ]

    for (const reviewData of reviewsData) {
      // Check if the product with the specified ID exists
      const product = await Product.find(reviewData.productId)

      if (!product) {
        console.log(
          `Product with ID ${reviewData.productId} does not exist. Skipping review creation.`
        )
        continue
      }

      // Create the review and set created_at to a random date within the last 30 days
      const createdReview = await Review.create(reviewData)
      const randomDaysAgo = Math.floor(Math.random() * 30)
      createdReview.createdAt = DateTime.now().minus({ days: randomDaysAgo })
      await createdReview.save()
    }
  }
}
