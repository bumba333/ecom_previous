import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import SubCategory from 'App/Models/SubCategory'
import Category from 'App/Models/Category' // Import the Category model

export default class SubCategorySeeder extends BaseSeeder {
  public async run() {
    // Define mock data for sub-categories
    const subCategoriesData = [
      {
        name: 'Cotton',
        categoryId: 1,
      },
      {
        name: 'Denim',
        categoryId: 2,
      },
      {
        name: 'Formal',
        categoryId: 3,
      },
      {
        name: 'Casual',
        categoryId: 1,
      },
      {
        name: 'Formal',
        categoryId: 2,
      },
      {
        name: 'Sneaker',
        categoryId: 3,
      },
      {
        name: 'Summer Dresses',
        categoryId: 4,
      },
      {
        name: 'Winter Dresses',
        categoryId: 4,
      },
      {
        name: 'Backpacks',
        categoryId: 5,
      },
      {
        name: 'Sunglasses',
        categoryId: 5,
      },
      {
        name: 'Leather',
        categoryId: 3,
      },
      {
        name: 'Sports',
        categoryId: 3,
      },
      {
        name: 'Hoodie',
        categoryId: 6,
      },
      {
        name: 'Casual Shirt',
        categoryId: 7,
      },
    ]

    // Use a loop to create and save each sub-category entry
    for (const subCategoryData of subCategoriesData) {
      const subcategory = await SubCategory.create(subCategoryData)

      // Attach the subcategory to its respective category
      const category = await Category.find(subCategoryData.categoryId)

      if (category) {
        await subcategory.related('categories').attach([category.id])
      }
    }
  }
}
