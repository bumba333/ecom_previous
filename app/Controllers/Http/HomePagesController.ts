import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Category from 'App/Models/Category'
import Product from 'App/Models/Product'

export default class HomePagesController {
  // Method to retrieve top-selling products
  public async getTopSellingProducts({ response }: HttpContextContract) {
    try {
      /* // Query the inventory table to get products with the highest total sold
      const topSellingProducts = await Inventory.query()
        .preload('variation', (query) => {
          query.preload('product').preload('images')
        })
        .orderBy('totalSold', 'desc')
        .limit(8) // You can adjust the limit as */

      /* // Query the Product table to get top-selling products
      const topSellingProducts = await Product.query().preload('variations', (query) => {
        query
          .join('inventories', 'product_variations.id', '=', 'inventories.product_variation_id')
          .select('product_variations.*')
          .sum('inventories.totalSold as totalSold')
          .groupBy('product_variations.id')
          .orderBy('totalSold', 'desc')
          .limit(8)
          .preload('images') // Preload images for each variation
      }) */
      /* const topSellingProducts = await Product.query().preload('variations', (query) => {
        query
          .preload('inventory', (query) => {
            query.orderBy('total_sold')
          })
          .preload('images')
          .limit(8)
      }) */
      const topSellingProducts = await Product.query()
        .preload('variations', (query) => {
          query
            .preload('inventory', (inventoryQuery) => {
              inventoryQuery.orderBy('total_sold')
            })
            .preload('images')
        })
        .limit(8)

      type TopSellingProduct = {
        topSellingProduct: Product
      }
      // Create an array to store the top-selling product details
      const topSellingProductDetail: TopSellingProduct[] = []
      for (const product of topSellingProducts) {
        const result = await product.getAverageReviewScore(product.id)
        if (result) {
          product.averageReviewScore = result.averageScore
          product.totalReviews = result.totalReviews
        } else {
          product.averageReviewScore = 0
          product.totalReviews = 0
        }
        topSellingProductDetail.push({
          topSellingProduct: product,
          // Add other product details you want to include
        })
      }

      return response.status(200).json({
        message: 'Top-selling products retrieved successfully',
        topSellingProductDetail,
      })
    } catch (error) {
      console.error('Error retrieving top-selling products:', error)
      return response.status(500).json({
        message: 'An error occurred while retrieving top-selling products.',
        error: error.message,
      })
    }
  }

  /* public async getTopSellingProductsByCategory({ params, response }: HttpContextContract) {
    try {
      const { categoryId } = params

      // Fetch the category by ID to ensure it exists
      const category = await Category.find(categoryId)

      if (!category) {
        return response.status(404).json({ message: 'Category not found' })
      }

      // Query the database to get top-selling products within the specified category
      const topSellingProducts = await Product.query()
        .join('product_variations', 'products.id', '=', 'product_variations.product_id')
        .join('inventories', 'product_variations.id', '=', 'inventories.product_variation_id')
        .select(
          'products.id as id',
          'products.title as name',
          'products.description as description'
        )
        .sum('inventories.total_sold as totalSold')
        .whereHas('categories', (builder) => {
          builder.where('id', categoryId)
        })
        .groupBy('products.id', 'products.title', 'products.description')
        .orderBy('totalSold', 'desc')
        .limit(8)

      return response.status(200).json({
        message: 'Top-selling products by category retrieved successfully',
        topSellingProducts,
      })
    } catch (error) {
      console.error('Error fetching top-selling products by category:', error)
      return response.status(500).json({
        message: 'An error occurred while fetching top-selling products by category.',
        error: error.message,
      })
    }
  } */

  public async getTopSellingProductsByCategory({ params, response }: HttpContextContract) {
    try {
      const { categoryId } = params

      // Fetch the category by ID to ensure it exists
      const category = await Category.find(categoryId)

      if (!category) {
        return response.status(404).json({ message: 'Category not found' })
      }

      const topSellingProducts = await Product.query()
        .whereHas('categories', (builder) => {
          builder.where('id', categoryId)
        })
        .preload('variations', (query) => {
          query
            .preload('inventory', (query) => {
              query.orderBy('total_sold')
            })
            .preload('images')
            .limit(8)
        })

      // Define a type for the top-selling product details
      type TopSellingProduct = {
        product: Product
      }

      // Create an array to store the top-selling product details
      const topSellingProductDetails: TopSellingProduct[] = []

      for (const product of topSellingProducts) {
        const result = await product.getAverageReviewScore(product.id)
        if (result) {
          product.averageReviewScore = result.averageScore
          product.totalReviews = result.totalReviews
        } else {
          product.averageReviewScore = 0
          product.totalReviews = 0
        }
        topSellingProductDetails.push({
          product: product,
          // Add other product details you want to include
        })
      }

      /* for (const productVariation of topSellingProducts) {
        // Find the ProductVariation
        const product = await Product.find(productVariation.productId)

        if (product) {
          // Use a leftOuterJoinRelated query to load the inventory relationship
          const productWithInventory = await Product.query()
            .where('id', product.id)
            .preload('variations', (query) => {
              query.where('id', productVariation.id).preload('inventory')
            })
            .firstOrFail()

          const inventory = productWithInventory.variations[0]?.inventory

          if (inventory) {
            topSellingProductDetails.push({
              id: productVariation.id,
              product: product,
              name: product.title,
              description: product.description,
              totalSold: inventory.totalSold,
            })
          }
        }
      } */

      return response.status(200).json({
        message: 'Top-selling products by category retrieved successfully',
        topSellingProductDetails,
      })
    } catch (error) {
      console.error('Error fetching top-selling products by category:', error)
      return response.status(500).json({
        message: 'An error occurred while fetching top-selling products by category.',
        error: error.message,
      })
    }
  }
  public async getLatestProducts({ response }) {
    try {
      // Query the database to get the latest products
      const latestProducts = await Product.query()
        .orderBy('created_at', 'desc') // Sort by createdAt in descending order
        .limit(8)
        .preload('variations', (query) => {
          query.preload('images')
        }) // You can adjust the limit as needed

      // Define a type for the latest product details
      type LatestProduct = {
        product: Product
        createdAt: string // Adjust the data type based on your model
        // Add other product details you want to include
      }

      // Create an array to store the latest product details
      const latestProductDetails: LatestProduct[] = []

      for (const product of latestProducts) {
        const result = await product.getAverageReviewScore(product.id)
        if (result) {
          product.averageReviewScore = result.averageScore
          product.totalReviews = result.totalReviews
        } else {
          product.averageReviewScore = 0
          product.totalReviews = 0
        }
        latestProductDetails.push({
          product: product,
          createdAt: product.createdAt.toString(), // Convert createdAt to string
          // Add other product details you want to include
        })
      }

      return response.status(200).json({
        message: 'Latest products retrieved successfully',
        latestProducts: latestProductDetails,
      })
    } catch (error) {
      console.error('Error fetching latest products:', error)
      return response.status(500).json({
        message: 'An error occurred while fetching latest products.',
        error: error.message,
      })
    }
  }

  public async getFeaturedProducts({ response }) {
    try {
      // Query the database to get featured products
      const featuredProducts = await Product.query()
        .where('featured', true) // Filter products where featured is true
        .limit(8) // You can adjust the limit as needed

      // Define a type for the featured product details
      type FeaturedProduct = {
        product: Product
        name: string
        // Add other product details you want to include
      }

      // Create an array to store the featured product details
      const featuredProductDetails: FeaturedProduct[] = []

      for (const product of featuredProducts) {
        const result = await product.getAverageReviewScore(product.id)
        if (result) {
          product.averageReviewScore = result.averageScore
          product.totalReviews = result.totalReviews
        } else {
          product.averageReviewScore = 0
          product.totalReviews = 0
        }
        featuredProductDetails.push({
          product: product,
          name: product.title, // You might need to adjust this based on your model structure
          // Add other product details you want to include
        })
        await product.load('categories')
        await product.load('subcategories')
        await product.load('brand')
        await product.load('variations')
        await product.load('tags')
        for (const variation of product.variations) {
          await variation.load('images')
        }
      }

      return response.status(200).json({
        message: 'Featured products retrieved successfully',
        featuredProducts: featuredProductDetails,
      })
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return response.status(500).json({
        message: 'An error occurred while fetching featured products.',
        error: error.message,
      })
    }
  }
}
