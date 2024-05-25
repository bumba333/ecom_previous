import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Category from 'App/Models/Category'

export default class CategorySeeder extends BaseSeeder {
  public async run() {
    // Define mock data for categories
    const categoriesData = [
      {
        name: 'T Shirt',
        slug: 't-shirt',
      },
      {
        name: 'Jeans',
        slug: 'jeans',
      },
      {
        name: 'Shoes',
        slug: 'shoes',
      },
      {
        name: 'Dresses',
        slug: 'dresses',
      },
      {
        name: 'Accessories',
        slug: 'accessories',
      },
      {
        name: 'Winter Wear',
        slug: 'winter-wear',
      },
      {
        name: 'Shirt',
        slug: 'shirt',
      },
    ]

    // Use a loop to create and save each category entry
    for (const categoryData of categoriesData) {
      await Category.create(categoryData)
    }
  }
}
