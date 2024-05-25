import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Product from 'App/Models/Product'
import Variation from 'App/Models/ProductVariation'
import Category from 'App/Models/Category'
import SubCategory from 'App/Models/SubCategory'

export default class ProductSeeder extends BaseSeeder {
  public async run() {
    // Define mock data for products
    const productsData = [
      {
        userId: 1,
        title: 'Casual Shirt',
        description:
          'Elevate your style with this classic casual shirt, perfect for special occasions.',
        shortDescription: 'Classic casual shirt',
        brandId: 1,
        featured: true,
        meta_title: 'Classic Casual Shirt - Perfect for Special Occasions',
        meta_description:
          'Elevate your style with this classic casual shirt, ideal for special events.',
      },
      {
        userId: 1,
        title: 'Casual T-Shirt',
        description:
          'Stay comfortable and stylish in this versatile casual t-shirt, ideal for everyday wear.',
        shortDescription: 'Versatile casual tee',
        brandId: 2,
        featured: true,
        meta_title: 'Versatile Casual T-Shirt - Stylish Everyday Wear',
        meta_description:
          'Stay comfortable and stylish in this versatile casual t-shirt, perfect for daily wear.',
      },
      {
        userId: 1,
        title: 'Cotton T-Shirt',
        description:
          'Stay comfortable and stylish in this versatile cotton t-shirt, ideal for everyday wear.',
        shortDescription: 'Versatile cotton tee',
        brandId: 2,
        featured: true,
        meta_title: 'Versatile Cotton T-Shirt - Stylish Everyday Wear',
        meta_description:
          'Stay comfortable and stylish in this versatile cotton t-shirt, perfect for daily wear.',
      },
      {
        userId: 1,
        title: 'Denim Jeans',
        description:
          'Experience the perfect blend of style and comfort with these classic denim jeans.',
        shortDescription: 'Classic denim jeans',
        brandId: 1,
        featured: true,
        meta_title: 'Classic Denim Jeans - Style and Comfort Combined',
        meta_description:
          'Experience the perfect blend of style and comfort with these classic denim jeans.',
      },
      {
        userId: 1,
        title: 'Running Shoes',
        description: 'Achieve your fitness goals with these lightweight and durable running shoes.',
        shortDescription: 'Lightweight running shoes',
        brandId: 3,
        meta_title: 'Lightweight Running Shoes - Perfect for Fitness Goals',
        meta_description:
          'Achieve your fitness goals with these lightweight and durable running shoes.',
      },
      {
        userId: 1,
        title: 'Leather Shoes',
        description: 'Achieve your fitness goals with these lightweight and durable leather shoes.',
        shortDescription: 'Lightweight leather shoes',
        brandId: 4,
        meta_title: 'Lightweight Leather Shoes - Perfect for Fitness Goals',
        meta_description:
          'Achieve your fitness goals with these lightweight and durable leather shoes.',
      },
      {
        userId: 1,
        title: 'Sneaker Shoes',
        description: 'Achieve your fitness goals with these lightweight and durable sneaker shoes.',
        shortDescription: 'Lightweight sneaker shoes',
        brandId: 1,
        meta_title: 'Lightweight Sneaker Shoes - Perfect for Fitness Goals',
        meta_description:
          'Achieve your fitness goals with these lightweight and durable sneaker shoes.',
      },
      {
        userId: 1,
        title: 'Sunglasses',
        description:
          'Protect your eyes from harmful UV rays in style with these fashionable sunglasses.',
        shortDescription: 'Stylish UV protection',
        brandId: 4,
        meta_title: 'Stylish Sunglasses - UV Protection with Fashion',
        meta_description:
          'Protect your eyes from harmful UV rays in style with these fashionable sunglasses.',
      },
      {
        userId: 1,
        title: 'Backpack',
        description:
          'Carry your essentials in this spacious and stylish backpack, perfect for daily use.',
        shortDescription: 'Stylish daily backpack',
        brandId: 5,
        meta_title: 'Stylish Daily Backpack - Carry Your Essentials in Style',
        meta_description:
          'Carry your essentials in this spacious and stylish backpack, perfect for daily use.',
      },
      {
        userId: 1,
        title: 'Hoodie',
        description:
          'Stay warm and cozy with this comfortable hoodie, a must-have for chilly days.',
        shortDescription: 'Warm and cozy hoodie',
        brandId: 2,
        meta_title: 'Warm and Cozy Hoodie - Perfect for Chilly Days',
        meta_description:
          'Stay warm and cozy with this comfortable hoodie, a must-have for chilly days.',
      },
      {
        userId: 1,
        title: 'Formal Shoes',
        description: 'Complete your formal look with these classic designed formal shoes.',
        shortDescription: 'Classic formal shoes',
        brandId: 1,
        meta_title: 'Classic Formal Shoes - Complete Your Formal Look',
        meta_description: 'Complete your formal look with these classic designed formal shoes.',
      },
    ]

    for (const productData of productsData) {
      const product = await Product.create(productData)

      // Attach categories
      const categories = await Category.query().whereIn('id', [1, 2, 3, 4, 5]).exec()

      const categoryIds = categories.map((category) => category.id)

      // Get existing category associations
      const existingCategories = await product.related('categories').query().exec()

      // Extract the IDs from existing associations
      const existingCategoryIds = existingCategories.map((category) => category.id)

      // Attach only the new category associations
      const newCategoryIds = categoryIds.filter(
        (categoryId) => !existingCategoryIds.includes(categoryId)
      )

      await product.related('categories').attach(newCategoryIds)

      // Attach subcategories
      const subcategories = await SubCategory.query().whereIn('id', [1, 2, 3, 4, 5]).exec()

      const subcategoryIds = subcategories.map((subcategory) => subcategory.id)

      // Get existing subcategory associations
      const existingSubcategories = await product.related('subcategories').query().exec()

      // Extract the IDs from existing associations
      const existingSubcategoryIds = existingSubcategories.map((subcategory) => subcategory.id)

      // Attach only the new subcategory associations
      const newSubcategoryIds = subcategoryIds.filter(
        (subcategoryId) => !existingSubcategoryIds.includes(subcategoryId)
      )

      await product.related('subcategories').attach(newSubcategoryIds)

      // Define variations data
      const variationsData = [
        {
          size: 'S',
          color: 'Blue',
          price: 80,
          salePrice: 75,
        },
        {
          size: 'M',
          color: 'Red',
          price: 90,
          salePrice: 85,
        },
        {
          size: 'L',
          color: 'Green',
          price: 110,
          salePrice: 100,
        },
        {
          size: 'XL',
          color: 'Yellow',
          price: 120,
          salePrice: 110,
        },
        {
          size: 'M',
          color: 'Gray',
          price: 95,
          salePrice: 90,
        },
      ]

      // Use a loop to create and save each product variation
      for (const variationData of variationsData) {
        const variation = new Variation()
        variation.fill(variationData)
        await variation.related('product').associate(product)
        await variation.save()
      }
    }
  }
}
