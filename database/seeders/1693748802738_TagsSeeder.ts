import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Tag from 'App/Models/Tag'
import Product from 'App/Models/Product'

export default class TagSeeder extends BaseSeeder {
  public async run() {
    // Define tags data
    const tagsData = [
      { name: 'Holi' },
      { name: 'Summer Sale' },
      { name: 'New Arrival' },
      { name: 'Fashion' },
      { name: 'Electronics' },
      { name: 'Home Decor' },
      { name: 'Fitness' },
      { name: 'Books' },
      { name: 'Travel' },
      { name: 'Outdoor' },
    ]

    // Create tags and fetch their IDs
    const createdTags = await Tag.createMany(tagsData)
    const tagIds = createdTags.map((tag) => tag.id)

    // Fetch all products
    const products = await Product.all()

    // Attach tags to products
    for (const product of products) {
      // Randomly select a subset of tag IDs to attach to each product
      const randomTagIds = this.shuffleArray(tagIds).slice(
        0,
        Math.floor(Math.random() * tagIds.length)
      )

      // Attach tags to the product using the pivot table 'product_tag'
      await product.related('tags').attach(randomTagIds)
    }
  }

  // Shuffle an array (Fisher-Yates algorithm)
  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
}
